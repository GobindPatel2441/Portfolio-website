/**
 * INTERACTIVE AI LAB & TERMINAL SIMULATOR
 * Demonstrating Gobind Patel's Flagship Systems:
 * 1. Sentix (Emotion Detection + Multilingual Empathy)
 * 2. Medical AI (FAISS Vector RAG + Groq Acceleration)
 * 3. Human-AI Memory Continuity (Hackathon Winner)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Tab Switching
  const tabs = document.querySelectorAll('.term-tab');
  const panels = document.querySelectorAll('.terminal-tab-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;
      tabs.forEach((t) => t.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));

      tab.classList.add('active');
      const activePanel = document.getElementById(target);
      if (activePanel) activePanel.classList.add('active');

      if (target === 'medical-tab' && window.resizeVectorCanvas) {
        setTimeout(window.resizeVectorCanvas, 60);
      }

      if (window.PortfolioAudio) window.PortfolioAudio.playBlip();
    });
  });

  // -------------------------------------------------------------
  // SIMULATION 1: SENTIX EMOTION & TRANSLATION ENGINE
  // -------------------------------------------------------------
  const emotionBtns = document.querySelectorAll('.sentix-emotion-btn');
  const langBtns = document.querySelectorAll('.sentix-lang-btn');
  const runSentixBtn = document.getElementById('run-sentix-sim');
  const sentixOutput = document.getElementById('sentix-stream-text');
  const valenceFill = document.getElementById('sentix-valence-fill');
  const valenceVal = document.getElementById('sentix-valence-val');
  const arousalFill = document.getElementById('sentix-arousal-fill');
  const arousalVal = document.getElementById('sentix-arousal-val');
  const sentixLatency = document.getElementById('sentix-latency');

  let currentEmotion = 'anxious';
  let currentLang = 'hi';

  const emotionProfiles = {
    anxious: {
      valence: '32%',
      valenceNum: '-0.68',
      arousal: '82%',
      arousalNum: '0.82',
      responses: {
        hi: 'नमस्ते। आपके चेहरे के भाव और शब्दों से मैं समझ सकता हूँ कि आप काफी तनाव और दबाव महसूस कर रहे हैं। गहरी सांस लें, सब ठीक हो जाएगा। बताइए, मैं आपकी किस तरह मदद कर सकता हूँ?',
        or: 'ନମସ୍କାର। ଆପଣଙ୍କ ଚେହେରାର ଭାବ ଏବଂ ଶବ୍ଦରୁ ମୁଁ ଅନୁଭବ କରିପାରୁଛି ଯେ ଆପଣ ଚିନ୍ତିତ ଅଛନ୍ତି। ଗଭୀର ନିଶ୍ୱାସ ନିଅନ୍ତୁ, ସବୁ ଠିକ୍ ହୋଇଯିବ। କୁହନ୍ତୁ, ମୁଁ କିପରି ସାହାଯ୍ୟ କରିବି?',
        bn: 'নমস্কার। আপনার মুখের অভিব্যক্তি দেখে বুঝতে পারছি আপনি মানসিক চাপে রয়েছেন। শান্ত হন, সবকিছু ঠিক হয়ে যাবে। আমি আপনাকে কীভাবে সাহায্য করতে পারি বলুন?',
        te: 'నమస్కారం. మీ ముఖ కవళికలు మరియు మాటల నుండి మీరు ఒత్తిడికి లోనవుతున్నారని నేను గ్రహించగలను. ప్రశాంతంగా శ్వాస తీసుకోండి. నేను మీకు ఎలా సహాయపడగలను?',
        ta: 'வணக்கம். உங்கள் முகபாவனையிலிருந்து நீங்கள் மிகவும் மன அழுத்தத்தில் இருப்பதை உணர்கிறேன். அமைதியாக இருங்கள், எல்லாம் சரியாகும். நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?',
        en: 'Hello. From your subtle micro-expressions and words, I sense significant stress and overwhelm. Take a steady, deep breath. I am right here with you. How can I lighten your burden right now?'
      }
    },
    confused: {
      valence: '45%',
      valenceNum: '-0.15',
      arousal: '58%',
      arousalNum: '0.58',
      responses: {
        hi: 'लगता है इस विषय में कुछ जटिलता है। कोई बात नहीं, हम इसे छोटे-छोटे और सरल चरणों में समझेंगे। आपको कहाँ सबसे ज्यादा संशय हो रहा है?',
        or: 'ଲାଗୁଛି ଏହି ବିଷୟରେ କିଛି ଦ୍ୱନ୍ଦ୍ୱ ଅଛି। କୌଣସି ଅସୁବିଧା ନାହିଁ, ଆମେ ଏହାକୁ ସରଳ ଭାବରେ ବୁଝିବା। ଆପଣଙ୍କର ପ୍ରକୃତ ପ୍ରଶ୍ନ କ’ଣ?',
        bn: 'মনে হচ্ছে বিষয়টা কিছুটা জটিল লাগছে। চিন্তার কারণ নেই, আমরা এটি সহজে ধাপে ধাপে বুঝে নেব। আপনার কোথায় বুঝতে অসুবিধা হচ্ছে?',
        te: 'ఈ విషయం కొంత గందరగోళంగా ఉన్నట్లుంది. ఫర్వాలేదు, దీన్ని సులభమైన దశల్లో అర్థం చేసుకుందాం. మీకు ఎక్కడ సందేహం ఉంది?',
        ta: 'இந்த விஷயம் சற்று குழப்பமாக உள்ளதா? பரவாயில்லை, நாம் இதை எளிய படிகளாகப் பிரித்து புரிந்துகொள்வோம். உங்கள் சந்தேகம் என்ன?',
        en: "It looks like things feel a bit tangled or ambiguous. That is completely okay—let's break this down into clear, bite-sized components together. Which part should we untangle first?"
      }
    },
    joyful: {
      valence: '94%',
      valenceNum: '+0.88',
      arousal: '88%',
      arousalNum: '0.88',
      responses: {
        hi: 'अरे वाह! आपकी मुस्कान और सकारात्मक ऊर्जा देखकर बहुत खुशी हुई! आपकी यह सफलता वाकई शानदार है। इस उपलब्धि को लेकर आगे की क्या योजना है?',
        or: 'ଆରେ ବାଃ! ଆପଣଙ୍କ ମୁହଁର ଖୁସି ଦେଖି ମନ ଖୁସି ହୋଇଗଲା! ଏହି ସଫଳତା ପ୍ରକୃତରେ ପ୍ରଶଂସନୀୟ। ଏହାପରେ ଆପଣଙ୍କର କ’ଣ ଯୋଜନା?',
        bn: 'দারুণ! আপনার মুখের উজ্জ্বল হাসি ও ইতিবাচকতা দেখে খুব আনন্দ হচ্ছে! আপনার এই সাফল্য সত্যিই অসাধারণ। এরপর কী করতে চান?',
        te: 'అద్భుతం! మీ చిరునవ్వు మరియు ఉత్సాహం చూస్తుంటే చాలా ఆనందంగా ఉంది! ఈ విజయం నిజంగా గొప్పది. తదుపరి ప్రణాళిక ఏమిటి?',
        ta: 'அருமை! உங்கள் முகத்தில் உள்ள புன்னகையும் மகிழ்ச்சியும் எனக்கு மிகவும் உற்சாகமளிக்கிறது! உங்கள் வெற்றிக்கு மனமார்ந்த வாழ்த்துகள்!',
        en: 'What fantastic energy! Your micro-expression telemetry registers genuine delight (+0.88 valence). Huge congratulations on this win—celebrate it! What exciting milestone are we aiming for next?'
      }
    },
    exhausted: {
      valence: '36%',
      valenceNum: '-0.42',
      arousal: '25%',
      arousalNum: '0.25',
      responses: {
        hi: 'आपकी आंखों में थकान साफ झलक रही है। आपने आज बहुत काम किया है। अभी के लिए जटिल निर्णय टालें और थोड़ा विश्राम अवश्य लें।',
        or: 'ଆପଣଙ୍କ ଆଖିରୁ କ୍ଲାନ୍ତି ସ୍ପଷ୍ଟ ଜଣାପଡୁଛି। ଆଜି ଆପଣ ବହୁତ ପରିଶ୍ରମ କରିଛନ୍ତି। ଦୟାକରି ଟିକେ ବିଶ୍ରାମ ନିଅନ୍ତୁ।',
        bn: 'আপনার চোখে প্রচণ্ড ক্লান্তি স্পষ্ট। আজ নিশ্চয়ই প্রচুর পরিশ্রম করেছেন। এই মুহূর্তে একটু বিশ্রাম নেওয়া আপনার জন্য খুব প্রয়োজন।',
        te: 'మీ కళ్లలో అలసట స్పష్టంగా కనిపిస్తోంది. ఈ రోజు చాలా కష్టపడ్డారు. దయచేసి కొద్దిసేపు విశ్రాంతి తీసుకోండి.',
        ta: 'உங்கள் கண்களில் சோர்வு தெரிகிறது. இன்று நீங்கள் அதிக உழைத்திருக்கிறீர்கள். தயவுசெய்து சிறிது ஓய்வெடுங்கள்.',
        en: 'Biometric telemetry indicates heavy fatigue and low cognitive arousal (0.25). You have been pushing hard. Prioritize resting your eyes and nervous system right now; the code and tasks will wait.'
      }
    }
  };

  emotionBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      emotionBtns.forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentEmotion = btn.dataset.emotion;
      if (window.PortfolioAudio) window.PortfolioAudio.playClick();
    });
  });

  langBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      langBtns.forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentLang = btn.dataset.lang;
      if (window.PortfolioAudio) window.PortfolioAudio.playClick();
    });
  });

  if (runSentixBtn) {
    runSentixBtn.addEventListener('click', () => {
      const profile = emotionProfiles[currentEmotion] || emotionProfiles.anxious;
      const targetText = profile.responses[currentLang] || profile.responses.en;

      // Update gauges
      if (valenceFill) valenceFill.style.width = profile.valence;
      if (valenceVal) valenceVal.textContent = profile.valenceNum;
      if (arousalFill) arousalFill.style.width = profile.arousal;
      if (arousalVal) arousalVal.textContent = profile.arousalNum;
      if (sentixLatency) sentixLatency.textContent = `${Math.floor(28 + Math.random() * 18)}ms`;

      // Typewriter streaming effect
      if (sentixOutput) {
        sentixOutput.textContent = '';
        let i = 0;
        runSentixBtn.disabled = true;
        runSentixBtn.style.opacity = '0.6';

        const timer = setInterval(() => {
          if (i < targetText.length) {
            sentixOutput.textContent += targetText.charAt(i);
            i++;
          } else {
            clearInterval(timer);
            runSentixBtn.disabled = false;
            runSentixBtn.style.opacity = '1';
          }
        }, 18);
      }

      if (window.PortfolioAudio) window.PortfolioAudio.playBlip();
    });
  }

  // -------------------------------------------------------------
  // SIMULATION 2: MEDICAL AI ASSISTANT (FAISS RAG)
  // -------------------------------------------------------------
  const queryBtns = document.querySelectorAll('.medical-query-btn');
  const runMedBtn = document.getElementById('run-med-sim');
  const medVectorScore = document.getElementById('med-vector-score');
  const medGroqSpeed = document.getElementById('med-groq-speed');
  const medDocsList = document.getElementById('med-docs-list');
  const medOutput = document.getElementById('med-stream-text');

  const medicalQueries = {
    hypertension: {
      similarity: '0.964 Cosine',
      groqTps: '154.2 tokens/sec',
      docs: [
        'Doc_402: ACC/AHA Stage 2 Guideline (2024)',
        'Doc_118: ACEi vs ARB in Renal Preservation',
        'Doc_089: Microalbuminuria Screening Protocol'
      ],
      synthesis: `[FAISS Retrieved 3 Chunks • Groq Inference Time: 182ms]
CLINICAL EVIDENCE SYNTHESIS:
1. First-line therapy warrants an ACE Inhibitor (e.g., Lisinopril 10mg) or ARB (Losartan 50mg) to confer renal hemodynamic protection.
2. Target BP: <130/80 mmHg per updated guideline standards.
3. Monitor serum creatinine and potassium levels at 2 weeks post-initiation.
4. Dietary sodium restriction (<2,000 mg/day) and structured aerobic activity recommended.`
    },
    chestpain: {
      similarity: '0.948 Cosine',
      groqTps: '161.8 tokens/sec',
      docs: [
        'Doc_214: HEART Score Validation Study',
        'Doc_531: Atypical Presentation in Non-STEMI',
        'Doc_077: High-Sensitivity Troponin Assay Timing'
      ],
      synthesis: `[FAISS Retrieved 3 Chunks • Groq Inference Time: 174ms]
CLINICAL EVIDENCE SYNTHESIS:
1. Urgent risk-stratification via HEART Score (History, ECG, Age, Risk Factors, Troponin).
2. Obtain stat 12-lead ECG to rule out ST-segment deviations or hyperacute T-waves.
3. High-sensitivity Troponin serial draws at 0h and 2h.
4. Maintain continuous telemetry while ruling out secondary pulmonary or aortic etiologies.`
    },
    metformin: {
      similarity: '0.982 Cosine',
      groqTps: '148.5 tokens/sec',
      docs: [
        'Doc_612: FDA Safety Communication: Metformin & Contrast',
        'Doc_304: Contrast-Induced Nephropathy Prevention',
        'Doc_115: eGFR Threshold Guidance (KDIGO)'
      ],
      synthesis: `[FAISS Retrieved 3 Chunks • Groq Inference Time: 165ms]
CLINICAL EVIDENCE SYNTHESIS:
1. Discontinue Metformin at the time of or prior to iodinated radiocontrast procedure if eGFR <45 mL/min/1.73m².
2. Re-evaluate eGFR 48 hours post-contrast administration.
3. Resume therapy only once renal stability is confirmed to avoid risk of lactic acidosis.
4. Ensure pre- and post-hydration with isotonic saline.`
    }
  };

  let selectedMedQuery = 'hypertension';

  queryBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      queryBtns.forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedMedQuery = btn.dataset.query;
      if (window.setVectorQuery) window.setVectorQuery(selectedMedQuery);
      if (window.PortfolioAudio) window.PortfolioAudio.playClick();
    });
  });

  if (runMedBtn) {
    runMedBtn.addEventListener('click', () => {
      const data = medicalQueries[selectedMedQuery] || medicalQueries.hypertension;
      if (medVectorScore) medVectorScore.textContent = data.similarity;
      if (medGroqSpeed) medGroqSpeed.textContent = data.groqTps;

      if (window.setVectorQuery) window.setVectorQuery(selectedMedQuery);

      if (medDocsList) {
        medDocsList.innerHTML = data.docs
          .map((d) => `<div class="sub-tag" style="color: #00f2fe; margin-bottom: 4px;">✓ ${d}</div>`)
          .join('');
      }

      if (medOutput) {
        medOutput.textContent = '';
        let i = 0;
        runMedBtn.disabled = true;
        runMedBtn.style.opacity = '0.6';

        const timer = setInterval(() => {
          if (i < data.synthesis.length) {
            medOutput.textContent += data.synthesis.charAt(i);
            i += 2;
          } else {
            clearInterval(timer);
            runMedBtn.disabled = false;
            runMedBtn.style.opacity = '1';
          }
        }, 12);
      }

      if (window.PortfolioAudio) window.PortfolioAudio.playBlip();
    });
  }

  // -------------------------------------------------------------
  // 2D LATENT EMBEDDING SPACE CANVAS (FAISS PROJECTION)
  // -------------------------------------------------------------
  const vectorCanvas = document.getElementById('vector-space-canvas');
  const vectorTooltip = document.getElementById('vector-tooltip');
  
  if (vectorCanvas) {
    const ctx = vectorCanvas.getContext('2d');
    let width = 0;
    let height = 0;

    // Realistic clinical document corpus in 2D projected space (PCA/t-SNE)
    const vectorCorpus = [
      { id: 'Doc_402', title: 'ACC/AHA Stage 2 Guideline (2024)', x: 0.28, y: 0.32, domain: 'Cardiology' },
      { id: 'Doc_118', title: 'ACEi vs ARB in Renal Preservation', x: 0.33, y: 0.38, domain: 'Cardio-Renal' },
      { id: 'Doc_089', title: 'Microalbuminuria Screening Protocol', x: 0.36, y: 0.44, domain: 'Nephrology' },
      { id: 'Doc_214', title: 'HEART Score Validation Study', x: 0.18, y: 0.24, domain: 'Emergency Cardiology' },
      { id: 'Doc_531', title: 'Atypical Non-STEMI Presentation', x: 0.22, y: 0.28, domain: 'Ischemia' },
      { id: 'Doc_077', title: 'High-Sensitivity Troponin Assay', x: 0.24, y: 0.18, domain: 'Biomarkers' },
      { id: 'Doc_612', title: 'FDA Metformin & Contrast Advisory', x: 0.74, y: 0.68, domain: 'Pharmacovigilance' },
      { id: 'Doc_304', title: 'Contrast-Induced Nephropathy Protocol', x: 0.68, y: 0.74, domain: 'Renal Safety' },
      { id: 'Doc_115', title: 'eGFR Threshold Guidance (KDIGO)', x: 0.64, y: 0.62, domain: 'Nephrology' },
      { id: 'Doc_198', title: 'Metformin Lactic Acidosis Pathways', x: 0.78, y: 0.76, domain: 'Toxicology' },
      { id: 'Doc_229', title: 'Hydration Protocols (Isotonic Saline)', x: 0.71, y: 0.82, domain: 'Prophylaxis' },
      { id: 'Doc_512', title: 'Glycemic Target HbA1c <7.0%', x: 0.82, y: 0.35, domain: 'Endocrinology' },
      { id: 'Doc_334', title: 'SGLT2i Cardiorenal Protection', x: 0.48, y: 0.52, domain: 'Metabolic' },
      { id: 'Doc_419', title: 'Statins in ASCVD Prevention', x: 0.42, y: 0.26, domain: 'Lipidology' },
      { id: 'Doc_051', title: 'Serum Electrolytes & Hyperkalemia', x: 0.44, y: 0.46, domain: 'Electrolytes' },
      { id: 'Doc_290', title: 'GFR Staging & Dialysis Indications', x: 0.58, y: 0.56, domain: 'Renal Function' }
    ];

    // Query centroid coordinates
    const queryCentroids = {
      hypertension: { x: 0.30, y: 0.35 },
      chestpain: { x: 0.20, y: 0.23 },
      metformin: { x: 0.71, y: 0.70 }
    };

    let queryPos = { x: 0.30, y: 0.35 };
    let targetQueryPos = { x: 0.30, y: 0.35 };
    let isDragging = false;
    let hoveredDoc = null;
    let pulseTime = 0;

    function resizeCanvas() {
      const rect = vectorCanvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;
      vectorCanvas.width = width * dpr;
      vectorCanvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.resizeVectorCanvas = resizeCanvas;

    function computeSimilarities() {
      return vectorCorpus.map(doc => {
        const dx = doc.x - queryPos.x;
        const dy = doc.y - queryPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const sim = Math.max(0.65, Math.min(0.992, 1.0 - (dist * 0.85)));
        return { ...doc, dist, sim };
      }).sort((a, b) => b.sim - a.sim);
    }

    function render() {
      if (width === 0 || height === 0) {
        resizeCanvas();
      }
      ctx.clearRect(0, 0, width, height);

      // 1. Subtle Coordinate Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridStep = 40;
      for (let x = 0; x < width; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Axes coordinates
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.font = '9px monospace';
      ctx.fillText('v₁ [-1.0]', 10, height - 8);
      ctx.fillText('v₂ [+1.0]', 10, 16);

      // Smooth lerp query position toward target
      queryPos.x += (targetQueryPos.x - queryPos.x) * 0.14;
      queryPos.y += (targetQueryPos.y - queryPos.y) * 0.14;

      const ranked = computeSimilarities();
      const top3 = ranked.slice(0, 3);
      const top3Ids = new Set(top3.map(d => d.id));

      pulseTime += 0.04;

      // 3. Draw Rays to Top 3 Chunks
      const qPx = queryPos.x * width;
      const qPy = queryPos.y * height;

      top3.forEach((doc, idx) => {
        const dPx = doc.x * width;
        const dPy = doc.y * height;

        ctx.save();
        ctx.strokeStyle = idx === 0 ? 'rgba(56, 189, 248, 0.75)' : 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = idx === 0 ? 1.75 : 1;
        ctx.setLineDash([4, 4]);
        ctx.lineDashOffset = -pulseTime * 14;

        ctx.beginPath();
        ctx.moveTo(qPx, qPy);
        ctx.lineTo(dPx, dPy);
        ctx.stroke();

        // Similarity tag mid-point
        const midX = (qPx + dPx) / 2;
        const midY = (qPy + dPy) / 2;
        ctx.fillStyle = 'rgba(12, 14, 20, 0.9)';
        ctx.fillRect(midX - 16, midY - 7, 32, 14);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.strokeRect(midX - 16, midY - 7, 32, 14);
        ctx.fillStyle = '#38bdf8';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(doc.sim.toFixed(3), midX, midY);
        ctx.restore();
      });

      // 4. Draw Corpus Document Nodes
      ranked.forEach(doc => {
        const px = doc.x * width;
        const py = doc.y * height;
        const isTop = top3Ids.has(doc.id);
        const isHovered = hoveredDoc && hoveredDoc.id === doc.id;

        if (isTop) {
          ctx.beginPath();
          ctx.arc(px, py, 9 + Math.sin(pulseTime * 3) * 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(px, py, 5.5, 0, Math.PI * 2);
          ctx.fillStyle = '#38bdf8';
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(px, py, isHovered ? 5 : 3.5, 0, Math.PI * 2);
          ctx.fillStyle = isHovered ? '#D4AF37' : 'rgba(255, 255, 255, 0.35)';
          ctx.fill();
        }

        if (isTop || isHovered) {
          ctx.fillStyle = isTop ? '#93c5fd' : '#cbd5e1';
          ctx.font = '9px monospace';
          ctx.textAlign = px > width - 80 ? 'right' : 'left';
          ctx.fillText(doc.id, px > width - 80 ? px - 10 : px + 10, py - 4);
        }
      });

      // 5. Draw Query Vector Q (Gold with Sonar Wave)
      const sonarR = (pulseTime * 24) % 36;
      const sonarAlpha = Math.max(0, 1 - sonarR / 36);
      ctx.beginPath();
      ctx.arc(qPx, qPy, sonarR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(212, 175, 55, ${sonarAlpha * 0.6})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(qPx, qPy, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#D4AF37';
      ctx.shadowColor = '#D4AF37';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#0a0a0e';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Q', qPx, qPy);

      requestAnimationFrame(render);
    }

    render();

    // Canvas Mouse Event Handlers
    function getPointerPos(e) {
      const rect = vectorCanvas.getBoundingClientRect();
      const x = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0.05, Math.min(0.95, (e.clientY - rect.top) / rect.height));
      return { x, y, rawX: e.clientX - rect.left, rawY: e.clientY - rect.top };
    }

    vectorCanvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      const pos = getPointerPos(e);
      targetQueryPos = { x: pos.x, y: pos.y };
      updateFromQueryDrag();
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    vectorCanvas.addEventListener('mousemove', (e) => {
      const pos = getPointerPos(e);
      if (isDragging) {
        targetQueryPos = { x: pos.x, y: pos.y };
        updateFromQueryDrag();
      }

      // Check hover on documents
      const threshold = 14;
      hoveredDoc = vectorCorpus.find(doc => {
        const dx = (doc.x * width) - pos.rawX;
        const dy = (doc.y * height) - pos.rawY;
        return Math.sqrt(dx * dx + dy * dy) < threshold;
      });

      if (hoveredDoc && vectorTooltip) {
        const dx = hoveredDoc.x - queryPos.x;
        const dy = hoveredDoc.y - queryPos.y;
        const sim = Math.max(0.65, Math.min(0.992, 1.0 - (Math.sqrt(dx * dx + dy * dy) * 0.85)));
        
        vectorTooltip.innerHTML = `
          <strong style="color: var(--accent-highlight);">${hoveredDoc.id}</strong>: ${hoveredDoc.title}<br/>
          <span style="color: var(--text-dim);">Domain: ${hoveredDoc.domain} • Cosine: <span style="color:#38bdf8; font-weight:bold;">${sim.toFixed(3)}</span></span>
        `;
        vectorTooltip.style.left = `${Math.min(pos.rawX + 12, width - 240)}px`;
        vectorTooltip.style.top = `${Math.max(10, pos.rawY - 35)}px`;
        vectorTooltip.style.opacity = '1';
      } else if (vectorTooltip) {
        vectorTooltip.style.opacity = '0';
      }
    });

    vectorCanvas.addEventListener('mouseleave', () => {
      if (vectorTooltip) vectorTooltip.style.opacity = '0';
      hoveredDoc = null;
    });

    // Touch Event Handlers for Mobile, Tablet & Touchscreen Displays
    function getTouchPos(e) {
      if (!e.touches || e.touches.length === 0) return null;
      const touch = e.touches[0];
      const rect = vectorCanvas.getBoundingClientRect();
      const x = Math.max(0.05, Math.min(0.95, (touch.clientX - rect.left) / rect.width));
      const y = Math.max(0.05, Math.min(0.95, (touch.clientY - rect.top) / rect.height));
      return { x, y, rawX: touch.clientX - rect.left, rawY: touch.clientY - rect.top };
    }

    vectorCanvas.addEventListener('touchstart', (e) => {
      const pos = getTouchPos(e);
      if (pos) {
        e.preventDefault();
        isDragging = true;
        targetQueryPos = { x: pos.x, y: pos.y };
        updateFromQueryDrag();
      }
    }, { passive: false });

    vectorCanvas.addEventListener('touchmove', (e) => {
      if (isDragging) {
        const pos = getTouchPos(e);
        if (pos) {
          e.preventDefault();
          targetQueryPos = { x: pos.x, y: pos.y };
          updateFromQueryDrag();

          const threshold = 22;
          hoveredDoc = vectorCorpus.find(doc => {
            const dx = (doc.x * width) - pos.rawX;
            const dy = (doc.y * height) - pos.rawY;
            return Math.sqrt(dx * dx + dy * dy) < threshold;
          });

          if (hoveredDoc && vectorTooltip) {
            const dx = hoveredDoc.x - queryPos.x;
            const dy = hoveredDoc.y - queryPos.y;
            const sim = Math.max(0.65, Math.min(0.992, 1.0 - (Math.sqrt(dx * dx + dy * dy) * 0.85)));
            
            vectorTooltip.innerHTML = `
              <strong style="color: var(--accent-highlight);">${hoveredDoc.id}</strong>: ${hoveredDoc.title}<br/>
              <span style="color: var(--text-dim);">Domain: ${hoveredDoc.domain} • Cosine: <span style="color:#38bdf8; font-weight:bold;">${sim.toFixed(3)}</span></span>
            `;
            vectorTooltip.style.left = `${Math.min(pos.rawX + 12, width - 240)}px`;
            vectorTooltip.style.top = `${Math.max(10, pos.rawY - 35)}px`;
            vectorTooltip.style.opacity = '1';
          }
        }
      }
    }, { passive: false });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    function updateFromQueryDrag() {
      const ranked = computeSimilarities();
      const top3 = ranked.slice(0, 3);
      if (medVectorScore) {
        medVectorScore.textContent = `${top3[0].sim.toFixed(3)} COSINE SIMILARITY`;
      }
      if (medDocsList) {
        medDocsList.innerHTML = top3
          .map(d => `<div class="sub-tag" style="color: var(--accent-primary); margin-bottom: 4px;">✓ ${d.id}: ${d.title} (${d.sim.toFixed(3)})</div>`)
          .join('');
      }
    }

    // Expose query position updater for preset buttons
    window.setVectorQuery = function(type) {
      if (queryCentroids[type]) {
        targetQueryPos = { ...queryCentroids[type] };
      }
    };
  }

  // -------------------------------------------------------------
  // SIMULATION 3: HUMAN-AI MEMORY CONTINUITY (CHAKRAVYUH 1.0)
  // -------------------------------------------------------------
  const memoryStepBtn = document.getElementById('trigger-memory-test');
  const memoryLog = document.getElementById('memory-continuity-log');
  const memoryGraphState = document.getElementById('memory-graph-state');

  let memoryStep = 0;
  const memorySteps = [
    {
      action: 'STEP 1: DILEMMA UNPACKING (capturing)',
      state: 'Prompt: "Should I accept the startup offer or pursue distributed systems research?". Inferred intent: career growth vs academic mastery.',
      latency: '11ms',
      graph: 'Field: intent • Ollama llama3.1:8b Active'
    },
    {
      action: 'STEP 2: CONSTRAINT EXTRACTION (constraints)',
      state: 'Extracted limiting parameters: 12-month runway, relocation friction, equity vesting terms. Structured schema updated.',
      latency: '9ms',
      graph: 'Fields: [intent, constraints] • thinkly_vectors Sync'
    },
    {
      action: 'STEP 3: ALTERNATIVES & REASONING (review)',
      state: 'Synthesized options: [Startup A, Lab Fellowship, Hybrid Advisory]. Transitioned to review mode. User verified trade-offs.',
      latency: '13ms',
      graph: '5 Fields Complete: DecisionMemory Ready'
    },
    {
      action: 'STEP 4: VECTOR CONTINUITY (thinkly_memories)',
      state: 'Decision memory serialized to localStorage. Term-frequency vector similarity linked to past decision (ID: DM-2025-08) with 0.89 confidence.',
      latency: '6ms',
      graph: '🏆 GITA Chakravyuh 2nd Prize Architecture Verified'
    }
  ];

  if (memoryStepBtn && memoryLog) {
    memoryStepBtn.addEventListener('click', () => {
      const stepData = memorySteps[memoryStep % memorySteps.length];
      memoryStep++;

      const logEntry = document.createElement('div');
      logEntry.style.marginBottom = '8px';
      logEntry.style.fontSize = '0.85rem';
      logEntry.innerHTML = `
        <span style="color: #f59e0b; font-weight: bold;">[${stepData.action}]</span>
        <span style="color: #cbd5e1;"> ${stepData.state}</span>
        <span style="color: #64748b; font-size: 0.75rem;">(Latency: ${stepData.latency})</span>
      `;

      memoryLog.appendChild(logEntry);
      memoryLog.scrollTop = memoryLog.scrollHeight;

      if (memoryGraphState) {
        memoryGraphState.textContent = stepData.graph;
      }

      if (window.PortfolioAudio) window.PortfolioAudio.playClick();
    });
  }
});
