/**
 * GOBIND PATEL — BESPOKE CERTIFICATE & ACCREDITATION ENGINE
 * Dynamic filtering, real-time search, responsive modal document viewer (PDF & Image).
 * Zero dependencies • Accessible • Mobile responsive
 */

(function () {
  'use strict';

  // 14 Verified Certificates & Transcripts Manifest Data
  const CERTIFICATES_DATA = [
    {
      id: "cert-chakravyuh-2026",
      title: "2nd Prize Winner — CHAKRAVYUH 1.0 National Hackathon",
      category: "Achievements",
      issuer: "GITA Autonomous College & Sri Sri University",
      issueDate: "January 31, 2026",
      credentialId: null,
      verificationUrl: null,
      documentPath: "assets/certificates/chakravyuh-hackathon-2nd-prize.pdf",
      thumbnailPath: "assets/certificates/thumbnails/chakravyuh-hackathon-2nd-prize-thumb.webp",
      thumbnailFallback: "assets/certificates/thumbnails/chakravyuh-hackathon-2nd-prize-thumb.jpg",
      docType: "pdf",
      pages: 2,
      skills: ["Human-AI Memory Continuity", "State Serialization", "Temporal Context Graphs", "Hackathon Sprint"],
      description: "Won 2nd Prize in a 36-hour National Level Hackathon among collegiate teams across India. Engineered the Human-AI Memory Continuity System, designing temporal context graphs and state snapshotting to eliminate conversational amnesia in distributed AI interactions.",
      featured: true,
      badge: "🏆 2nd Prize Winner"
    },
    {
      id: "cert-msme-genai-2026",
      title: "Generative AI Specialist Certification",
      category: "Internships",
      issuer: "Central Tool Room & Training Centre (CTTC), Ministry of MSME, Govt. of India",
      issueDate: "June 13, 2026",
      credentialId: "BBST462605000086",
      verificationUrl: "https://www.cttc.gov.in",
      documentPath: "assets/certificates/cttc-msme-generative-ai.pdf",
      thumbnailPath: "assets/certificates/thumbnails/cttc-msme-generative-ai-thumb.webp",
      thumbnailFallback: "assets/certificates/thumbnails/cttc-msme-generative-ai-thumb.jpg",
      docType: "pdf",
      pages: 2,
      skills: ["Deep Learning", "Transfer Learning", "RNN/LSTM", "LLM", "Hugging Face", "LangChain", "RAG Pipelines", "Capstone Projects"],
      description: "Government of India MSME accredited industrial certification covering Deep Learning, Recurrent Neural Networks, LangChain orchestration, RAG architectures with vector embeddings, and production-ready enterprise GenAI application deployment.",
      featured: true,
      badge: "Govt. Accredited"
    },
    {
      id: "cert-ibm-agentic-ai-2025",
      title: "Agentic AI Architect — Project Based Learning",
      category: "Additional Courses",
      issuer: "IBM SkillsBuild & CSRBOX Foundation",
      issueDate: "August 7, 2025",
      credentialId: "AAI2025CSRBOX4413",
      verificationUrl: "https://skillsbuild.org",
      documentPath: "assets/certificates/ibm-skillsbuild-agentic-ai-2025.pdf",
      thumbnailPath: "assets/certificates/thumbnails/ibm-skillsbuild-agentic-ai-2025-thumb.webp",
      thumbnailFallback: "assets/certificates/thumbnails/ibm-skillsbuild-agentic-ai-2025-thumb.jpg",
      docType: "pdf",
      pages: 1,
      skills: ["Agentic AI", "Autonomous Agents", "AI Architectures", "Multi-Agent Systems", "Task Orchestration"],
      description: "4-week intensive IBM SkillsBuild Project Based Learning Program (July 4 – August 7, 2025) on 'Agentic AI: From Learner to Builder – Become an AI Agent Architect'. Designed and implemented autonomous multi-agent task orchestration workflows.",
      featured: true,
      badge: "IBM Certified"
    },
    {
      id: "cert-ibm-ai-internship-2024",
      title: "Artificial Intelligence Summer Internship",
      category: "Internships",
      issuer: "IBM SkillsBuild & CSRBOX Foundation",
      issueDate: "August 5, 2024",
      credentialId: "1nfX8ThIXQe58uhoSNy9qghg0MD9s4fmF",
      verificationUrl: "https://skillsbuild.org",
      documentPath: "assets/certificates/ibm-skillsbuild-ai-internship-2024.pdf",
      thumbnailPath: "assets/certificates/thumbnails/ibm-skillsbuild-ai-internship-2024-thumb.webp",
      thumbnailFallback: "assets/certificates/thumbnails/ibm-skillsbuild-ai-internship-2024-thumb.jpg",
      docType: "pdf",
      pages: 1,
      skills: ["Artificial Intelligence", "Machine Learning Fundamentals", "Data Preprocessing", "Neural Networks"],
      description: "Completed IBM SkillsBuild Summer Internship Program with CSRBOX (Internship ID: IBMSB24AISI15Jy5AtCB, Unique ID: IBM6078) focusing on core AI algorithms, data transformation, and model evaluation protocols.",
      featured: false,
      badge: "IBM Internship"
    },
    {
      id: "cert-ocac-fullstack-2025",
      title: "Software Engineering — Full Stack Development Internship",
      category: "Internships",
      issuer: "Odisha Computer Application Centre (OCAC), Govt. of Odisha",
      issueDate: "August 2, 2025",
      credentialId: "SENG-01256200225",
      verificationUrl: "https://ocac.odisha.gov.in",
      documentPath: "assets/certificates/ocac-fullstack-software-engineering.pdf",
      thumbnailPath: "assets/certificates/thumbnails/ocac-fullstack-software-engineering-thumb.webp",
      thumbnailFallback: "assets/certificates/thumbnails/ocac-fullstack-software-engineering-thumb.jpg",
      docType: "pdf",
      pages: 1,
      skills: ["Full Stack Development", "Python", "JavaScript", "MySQL", "Web Applications", "State IT Systems"],
      description: "Industrial Software Engineering internship at OCAC, Directorate of Electronics & IT, Government of Odisha. Developed responsive full-stack modules and automated digital workflows using Python, JavaScript, and MySQL.",
      featured: true,
      badge: "Govt. of Odisha"
    },
    {
      id: "cert-msme-python-2024",
      title: "Python Programming & Django Certification",
      category: "Internships",
      issuer: "Central Tool Room & Training Centre (CTTC), Ministry of MSME, Govt. of India",
      issueDate: "May 31, 2024",
      credentialId: "BBST202405000849",
      verificationUrl: "https://www.cttc.gov.in",
      documentPath: "assets/certificates/cttc-msme-python-programming.pdf",
      thumbnailPath: "assets/certificates/thumbnails/cttc-msme-python-programming-thumb.webp",
      thumbnailFallback: "assets/certificates/thumbnails/cttc-msme-python-programming-thumb.jpg",
      docType: "pdf",
      pages: 2,
      skills: ["Python OOP", "Data Structures", "Database Programming", "GUI Programming", "Machine Learning Packages", "Django Web Framework"],
      description: "Comprehensive industrial training covering Python Object-Oriented Programming, database connectivity, GUI application architecture, scientific and ML packages, and full-stack web applications with Django.",
      featured: false,
      badge: "Govt. Accredited"
    },
    {
      id: "cert-msme-c-2025",
      title: "C Systems Programming Certification",
      category: "Internships",
      issuer: "Central Tool Room & Training Centre (CTTC), Ministry of MSME, Govt. of India",
      issueDate: "July 15, 2025",
      credentialId: "BBST622506001137",
      verificationUrl: "https://www.cttc.gov.in",
      documentPath: "assets/certificates/cttc-msme-c-programming.pdf",
      thumbnailPath: "assets/certificates/thumbnails/cttc-msme-c-programming-thumb.webp",
      thumbnailFallback: "assets/certificates/thumbnails/cttc-msme-c-programming-thumb.jpg",
      docType: "pdf",
      pages: 2,
      skills: ["C Programming", "Pointers", "Dynamic Memory Allocation", "Data Structures", "File Handling", "Preprocessor"],
      description: "In-depth industrial systems software training covering low-level memory management, pointers, dynamic allocation (malloc/free), structures/unions, I/O file streams, and algorithmic problem-solving in ANSI C.",
      featured: false,
      badge: "Govt. Accredited"
    },
    {
      id: "cert-scaler-masterclass-2026",
      title: "Future of Software Engineering in AI Era",
      category: "Additional Courses",
      issuer: "Scaler Masterclass",
      issueDate: "May 24, 2026",
      credentialId: null,
      verificationUrl: "https://www.scaler.com",
      documentPath: "assets/certificates/scaler-future-software-engineering-ai.png",
      thumbnailPath: "assets/certificates/thumbnails/scaler-future-software-engineering-ai-thumb.webp",
      thumbnailFallback: "assets/certificates/thumbnails/scaler-future-software-engineering-ai-thumb.jpg",
      docType: "image",
      pages: 1,
      skills: ["AI-Assisted Engineering", "LLM-Driven Systems", "Software Architecture", "Modern Dev Workflows"],
      description: "Masterclass on modern software engineering practices, system architectures, and AI tooling led by Scaler co-founders Anshuman Singh and Abhimanyu Saxena.",
      featured: false,
      badge: "Scaler Verified"
    },
    {
      id: "cert-be10x-ai-tools-2026",
      title: "AI Tools & Prompt Engineering Workshop",
      category: "Additional Courses",
      issuer: "be10x",
      issueDate: "February 22, 2026",
      credentialId: null,
      verificationUrl: null,
      documentPath: "assets/certificates/be10x-ai-tools-workshop.pdf",
      thumbnailPath: "assets/certificates/thumbnails/be10x-ai-tools-workshop-thumb.webp",
      thumbnailFallback: "assets/certificates/thumbnails/be10x-ai-tools-workshop-thumb.jpg",
      docType: "pdf",
      pages: 1,
      skills: ["Prompt Engineering", "ChatGPT", "Rapid Prototyping", "AI Data Analysis", "AI Debugging"],
      description: "Verified completion of AI Tools & ChatGPT workshop covering AI-accelerated presentation generation, automated data analysis workflows, and AI-assisted code synthesis and debugging.",
      featured: false,
      badge: "be10X Verified"
    },
    {
      id: "cert-ideathon-ssu-2026",
      title: "IDEATHON 2026 — AI & Data Science Innovation",
      category: "Extracurricular",
      issuer: "School of AI & Data Science, Sri Sri University & IBM ICE",
      issueDate: "February 24, 2026",
      credentialId: null,
      verificationUrl: null,
      documentPath: "assets/certificates/ideathon-2026-sri-sri-university.jpg",
      thumbnailPath: "assets/certificates/thumbnails/ideathon-2026-sri-sri-university-thumb.webp",
      thumbnailFallback: "assets/certificates/thumbnails/ideathon-2026-sri-sri-university-thumb.jpg",
      docType: "image",
      pages: 1,
      skills: ["Innovation Sprint", "Problem Solving", "Idea Pitching", "Data Science Applications", "AI Collaboration"],
      description: "Active participation in IDEATHON 2026 organized by the School of AI and Data Science in collaboration with IBM Innovation Centre for Education and Institution's Innovation Council.",
      featured: false,
      badge: "Ideathon Finalist"
    },
    {
      id: "cert-ssuimun-g20-2023",
      title: "SSUIMUN G20 Summit — Model United Nations Delegate",
      category: "Extracurricular",
      issuer: "Sri Sri University International Model United Nations (SSUIMUN)",
      issueDate: "September 12, 2023",
      credentialId: "SSU/DSW/IMUN/23-24/174",
      verificationUrl: null,
      documentPath: "assets/certificates/ssuimun-g20-summit-delegate.pdf",
      thumbnailPath: "assets/certificates/thumbnails/ssuimun-g20-summit-delegate-thumb.webp",
      thumbnailFallback: "assets/certificates/thumbnails/ssuimun-g20-summit-delegate-thumb.jpg",
      docType: "pdf",
      pages: 1,
      skills: ["Public Diplomacy", "Geopolitical Analysis", "Strategic Negotiation", "Policy Formulation"],
      description: "Served as active Delegate at the Sri Sri University International Model United Nations G20 Summit, formulating strategic policy resolutions and engaging in international multilateral debates.",
      featured: false,
      badge: "MUN Delegate"
    },
    {
      id: "cert-ssu-btech-transcript",
      title: "Official B.Tech Academic Transcript (Semesters I – VI)",
      category: "Achievements",
      issuer: "Faculty of Engineering & Technology, Sri Sri University",
      issueDate: "July 20, 2026",
      credentialId: "FET-BAML-2023-27-022",
      verificationUrl: "https://srisriuniversity.edu.in",
      documentPath: "assets/certificates/sri-sri-university-btech-transcript.pdf",
      thumbnailPath: "assets/certificates/thumbnails/sri-sri-university-btech-transcript-thumb.webp",
      thumbnailFallback: "assets/certificates/thumbnails/sri-sri-university-btech-transcript-thumb.jpg",
      docType: "pdf",
      pages: 6,
      skills: ["Computer Science (AI/ML)", "Data Structures & Algorithms", "Operating Systems", "DBMS", "Computer Networks", "High Performance Computing"],
      description: "Complete 6-semester official mark sheets for Bachelor of Technology in Computer Science and Engineering (AI/ML). Outstanding cumulative record with CGPA of 8.89/10, graduating with First Division with Distinction.",
      featured: true,
      badge: "CGPA: 8.89 / 10"
    },
    {
      id: "cert-cbse-class-xii-2023",
      title: "Class XII Senior School Certificate (CBSE)",
      category: "Achievements",
      issuer: "Central Board of Secondary Education (CBSE) & SAI International School",
      issueDate: "May 12, 2023",
      credentialId: "Roll No. 12652417",
      verificationUrl: "https://cbse.gov.in",
      documentPath: "assets/certificates/cbse-class-xii-marksheet-certificate.pdf",
      thumbnailPath: "assets/certificates/thumbnails/cbse-class-xii-marksheet-certificate-thumb.webp",
      thumbnailFallback: "assets/certificates/thumbnails/cbse-class-xii-marksheet-certificate-thumb.jpg",
      docType: "pdf",
      pages: 1,
      skills: ["Mathematics (91/100, A1)", "English Core (91/100, A1)", "Chemistry (85/100, A2)", "Physical Education (91/100, A2)", "Painting (97/100, A1)"],
      description: "Senior School Certificate Examination (2023) Marks Statement cum Certificate from CBSE. Graduated with A1 distinction in Mathematics, English Core, and Painting.",
      featured: false,
      badge: "CBSE Class XII"
    },
    {
      id: "cert-cbse-class-x-2021",
      title: "Class X Secondary School Certificate (CBSE)",
      category: "Achievements",
      issuer: "Central Board of Secondary Education (CBSE) & SAI International School",
      issueDate: "August 3, 2021",
      credentialId: "Roll No. 12127554",
      verificationUrl: "https://cbse.gov.in",
      documentPath: "assets/certificates/cbse-class-x-marksheet-certificate.pdf",
      thumbnailPath: "assets/certificates/thumbnails/cbse-class-x-marksheet-certificate-thumb.webp",
      thumbnailFallback: "assets/certificates/thumbnails/cbse-class-x-marksheet-certificate-thumb.jpg",
      docType: "pdf",
      pages: 1,
      skills: ["English (95/100, A1)", "Odia (98/100, A1)", "Mathematics Standard (91/100, A1)", "Science (93/100, A1)", "Social Science (94/100, A1)"],
      description: "Secondary School Examination (2021) Marks Statement cum Certificate from CBSE. Flawless A1 grades across all 5 subjects: Odia (98), English (95), Social Science (94), Science (93), and Mathematics (91).",
      featured: false,
      badge: "CBSE Class X • All A1"
    }
  ];

  // State Management
  let currentFilter = 'all';
  let searchQuery = '';

  // DOM Elements cache
  let dom = {
    grid: null,
    searchInput: null,
    searchClear: null,
    filterButtons: [],
    modalOverlay: null,
    modalContent: null,
    modalCloseBtn: null
  };

  function init() {
    dom.grid = document.getElementById('cert-grid-container');
    dom.searchInput = document.getElementById('cert-search-input');
    dom.searchClear = document.getElementById('cert-search-clear');
    dom.filterButtons = Array.from(document.querySelectorAll('.cert-filter-btn'));
    dom.modalOverlay = document.getElementById('project-modal');
    dom.modalContent = document.getElementById('modal-dynamic-content');
    dom.modalCloseBtn = document.getElementById('modal-close-btn');

    if (!dom.grid) return;

    // Attach search events
    if (dom.searchInput) {
      dom.searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        if (dom.searchClear) {
          dom.searchClear.classList.toggle('active', searchQuery.length > 0);
        }
        renderCards();
      });
    }

    if (dom.searchClear) {
      dom.searchClear.addEventListener('click', () => {
        if (dom.searchInput) {
          dom.searchInput.value = '';
          searchQuery = '';
          dom.searchClear.classList.remove('active');
          dom.searchInput.focus();
          renderCards();
        }
      });
    }

    // Attach filter button events
    dom.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category');
        setFilter(cat);
      });
    });

    // Global delegation for View Certificate buttons (including Timeline buttons)
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-open-cert]');
      if (trigger) {
        e.preventDefault();
        const certId = trigger.getAttribute('data-open-cert');
        openCertificateModal(certId, trigger);
      }

      const copyBtn = e.target.closest('.cert-copy-id-btn');
      if (copyBtn) {
        e.preventDefault();
        e.stopPropagation();
        const textToCopy = copyBtn.getAttribute('data-copy-id');
        if (textToCopy) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            showCopyToast(`Copied ID: ${textToCopy}`);
          }).catch(() => {
            // Fallback
            showCopyToast(`ID: ${textToCopy}`);
          });
        }
      }
    });

    // Initial render
    renderCards();

    // Check URL hash for direct certificate deep link e.g. #cert-chakravyuh-2026
    const hash = window.location.hash;
    if (hash && hash.startsWith('#cert-')) {
      const targetCertId = hash.substring(1);
      setTimeout(() => {
        openCertificateModal(targetCertId);
      }, 500);
    }
  }

  function setFilter(category) {
    currentFilter = category;
    dom.filterButtons.forEach(btn => {
      const match = btn.getAttribute('data-category') === category;
      btn.classList.toggle('active', match);
      btn.setAttribute('aria-selected', match ? 'true' : 'false');
    });
    renderCards();
  }

  function getFilteredCertificates() {
    return CERTIFICATES_DATA.filter(cert => {
      const matchesCategory = currentFilter === 'all' || cert.category === currentFilter;
      if (!matchesCategory) return false;

      if (!searchQuery) return true;

      const searchable = [
        cert.title,
        cert.issuer,
        cert.category,
        cert.credentialId || '',
        cert.description,
        ...(cert.skills || [])
      ].join(' ').toLowerCase();

      return searchable.includes(searchQuery);
    });
  }

  function updateFilterCounts() {
    dom.filterButtons.forEach(btn => {
      const cat = btn.getAttribute('data-category');
      const countEl = btn.querySelector('.cert-filter-count');
      if (countEl) {
        let count = 0;
        if (cat === 'all') {
          count = CERTIFICATES_DATA.filter(c => {
            if (!searchQuery) return true;
            return [c.title, c.issuer, c.category, c.credentialId || '', c.description, ...(c.skills || [])].join(' ').toLowerCase().includes(searchQuery);
          }).length;
        } else {
          count = CERTIFICATES_DATA.filter(c => {
            if (c.category !== cat) return false;
            if (!searchQuery) return true;
            return [c.title, c.issuer, c.category, c.credentialId || '', c.description, ...(c.skills || [])].join(' ').toLowerCase().includes(searchQuery);
          }).length;
        }
        countEl.textContent = count;
      }
    });
  }

  function renderCards() {
    if (!dom.grid) return;

    updateFilterCounts();
    const items = getFilteredCertificates();

    if (items.length === 0) {
      dom.grid.innerHTML = `
        <div class="cert-empty-state" role="status" aria-live="polite">
          <div class="cert-empty-icon">🔍</div>
          <h3 class="cert-empty-title">No Credentials Match</h3>
          <p class="cert-empty-desc">
            No certificates found matching <strong>"${escapeHtml(searchQuery)}"</strong> in this category.
          </p>
          <button class="btn btn-secondary btn-sm" onclick="window.CertificatesEngine && window.CertificatesEngine.resetFilters()">
            <span>Reset Search & Filters</span>
          </button>
        </div>
      `;
      return;
    }

    const cardsHtml = items.map(cert => {
      const skillsHtml = cert.skills.slice(0, 4).map(skill => 
        `<span class="cert-skill-pill">${escapeHtml(skill)}</span>`
      ).join('');

      const idChipHtml = cert.credentialId ? `
        <div class="cert-id-chip" title="Credential ID">
          <span class="cert-id-label">ID:</span>
          <span>${escapeHtml(cert.credentialId)}</span>
          <button class="cert-copy-id-btn" data-copy-id="${escapeHtml(cert.credentialId)}" aria-label="Copy Credential ID" title="Copy to clipboard">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
        </div>
      ` : '';

      const verifyLinkHtml = cert.verificationUrl ? `
        <a href="${escapeHtml(cert.verificationUrl)}" target="_blank" rel="noopener noreferrer" class="cert-btn-secondary" title="Verify Online">
          <span>Verify</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>
      ` : '';

      const downloadActionLabel = cert.docType === 'pdf' ? 'PDF' : 'IMG';

      return `
        <article class="cert-card ${cert.featured ? 'featured-cert' : ''}" data-cert-id="${cert.id}">
          <div class="cert-card-badge">${escapeHtml(cert.badge)}</div>
          <div class="cert-doc-type-badge">${cert.docType.toUpperCase()}${cert.pages > 1 ? ` • ${cert.pages}P` : ''}</div>

          <div class="cert-thumb-wrap" data-open-cert="${cert.id}" role="button" tabindex="0" aria-label="View Certificate: ${escapeHtml(cert.title)}">
            <picture>
              <source srcset="${cert.thumbnailPath}" type="image/webp" />
              <img src="${cert.thumbnailFallback}" alt="${escapeHtml(cert.title)} Document Preview" class="cert-thumb-img" loading="lazy" width="640" height="420" />
            </picture>
            <div class="cert-thumb-overlay">
              <span class="cert-preview-badge">
                <span>View Certificate</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </span>
            </div>
          </div>

          <div class="cert-body">
            <div class="cert-meta-row">
              <span class="cert-category-tag">${escapeHtml(cert.category)}</span>
              <span class="cert-date">${escapeHtml(cert.issueDate)}</span>
            </div>

            <h3 class="cert-title">${escapeHtml(cert.title)}</h3>

            <div class="cert-issuer">
              <svg class="cert-issuer-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
              <span>${escapeHtml(cert.issuer)}</span>
            </div>

            ${idChipHtml}

            <p class="cert-desc">${escapeHtml(cert.description)}</p>

            <div class="cert-skills-strip">
              ${skillsHtml}
            </div>

            <div class="cert-actions">
              <button class="cert-btn-primary" data-open-cert="${cert.id}">
                <span>View Document</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </button>
              <a href="${cert.documentPath}" download="${cert.documentPath.split('/').pop()}" class="cert-btn-secondary" title="Download ${downloadActionLabel}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                <span>${downloadActionLabel}</span>
              </a>
              ${verifyLinkHtml}
            </div>
          </div>
        </article>
      `;
    }).join('');

    dom.grid.innerHTML = cardsHtml;
  }

  /**
   * Certificate Viewer Modal Implementation
   */
  function openCertificateModal(certId, triggerEl) {
    const cert = CERTIFICATES_DATA.find(c => c.id === certId);
    if (!cert) return;

    if (!dom.modalOverlay || !dom.modalContent) {
      dom.modalOverlay = document.getElementById('project-modal');
      dom.modalContent = document.getElementById('modal-dynamic-content');
      dom.modalCloseBtn = document.getElementById('modal-close-btn');
    }

    if (!dom.modalOverlay || !dom.modalContent) return;

    const isPdf = cert.docType === 'pdf';
    const filename = cert.documentPath.split('/').pop();

    const skillsHtml = cert.skills.map(s => 
      `<span class="tech-tag" style="font-size: 0.72rem;">${escapeHtml(s)}</span>`
    ).join('');

    const idHtml = cert.credentialId ? `
      <div style="display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-highlight); margin-top: 0.35rem;">
        <span style="color: var(--text-muted);">CREDENTIAL ID:</span>
        <strong style="color: #fff; letter-spacing: 0.05em;">${escapeHtml(cert.credentialId)}</strong>
        <button class="cert-copy-id-btn" data-copy-id="${escapeHtml(cert.credentialId)}" aria-label="Copy ID" title="Copy to clipboard">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button>
      </div>
    ` : '';

    const verifyBtnHtml = cert.verificationUrl ? `
      <a href="${escapeHtml(cert.verificationUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
        <span>Verify Link</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
      </a>
    ` : '';

    // Document viewport area
    let viewerContent = '';
    if (isPdf) {
      viewerContent = `
        <div class="modal-stagger-2" style="width: 100%; height: min(74vh, 780px); border-radius: 12px; overflow: hidden; border: 1px solid var(--border-glass); background: #0c0d14; position: relative;">
          <iframe 
            src="${cert.documentPath}#toolbar=1&navpanes=0" 
            width="100%" 
            height="100%" 
            title="${escapeHtml(cert.title)}"
            style="border: none; display: block;" 
            loading="lazy"
          >
            <p style="padding: 2rem; color: #fff; text-align: center;">
              Your browser does not support inline PDFs. 
              <a href="${cert.documentPath}" target="_blank" class="btn btn-primary btn-sm" style="margin-top: 1rem; display: inline-block;">
                Download or View PDF (${filename})
              </a>
            </p>
          </iframe>
        </div>
      `;
    } else {
      viewerContent = `
        <div class="modal-stagger-2" style="width: 100%; min-height: 400px; max-height: min(74vh, 780px); border-radius: 12px; overflow: auto; border: 1px solid var(--border-glass); background: #0c0d14; display: flex; align-items: center; justify-content: center; padding: 1rem;">
          <img 
            src="${cert.documentPath}" 
            alt="${escapeHtml(cert.title)}" 
            style="max-width: 100%; max-height: min(70vh, 740px); object-fit: contain; border-radius: 8px; box-shadow: 0 15px 40px rgba(0,0,0,0.6);" 
          />
        </div>
      `;
    }

    dom.modalContent.innerHTML = `
      <div style="padding: clamp(1.25rem, 3.5vw, 2.5rem);">
        <!-- Modal Header -->
        <div class="modal-stagger-1" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div style="max-width: 680px;">
            <div style="display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.45rem; flex-wrap: wrap;">
              <span style="font-family: var(--font-editorial); font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent-primary); font-weight: 700;">
                ${escapeHtml(cert.category)}
              </span>
              <span style="color: var(--text-muted); font-size: 0.75rem;">•</span>
              <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">
                ${escapeHtml(cert.issueDate)}
              </span>
              <span style="padding: 0.2rem 0.55rem; border-radius: 4px; background: rgba(212, 175, 55, 0.15); border: 1px solid var(--accent-primary); color: var(--accent-highlight); font-size: 0.68rem; font-weight: 700; font-family: var(--font-editorial); letter-spacing: 0.08em; text-transform: uppercase;">
                ${escapeHtml(cert.badge)}
              </span>
            </div>
            
            <h2 style="font-family: var(--font-monumental); font-size: clamp(1.35rem, 3vw, 1.85rem); line-height: 1.15; color: #fff; margin-bottom: 0.45rem;">
              ${escapeHtml(cert.title)}
            </h2>
            
            <p style="color: #cbd0e0; font-size: 0.9rem; margin-bottom: 0.25rem;">
              ${escapeHtml(cert.issuer)}
            </p>
            
            ${idHtml}
          </div>

          <!-- Quick Action Buttons -->
          <div style="display: flex; gap: 0.65rem; flex-wrap: wrap;">
            <a href="${cert.documentPath}" download="${filename}" class="btn btn-primary btn-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span>Download (${cert.docType.toUpperCase()})</span>
            </a>
            
            <a href="${cert.documentPath}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              <span>Open in New Tab</span>
            </a>
            
            ${verifyBtnHtml}
          </div>
        </div>

        <!-- Document Viewer Embed -->
        ${viewerContent}

        <!-- Description & Skills Footer -->
        <div class="modal-stagger-3" style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--border-glass);">
          <h4 style="font-family: var(--font-editorial); font-size: 0.78rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent-primary); margin-bottom: 0.5rem;">
            ACHIEVEMENT & CURRICULUM EVIDENCE
          </h4>
          <p style="color: var(--text-muted); font-size: 0.88rem; line-height: 1.6; margin-bottom: 1rem;">
            ${escapeHtml(cert.description)}
          </p>
          <div style="display: flex; flex-wrap: wrap; gap: 0.45rem;">
            ${skillsHtml}
          </div>
        </div>
      </div>
    `;

    // Open Modal with GSAP / Lenis pause
    dom.modalOverlay.classList.add('active');
    dom.modalOverlay.setAttribute('data-lenis-prevent', 'true');
    document.body.style.overflow = 'hidden';

    if (window.lenis && typeof window.lenis.stop === 'function') {
      window.lenis.stop();
    }

    const modalDialog = dom.modalOverlay.querySelector('.modal-dialog');
    if (modalDialog) {
      modalDialog.scrollTop = 0;
      modalDialog.setAttribute('data-lenis-prevent', 'true');
    }

    if (modalDialog && triggerEl) {
      const sourceRect = triggerEl.getBoundingClientRect();
      const dialogRect = modalDialog.getBoundingClientRect();
      const deltaX = (sourceRect.left + sourceRect.width / 2) - (dialogRect.left + dialogRect.width / 2);
      const deltaY = (sourceRect.top + sourceRect.height / 2) - (dialogRect.top + dialogRect.height / 2);

      const anim = modalDialog.animate([
        {
          transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.3, 0.3)`,
          opacity: 0.5,
          filter: 'blur(4px)'
        },
        {
          transform: 'translate3d(0, 0, 0) scale(1, 1)',
          opacity: 1,
          filter: 'blur(0px)'
        }
      ], {
        duration: 380,
        easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
        fill: 'both'
      });

      anim.onfinish = () => {
        anim.cancel();
        modalDialog.style.transform = '';
        modalDialog.style.opacity = '';
        modalDialog.style.filter = '';
      };
    }

    if (window.PortfolioAudio && typeof window.PortfolioAudio.playClick === 'function') {
      window.PortfolioAudio.playClick();
    }
  }

  function showCopyToast(msg) {
    let toast = document.getElementById('cert-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cert-toast';
      toast.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:rgba(18,20,30,0.95);color:#F7E7C4;padding:0.65rem 1.4rem;border-radius:8px;font-size:0.825rem;font-family:var(--font-mono);z-index:100002;pointer-events:none;opacity:0;transition:opacity 0.25s;border:1px solid var(--accent-primary);box-shadow:0 10px 30px rgba(0,0,0,0.8);';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2200);
  }

  function resetFilters() {
    searchQuery = '';
    currentFilter = 'all';
    if (dom.searchInput) dom.searchInput.value = '';
    if (dom.searchClear) dom.searchClear.classList.remove('active');
    dom.filterButtons.forEach(btn => {
      const isAll = btn.getAttribute('data-category') === 'all';
      btn.classList.toggle('active', isAll);
      btn.setAttribute('aria-selected', isAll ? 'true' : 'false');
    });
    renderCards();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Expose engine to window
  window.CertificatesEngine = {
    data: CERTIFICATES_DATA,
    open: openCertificateModal,
    setFilter: setFilter,
    resetFilters: resetFilters
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
