// @ts-check
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Netlify-Fidelity Local HTTP Cache Server
 * Reads netlify.toml [[headers]] rules, applies path matching,
 * computes cryptographic ETags, handles conditional revalidation (304),
 * and serves static assets from MyWebsite.
 */

const projectRoot = path.resolve(__dirname, '..');
const publishDir = path.join(projectRoot, 'MyWebsite');
const netlifyTomlPath = path.join(projectRoot, 'netlify.toml');

// Parse netlify.toml headers
function parseNetlifyHeaders() {
  const content = fs.readFileSync(netlifyTomlPath, 'utf8');
  const rules = [];
  const lines = content.split('\n');
  
  let currentFor = null;
  let currentHeaders = {};
  let inHeaderValues = false;

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith('[[headers]]')) {
      if (currentFor && Object.keys(currentHeaders).length > 0) {
        rules.push({ forPattern: currentFor, headers: currentHeaders });
      }
      currentFor = null;
      currentHeaders = {};
      inHeaderValues = false;
    } else if (line.startsWith('for =')) {
      const match = line.match(/for\s*=\s*["']([^"']+)["']/);
      if (match) currentFor = match[1];
    } else if (line.startsWith('[headers.values]')) {
      inHeaderValues = true;
    } else if (inHeaderValues && line.includes('=')) {
      const eqIdx = line.indexOf('=');
      const key = line.slice(0, eqIdx).trim();
      let val = line.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (key && !key.startsWith('#')) {
        currentHeaders[key] = val;
      }
    }
  }

  if (currentFor && Object.keys(currentHeaders).length > 0) {
    rules.push({ forPattern: currentFor, headers: currentHeaders });
  }

  return rules;
}

const headerRules = parseNetlifyHeaders();

function matchPattern(pattern, reqPath) {
  if (pattern === '/*' || pattern === reqPath) return true;
  if (pattern.endsWith('/*')) {
    const prefix = pattern.slice(0, -2);
    return reqPath.startsWith(prefix + '/') || reqPath === prefix;
  }
  if (pattern.startsWith('/*.')) {
    const ext = pattern.slice(2);
    return reqPath.endsWith(ext);
  }
  if (pattern.includes('/*.')) {
    const [prefix, ext] = pattern.split('/*.');
    return reqPath.startsWith(prefix + '/') && reqPath.endsWith('.' + ext);
  }
  return false;
}

function getHeadersForPath(reqPath) {
  const merged = {};
  for (const rule of headerRules) {
    if (matchPattern(rule.forPattern, reqPath)) {
      Object.assign(merged, rule.headers);
    }
  }
  return merged;
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/x-wav',
  '.woff2': 'font/woff2'
};

function createServer(port = 0) {
  const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    let reqPath = decodeURIComponent(parsedUrl.pathname);
    if (reqPath === '/') reqPath = '/index.html';

    let filePath = path.join(publishDir, reqPath);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(publishDir, '404.html');
      reqPath = '/404.html';
      res.statusCode = 404;
    }

    const stat = fs.statSync(filePath);
    const fileBytes = fs.readFileSync(filePath);
    const etag = `"${crypto.createHash('sha256').update(fileBytes).digest('hex').slice(0, 32)}-etag"`;

    const ext = path.extname(filePath).toLowerCase();
    const defaultMime = MIME_TYPES[ext] || 'application/octet-stream';

    const netlifyHeaders = getHeadersForPath(reqPath);

    // Apply headers
    res.setHeader('Content-Type', netlifyHeaders['Content-Type'] || defaultMime);
    res.setHeader('ETag', etag);
    res.setHeader('Server', 'Netlify-Simulated-Edge');

    for (const [k, v] of Object.entries(netlifyHeaders)) {
      res.setHeader(k, v);
    }

    // Check If-None-Match revalidation
    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch && (ifNoneMatch === etag || ifNoneMatch === '*' || ifNoneMatch.includes(etag))) {
      res.statusCode = 304;
      res.setHeader('Cache-Status', '"Netlify Edge"; hit; ttl=31536000');
      res.end();
      return;
    }

    res.setHeader('Cache-Status', '"Netlify Edge"; fwd=miss; fwd-status=200; stored');
    res.setHeader('Content-Length', fileBytes.length);

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    res.end(fileBytes);
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      const actualPort = server.address().port;
      console.log(`Netlify Cache Server running at http://127.0.0.1:${actualPort}`);
      resolve(server);
    });
  });
}

if (require.main === module) {
  const port = process.env.PORT ? Number(process.env.PORT) : 5173;
  createServer(port);
}

module.exports = { createServer, parseNetlifyHeaders, getHeadersForPath };
