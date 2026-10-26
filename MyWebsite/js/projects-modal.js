/**
 * PROJECTS MODAL & RESUME VIEWER CONTROLLER
 * Detailed case studies with architectural diagrams, metrics, and direct links.
 */

function initProjectsModal() {
  const modalOverlay = document.getElementById('project-modal');
  const modalContent = document.getElementById('modal-dynamic-content');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  const projectDetails = {
    sentix: {
      title: 'Sentix — Real-Time Emotion-Aware Multilingual Empathy Companion',
      award: 'Flagship Major Project — Group 4 (2026)',
      githubUrl: 'https://github.com/GobindPatel2441/Sentix-Real-time-Emotion-Aware-Multilingual-Empathy-Companion',
      image: 'assets/project-sentix.jpg',
      stack: ['Python 3.10+', 'Flask 2.0+', 'DeepFace', 'Llama 3 (Ollama)', 'NLLB-200 (600M)', 'OpenCV', 'PyTorch', 'Transformers'],
      overview: 'Sentix is a cutting-edge multimodal AI empathy companion engineered to bridge the gap between human emotional states and artificial intelligence. Built with Python 3.10+ and Flask, the system unifies three core capabilities: real-time webcam facial emotion detection using DeepFace, bidirectional translation across 11 Indian languages powered by Meta’s NLLB-200 model, and empathetic LLM response generation conditioned on user sentiment using Llama 3 via local Ollama. The architecture features sentence-level low-latency streaming and an integrated safety guardrail layer for compassionate, supportive conversational experiences.',
      keyInnovations: [
        'Real-Time Webcam Emotion Recognition: Ingests webcam video feeds via OpenCV at 30 FPS and classifies facial emotions (Happy, Sad, Angry, Fear, Neutral) using DeepFace to extract emotional valence in real-time.',
        'Bidirectional 11-Language Indian Translation: Employs Meta’s NLLB-200 (distilled-600M) neural machine translation wrapper to seamlessly translate conversations between English and 11 Indian languages (Hindi, Bengali, Tamil, Telugu, Odia, Marathi, Gujarati, etc.).',
        'Emotionally-Conditioned Llama 3 (via Ollama): Integrates Llama 3 running locally through Ollama (ollama pull llama3), dynamically adjusting prompt framing, tone, and empathy based on the user’s combined visual emotion and textual sentiment.',
        'Low-Latency Sentence-Level Streaming: Chunked streaming pipeline delivers real-time conversational responses sentence by sentence for natural, human-like dialogue flow without waiting for full generation.',
        'Integrated Psychological Safety Guardrails: Embedded safety layer detects high-distress topics and emotional vulnerability, steering conversations toward psychologically grounded, supportive responses.'
      ],
      archNodes: [
        {
          id: 'MOD-01',
          name: 'Webcam Stream Capture',
          file: 'webcam_emotion.py',
          tech: 'OpenCV • 30 FPS Ingest',
          desc: 'Captures live video frames at 30 FPS via cv2.VideoCapture. Preprocesses 640x480 RGB frames with facial bounding box cropping and lighting equalization.',
          input: 'Raw USB / Integrated Webcam Sensor Feed',
          output: 'Normalized Face ROI Matrix [224x224x3] FloatTensor'
        },
        {
          id: 'MOD-02',
          name: 'DeepFace Emotion Classifier',
          file: 'backend/emotion_detector.py',
          tech: 'DeepFace Vision • 7 Emotion Vectors',
          desc: 'Classifies 7 micro-expression dimensions (Happy, Sad, Angry, Fear, Surprise, Neutral, Disgust). Computes continuous valence (-1.0 to +1.0) and emotional severity.',
          input: 'Face ROI Crop Tensor',
          output: '{ primary: "anxiety", intensity: 0.82, severity: "high" }'
        },
        {
          id: 'MOD-03',
          name: 'NLLB-200 Dialect Gateway',
          file: 'backend/translator.py',
          tech: 'Meta NLLB-200 600M • PyTorch',
          desc: 'Executes bidirectional translation across 11 Indian languages (Hindi, Odia, Bengali, Telugu, Tamil, Marathi, etc.) to standardize queries into unified semantic representations.',
          input: 'Inbound User Utterance (Indic Script / Latin)',
          output: 'Canonical English Semantic String'
        },
        {
          id: 'MOD-04',
          name: 'Empathetic Prompt Conditioner',
          file: 'backend/prompt.py',
          tech: 'Regex Affirmation Filter • Valence Injection',
          desc: 'Scans for reassurance intent (wants_affirmation_only), injects detected facial emotion and text valence into system prompts, and enforces strict 1-question rule to avoid cognitive fatigue.',
          input: 'User Text + Emotion Vector + Facial State',
          output: 'Conditioned System Prompt + Chat History[-4:]'
        },
        {
          id: 'MOD-05',
          name: 'Local Ollama Llama 3 Engine',
          file: 'backend/local_model.py',
          tech: 'Ollama Llama 3 8B • On-Device LPU',
          desc: 'Executes generative inference entirely on local GPU/CPU hardware. Adjusts conversational cadence, warmth, and supportive grounding with zero cloud privacy risks.',
          input: 'Conditioned Empathy Context Payload',
          output: 'Raw Empathetic Response Stream (English)'
        },
        {
          id: 'MOD-06',
          name: 'Sentence Streaming & Translation',
          file: 'backend/app.py',
          tech: 'Flask SSE • Chunked Outbound Stream',
          desc: 'Batches tokens into sentence units, runs reverse NLLB translation back into the user’s selected Indian language, and streams chunked responses in sub-45ms latencies.',
          input: 'Synthesized English Sentence Chunk',
          output: 'Target Language Sentence Stream Event'
        }
      ],
      codeContracts: [
        {
          file: 'backend/prompt.py',
          title: 'Dynamic Emotion Conditioning & Affirmation Rule Engine',
          code: `# Affirmation detection regex to prevent unwanted questioning
AFFIRM_PATTERNS = [
    re.compile(p, re.IGNORECASE) for p in [
        r"stop asking", r"stop asking questions", r"dont ask",
        r"just reassure", r"just support", r"no advice",
        r"i just need (support|reassurance|encouragement)"
    ]
]

def build_prompt(user_text, emotion_info, history=None, affirm_only=False, facial_emotion=None):
    primary = emotion_info.get("primary", "neutral")
    severity = emotion_info.get("severity", "low")
    intensity = emotion_info.get("intensity", 0.0)

    if primary == "neutral" or intensity < 0.4:
        tone = "Be friendly, natural, and conversational."
    else:
        tone = "Be calm, validating, and kind."
        if severity in {"medium", "high"}:
            tone = "Be extra gentle, grounding, and validating."

    # Inject facial emotion scan if detected
    if facial_emotion:
        emotion_block += f"\\nAdditionally, facial scan detected user looks: {facial_emotion.upper()}."

    # Strict question constraint
    question_rule = "NEVER ask questions" if affirm_only else "You may ask ONE gentle follow-up question"`
        },
        {
          file: 'backend/translator.py',
          title: 'NLLB-200 Bidirectional Translation Wrapper for 11 Indian Languages',
          code: `# Meta NLLB-200 600M Distilled Model Loader
MODEL_ID = "facebook/nllb-200-distilled-600M"

INDIC_CODES = {
    "hi": "hin_Deva",  # Hindi
    "bn": "ben_Beng",  # Bengali
    "or": "ory_Orya",  # Odia
    "te": "tel_Telu",  # Telugu
    "ta": "tam_Taml",  # Tamil
    "mr": "mar_Deva",  # Marathi
    "gu": "guj_Gujr",  # Gujarati
    "kn": "kan_Knda",  # Kannada
    "ml": "mal_Mlym",  # Malayalam
    "pa": "pan_Guru",  # Punjabi
    "ur": "urd_Arab"   # Urdu
}

def translate_text(text, src_lang="eng_Latn", tgt_lang="hin_Deva"):
    inputs = tokenizer(text, return_tensors="pt").to(device)
    translated_tokens = model.generate(
        **inputs, forced_bos_token_id=tokenizer.lang_code_to_id[tgt_lang], max_length=256
    )
    return tokenizer.batch_decode(translated_tokens, skip_special_tokens=True)[0]`
        }
      ],
      pipeline: [
        { step: '01', title: 'Webcam & OpenCV', detail: 'Frame capture via OpenCV ingesting real-time video feed at 30 FPS with optimized RGB normalization.', badge: 'OpenCV 30 FPS' },
        { step: '02', title: 'DeepFace Classifier', detail: 'Facial emotion recognition extracting dominant emotions (Happy, Sad, Angry, Neutral) with confidence metrics.', badge: 'DeepFace Vision' },
        { step: '03', title: 'NLLB-200 Inbound', detail: 'Bidirectional translation converting 11 Indian languages (Hindi, Bengali, Tamil, Telugu, etc.) into unified English embeddings.', badge: 'NLLB-200 600M' },
        { step: '04', title: 'Empathetic Conditioning', detail: 'Combines detected facial valence with text sentiment to construct dynamically conditioned system prompts.', badge: 'Prompt Guard' },
        { step: '05', title: 'Llama 3 via Ollama', detail: 'Executes empathetic inference locally through Ollama Llama 3 with zero cloud latency and complete data privacy.', badge: 'Ollama Llama 3' },
        { step: '06', title: 'Sentence Streaming', detail: 'Streams synthesized responses sentence by sentence with target language translation back to the user interface.', badge: '<45ms Stream' }
      ]
    },
    medical: {
      title: 'Medical AI Assistant — Clinical RAG with FAISS & Groq',
      award: 'Production Clinical Assistant (2026)',
      githubUrl: 'https://github.com/GobindPatel2441/Medical-AI-Assistant',
      image: 'assets/project-medical.jpg',
      stack: ['Flask', 'LangChain', 'FAISS Vector DB', 'HuggingFace (MiniLM-L6-v2)', 'Groq API', 'Python', 'Flask Sessions'],
      overview: 'Medical AI Assistant is a high-speed, web-based clinical query assistant built with Flask, LangChain, and HuggingFace, engineered to answer complex medical inquiries with verified precision and zero hallucinations. The application implements a Retrieval-Augmented Generation (RAG) architecture: authoritative clinical guidelines, medical textbooks, and drug interaction documentation in the data/ directory are chunked and indexed into a local FAISS vector store. Incoming queries are mapped into 384-dimensional dense semantic vectors using HuggingFace Sentence Transformers, matched via cosine similarity, and synthesized using Groq LPU inference at over 150 tokens/second, while continuous clinical context is preserved using Flask session management.',
      keyInnovations: [
        'Hallucination-Resistant RAG Architecture: Anchors medical responses in verified context retrieved from local FAISS vector stores populated with authoritative clinical literature.',
        'Sub-15ms Local FAISS Vector Search: Dense vector representations created via HuggingFace Sentence Transformers (all-MiniLM-L6-v2) enable instantaneous semantic similarity matching over medical indices.',
        'Groq LPU Acceleration (150+ Tokens/Sec): Integrates Groq API hardware inference to stream complete clinical syntheses at emergency point-of-care speeds.',
        'Multi-Turn Session Memory: Preserves conversational context and patient consultation lineage across interactions utilizing Flask session management.',
        'Clean Modular Flask Architecture: Structured with clean separation between application routes (app/), document data (data/), and pre-indexed vector stores (vectorstore/).'
      ],
      archNodes: [
        {
          id: 'MOD-01',
          name: 'Clinical Ingest & Session Memory',
          file: 'app/application.py',
          tech: 'Flask 2.0+ • Session Context State',
          desc: 'Ingests clinical prompts via POST /. Manages patient inquiry history in session["messages"] to guarantee multi-turn consultation lineage without context loss.',
          input: 'HTTP Form Data { prompt: string }',
          output: 'Appended Message Dict { role: "user", content: prompt }'
        },
        {
          id: 'MOD-02',
          name: 'Dense Semantic Embedder',
          file: 'app/components/embeddings.py',
          tech: 'HuggingFace all-MiniLM-L6-v2 • 384-Dim',
          desc: 'Transforms clinical questions into dense 384-dimensional semantic embeddings for high-fidelity nearest-neighbor matching across medical literature.',
          input: 'Raw Clinical Query String',
          output: 'Dense Float32 Embedding Vector [384 Dimensions]'
        },
        {
          id: 'MOD-03',
          name: 'FAISS Local Vector Store',
          file: 'app/components/vector_store.py',
          tech: 'FAISS Vector Index • Cosine Distance',
          desc: 'Loads persistent vectorstore from DB_FAISS_PATH. Performs sub-15ms semantic similarity search returning top-K authoritative clinical guideline chunks (k=1).',
          input: 'Query Embedding Vector',
          output: 'Ranked Top-1 Medical Chunk with Cosine Distance'
        },
        {
          id: 'MOD-04',
          name: 'LangChain RetrievalQA Chain',
          file: 'app/components/retriverer.py',
          tech: 'LangChain Core • Custom Prompt Template',
          desc: 'Constructs strict clinical prompt enforcing 2-3 line maximum guidance grounded solely in retrieved context, preventing any unverified extrapolation.',
          input: 'Retrieved Clinical Context + Question',
          output: 'Constrained Prompt Payload { context, question }'
        },
        {
          id: 'MOD-05',
          name: 'Groq Hardware LPU Engine',
          file: 'app/components/llm.py',
          tech: 'ChatGroq • llama-3.3-70b-versatile',
          desc: 'Executes ultra-high-speed inference on Groq LPUs streaming at 150+ tokens/second with max_tokens=250 and temperature=0.7 for precise emergency clinical answers.',
          input: 'Augmented Medical QA Prompt',
          output: 'Verified Clinical Answer String'
        },
        {
          id: 'MOD-06',
          name: 'Verified Output & Jinja2 nl2br',
          file: 'app/application.py',
          tech: 'Jinja2 Markup • Session Persistence',
          desc: 'Stores assistant response in session["messages"], formats clinical line breaks via nl2br filter, and renders grounded medical guidance with zero hallucination.',
          input: 'Synthesized Assistant Answer',
          output: 'Rendered Consultation HTML with Active Session State'
        }
      ],
      codeContracts: [
        {
          file: 'app/components/retriverer.py',
          title: 'LangChain RetrievalQA Chain with Anti-Hallucination Prompt',
          code: `CUSTOM_PROMPT_TEMPLATE = """
Answer the following medical question in 2–3 lines maximum using only the information provided in the context.
Context:
{context}

Question:
{question}

Answer:
"""

def create_qa_chain():
    db = load_vector_store()
    llm = load_llm()
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=db.as_retriever(search_kwargs={'k': 1}),
        return_source_documents=False,
        chain_type_kwargs={'prompt': PromptTemplate(
            template=CUSTOM_PROMPT_TEMPLATE, input_variables=["context", "question"]
        )}
    )
    return qa_chain`
        },
        {
          file: 'app/components/llm.py',
          title: 'Groq LPU Hardware Acceleration with Llama 3.3 70B Versatile',
          code: `from langchain_groq import ChatGroq

def load_llm(model_name: str = 'llama-3.3-70b-versatile', groq_api_key: str = GROQ_API_KEY):
    llm = ChatGroq(
        groq_api_key=groq_api_key,
        model_name=model_name,
        temperature=0.7,
        max_tokens=250,
    )
    return llm`
        },
        {
          file: 'app/components/vector_store.py',
          title: 'FAISS Local Vector Store Loader & Index Persistence',
          code: `from langchain_community.vectorstores import FAISS

def load_vector_store():
    embedding_model = get_embedding_model() # all-MiniLM-L6-v2
    if os.path.exists(DB_FAISS_PATH):
        return FAISS.load_local(
            DB_FAISS_PATH,
            embedding_model,
            allow_dangerous_deserialization=True
        )`
        }
      ],
      pipeline: [
        { step: '01', title: 'Clinical Query', detail: 'User inputs medical question or symptom description into the web chat interface.', badge: 'REST Ingest' },
        { step: '02', title: 'HF Transformers', detail: 'HuggingFace Sentence Transformers (MiniLM-L6-v2) generates 384-dimensional dense semantic embeddings.', badge: 'MiniLM-L6-v2' },
        { step: '03', title: 'FAISS Vector Store', detail: 'Local FAISS index executes rapid cosine similarity retrieval over pre-indexed medical documents in under 15ms.', badge: '<15ms FAISS' },
        { step: '04', title: 'LangChain RAG', detail: 'LangChain chain orchestrates retrieval, builds augmented context prompt, and formats clinical constraints.', badge: 'LangChain RAG' },
        { step: '05', title: 'Groq LPU Engine', detail: 'Ultra-fast Groq LPU inference streaming 150+ tokens/second for emergency point-of-care speed.', badge: '150+ T/s Groq' },
        { step: '06', title: 'Session Memory', detail: 'Flask session tracking preserves consultation history and patient context across multi-turn discussions.', badge: 'Flask Session' }
      ]
    },
    chakravyuh: {
      title: 'Decision Diary — Human-AI Memory Continuity System',
      award: '🏆 2nd Prize Winner, GITA Chakravyuh Hackathon (Team Innovastra, Jan 2026)',
      githubUrl: 'https://github.com/GobindPatel2441',
      image: 'assets/project-chakravyuh.jpg',
      stack: ['React 19', 'TypeScript', 'Vite', 'Ollama (Llama 3.1:8B)', 'Tailwind CSS', 'LocalStorage Vector Engine', 'lucide-react'],
      overview: 'Decision Diary is a local-first decision reflection and memory continuity system engineered under a 36-hour sprint for the GITA Chakravyuh Hackathon, earning 2nd Prize among nationwide university teams. Designed to overcome cognitive fatigue and context amnesia in human-AI interaction, the app facilitates a calm conversational flow that unpacks user dilemmas, extracts structured decision data (decision, intent, constraints, alternatives, reasoning), and transitions into an interactive review flow. Running client-side with a local Ollama llama3.1:8b model at http://localhost:11434/api/generate, it guarantees 100% data privacy while storing decisions and keyword-frequency similarity vectors directly in browser localStorage (thinkly_memories & thinkly_vectors).',
      keyInnovations: [
        'Guided Reflection & Structured Extraction: Calm conversational flow automatically infers five key decision dimensions (decision, intent, constraints, alternatives, and reasoning) into a live Decision Summary panel.',
        'Local-First Privacy with Ollama (Llama 3.1:8B): Direct client-side streaming to a local Ollama instance (http://localhost:11434/api/generate) guarantees zero cloud data leakage and complete user data sovereignty.',
        'Browser-Native Vector Memory Persistence: Serializes decisions into thinkly_memories and thinkly_vectors in localStorage, using lightweight keyword-frequency vector similarity to suggest relevant past decisions and hydrate future chats.',
        'Interactive Review Flow: Moves users into a dedicated review mode once sufficient context is gathered, enabling users to edit, confirm, deepen reflection, or save decisions as reusable memory cards.',
        '36-Hour Hackathon Delivery: Conceived and built by Team Innovastra (Sri Sri University) using React 19, TypeScript, Vite, Tailwind CSS, and lucide-react, winning 2nd Prize at the GITA Chakravyuh Hackathon.'
      ],
      archNodes: [
        {
          id: 'MOD-01',
          name: 'Guided Cognitive Reflection Interface',
          file: 'src/App.tsx',
          tech: 'React 19 • TypeScript • Tailwind',
          desc: 'Runs a calm conversational interface prompting users through 5 structured questions to unpack complex choices without cognitive pressure or decision paralysis.',
          input: 'User Dilemma / Thought Stream',
          output: 'Structured Message Array [role: "user" | "ai", text]'
        },
        {
          id: 'MOD-02',
          name: 'Local Ollama 8B Streaming Service',
          file: 'http://localhost:11434/api/generate',
          tech: 'Ollama llama3.1:8b • Zero Cloud Leakage',
          desc: 'Communicates directly with locally hosted Ollama instance via non-blocking fetch streams. Ensures complete data confidentiality for private personal decisions.',
          input: 'POST { model: "llama3.1:8b", prompt: string }',
          output: 'NDJSON Streamed Assistant Response Tokens'
        },
        {
          id: 'MOD-03',
          name: '5-Field Structured Schema Inferrer',
          file: 'src/App.tsx (ConversationMode: capturing)',
          tech: 'Cognitive Parsing • State Machine',
          desc: 'Parses conversational turns in real time to populate structured schema: decision, core intent, limiting constraints, viable alternatives, and guiding reasoning.',
          input: 'Evolving Dialogue Transcript',
          output: 'DecisionMemory { decision, intent, constraints, alternatives, reasoning }'
        },
        {
          id: 'MOD-04',
          name: 'Adaptive Review & Editing Flow',
          file: 'src/App.tsx (ConversationMode: review/editing)',
          tech: 'Human-in-the-Loop • State Machine',
          desc: 'Transitions user into dedicated review mode once criteria are met. Allows manual field corrections, deeper AI probing, or final archival confirmation.',
          input: 'Inferred Decision Summary State',
          output: 'User-Validated Decision Snapshot'
        },
        {
          id: 'MOD-05',
          name: 'Browser Vector Memory Engine',
          file: 'localStorage: thinkly_memories & thinkly_vectors',
          tech: 'LocalStorage Persistence • Term Vectors',
          desc: 'Serializes confirmed decision records into thinkly_memories and builds term-frequency vectors in thinkly_vectors directly inside the client browser.',
          input: 'Confirmed Decision Memory Record',
          output: 'Persistent Vector Record { id, vector: Record<string, number> }'
        },
        {
          id: 'MOD-06',
          name: 'Cosine Keyword Similarity Matcher',
          file: 'src/App.tsx (suggestedMemoryIndexes)',
          tech: 'Vector Dot-Product • Memory Retrieval',
          desc: 'Computes term-frequency dot product similarity across stored decision vectors, dynamically suggesting past relevant choices to prevent decision amnesia.',
          input: 'Current Decision Vector Payload',
          output: 'Ranked Past Decision Memory Cards with Similarity Weights'
        }
      ],
      codeContracts: [
        {
          file: 'src/App.tsx',
          title: 'DecisionMemory & MemoryVector TypeScript Data Contracts',
          code: `type DecisionMemory = {
  id: string;
  title: string;
  summary: string;
  decision: string;
  intent: string;
  constraints: string;
  alternatives: string;
  reasoning: string;
  archived?: boolean;
  createdAt: number;
};

type MemoryVector = {
  id: string; // same as DecisionMemory.id
  vector: Record<string, number>;
};

type MemoryFieldKey = "decision" | "intent" | "constraints" | "alternatives" | "reasoning";

type ConversationMode = "capturing" | "review" | "editing" | "confirm" | "reflecting";`
        },
        {
          file: 'src/App.tsx',
          title: 'Cognitive Question Flow & Local Ollama Inference',
          code: `const questionForField = (field: MemoryFieldKey) => {
  switch (field) {
    case "decision":
      return "What's the choice that's been on your mind lately?";
    case "intent":
      return "What’s making this choice matter to you at this point in your life?";
    case "constraints":
      return "Are there any limits or concerns you’re trying to balance — like time, money, risk, or emotions?";
    case "alternatives":
      return "What other paths or possibilities have crossed your mind so far?";
    case "reasoning":
      return "Right now, which option feels most natural or convincing to you — and what’s guiding that feeling?";
  }
};

// Direct client-side streaming to local Ollama
const response = await fetch("http://localhost:11434/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ model: "llama3.1:8b", prompt: promptPayload })
});`
        }
      ],
      pipeline: [
        { step: '01', title: 'Guided Dialogue', detail: 'Calm conversational interface unpacks user dilemma, probing for underlying intent and constraints.', badge: 'React 19 UI' },
        { step: '02', title: 'Local Ollama 8B', detail: 'Communicates directly with local Ollama running llama3.1:8b at localhost:11434 with zero cloud transmission.', badge: 'Llama 3.1:8B' },
        { step: '03', title: 'Field Extraction', detail: 'Extracts structured fields: decision statement, core intent, constraints, viable alternatives, and reasoning.', badge: 'Schema Inferrer' },
        { step: '04', title: 'Review Flow', detail: 'Transitions into review state where users can edit fields, request deeper AI reflection, or confirm choices.', badge: 'Review Mode' },
        { step: '05', title: 'Vector Persistence', detail: 'Stores serialized decisions and frequency vectors in localStorage (thinkly_memories & thinkly_vectors).', badge: 'Vector Memory' },
        { step: '06', title: 'Memory Retrieval', detail: 'Lightweight keyword-vector similarity matches past decisions to prevent amnesia and guide future choices.', badge: '🏆 2nd Prize' }
      ]
    }
  };

  function openProjectModal(key, triggerEl) {
    const data = projectDetails[key];
    if (!data || !modalContent || !modalOverlay) return;

    modalContent.innerHTML = `
      <div style="padding: clamp(1.2rem, 2.5vw, 2.2rem);">
        <div class="modal-stagger-1" style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
          <span class="project-category">${data.award}</span>
        </div>
        <h2 class="modal-stagger-1" style="font-size: clamp(1.6rem, 3vw, 2.2rem); margin-bottom: 1.25rem; color: #fff; line-height: 1.2;">
          ${data.title}
        </h2>
        
        <div class="modal-stagger-2" style="width: 100%; border-radius: 14px; overflow: hidden; margin-bottom: 1.75rem; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <img src="${data.image}" alt="${data.title}" style="width: 100%; height: auto; display: block;" />
        </div>

        <div class="modal-stagger-3" style="margin-bottom: 1.75rem;">
          <h3 style="color: var(--accent-cyan); margin-bottom: 0.5rem; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.05em;">Overview</h3>
          <p style="color: var(--text-light); line-height: 1.7; font-size: 0.95rem;">${data.overview}</p>
        </div>

        <div class="modal-stagger-3" style="margin-bottom: 1.75rem;">
          <h3 style="color: var(--accent-cyan); margin-bottom: 0.75rem; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.05em;">Key Innovations & Engineering</h3>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.65rem;">
            ${data.keyInnovations
              .map(
                (item) => `
              <li style="display: flex; gap: 0.65rem; color: var(--text-light); font-size: 0.925rem; line-height: 1.6;">
                <span style="color: var(--accent-cyan);">▹</span>
                <span>${item}</span>
              </li>`
              )
              .join('')}
          </ul>
        </div>

        <!-- Interactive Architecture Section with 3 Subsystem Tabs -->
        <div class="modal-stagger-4" style="margin-bottom: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
            <h3 style="font-family: var(--font-editorial); color: var(--accent-highlight); text-transform: uppercase; font-size: 0.9rem; letter-spacing: 0.15em; display: flex; align-items: center; gap: 0.5rem; margin: 0;">
              <span>⚡ SYSTEM ARCHITECTURE & CODE CONTRACTS</span>
            </h3>
            <span style="font-size: 0.65rem; color: var(--accent-primary); font-family: var(--font-mono);">Ground truth from repository code</span>
          </div>

          <!-- View Tabs Switcher -->
          <div class="arch-view-tabs" role="tablist">
            <button class="arch-tab-btn active" data-tab="flow">
              <span>⚡ SYSTEM ARCHITECTURE FLOW</span>
            </button>
            <button class="arch-tab-btn" data-tab="contracts">
              <span>🔬 CODEBASE CONTRACTS & SCHEMAS</span>
            </button>
            <button class="arch-tab-btn" data-tab="telemetry">
              <span>📊 STEP-BY-STEP TELEMETRY</span>
            </button>
          </div>

          <!-- Tab Pane 1: Visual Interactive Architecture Diagram -->
          <div class="arch-tab-pane active" id="pane-flow">
            <div class="arch-diagram-canvas" id="arch-diagram-canvas">
              <div class="arch-canvas-header">
                <div class="arch-canvas-title-wrap">
                  <span class="arch-canvas-eyebrow">
                    Interactive Subsystem Nodes • Click any component to inspect
                  </span>
                  <span class="arch-scroll-hint" title="Sideways scrolling enabled via touch, trackpad, drag, or mouse wheel">
                    <span>↔</span> <span>SIDEWAYS SCROLL ENABLED</span>
                  </span>
                </div>

                <div class="arch-controls-group">
                  <div class="arch-view-mode-toggle" role="group" aria-label="Layout view mode">
                    <button class="arch-mode-btn active" id="btn-mode-grid" type="button" title="Switch to Responsive Grid View">
                      <span>⊞ GRID</span>
                    </button>
                    <button class="arch-mode-btn" id="btn-mode-pipeline" type="button" title="Switch to Continuous Horizontal Pipeline">
                      <span>↔ PIPELINE</span>
                    </button>
                  </div>

                  <div class="arch-scroll-arrows">
                    <button class="arch-scroll-btn" id="arch-scroll-left" type="button" aria-label="Scroll nodes left" title="Scroll left">‹</button>
                    <button class="arch-scroll-btn" id="arch-scroll-right" type="button" aria-label="Scroll nodes right" title="Scroll right">›</button>
                  </div>

                  <button id="pulse-architecture-btn" class="btn btn-primary btn-sm" style="font-size: 0.65rem; padding: 0.35rem 0.85rem;">
                    <span>⚡ PULSE DATA FLOW</span>
                  </button>
                </div>
              </div>

              <div class="arch-nodes-flow" id="arch-nodes-grid">
                ${(data.archNodes || []).map((node, idx) => `
                  <div class="arch-system-node ${idx === 0 ? 'selected' : ''}" data-node-idx="${idx}" tabindex="0" role="button" title="${node.name} (${node.file})">
                    <div class="arch-node-top">
                      <span class="arch-node-id">${node.id}</span>
                      <span class="arch-node-status">ONLINE</span>
                    </div>
                    <div class="arch-node-name">${node.name}</div>
                    <code class="arch-node-file" title="${node.file}">${node.file}</code>
                    <p class="arch-node-snippet">${node.tech}</p>
                  </div>
                `).join('')}
              </div>

              <!-- Animated Laser Data Flow Line -->
              <div class="arch-laser-flow" aria-hidden="true">
                <div class="arch-laser-line"></div>
              </div>

              <!-- Subsystem Detail Inspector -->
              <div class="arch-inspector-panel" id="arch-node-inspector">
                <div class="arch-inspector-header">
                  <h4 class="arch-inspector-title" id="inspector-name">
                    ${data.archNodes ? data.archNodes[0].name : ''}
                  </h4>
                  <span class="arch-inspector-tag" id="inspector-file" title="${data.archNodes ? data.archNodes[0].file : ''}">
                    ${data.archNodes ? data.archNodes[0].file : ''}
                  </span>
                </div>
                <div class="arch-inspector-meta-grid">
                  <div class="arch-inspector-meta-item">
                    <div class="arch-inspector-meta-label">Inbound Data Payload</div>
                    <div class="arch-inspector-meta-val" id="inspector-input">
                      ${data.archNodes ? data.archNodes[0].input : ''}
                    </div>
                  </div>
                  <div class="arch-inspector-meta-item">
                    <div class="arch-inspector-meta-label">Outbound Transformation</div>
                    <div class="arch-inspector-meta-val" id="inspector-output">
                      ${data.archNodes ? data.archNodes[0].output : ''}
                    </div>
                  </div>
                </div>
                <p class="arch-inspector-desc" id="inspector-desc">
                  ${data.archNodes ? data.archNodes[0].desc : ''}
                </p>
              </div>
            </div>
          </div>

          <!-- Tab Pane 2: Production Code Contracts & Schemas -->
          <div class="arch-tab-pane" id="pane-contracts">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
              <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--accent-primary);">
                Authentic Source Code & Architecture Contracts extracted from the project repository:
              </span>
              <span class="arch-scroll-hint"><span>↔</span> <span>SCROLL SIDEWAYS FOR FULL CODE</span></span>
            </div>
            ${(data.codeContracts || []).map((contract) => `
              <div class="code-contract-box">
                <div class="code-contract-header">
                  <span class="code-contract-file">
                    <span>📄</span>
                    <code>${contract.file}</code>
                  </span>
                  <span style="font-family: var(--font-editorial); font-size: 0.7rem; color: var(--text-dim);">${contract.title}</span>
                </div>
                <pre class="code-contract-content" tabindex="0"><code>${contract.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
              </div>
            `).join('')}
          </div>

          <!-- Tab Pane 3: Step-by-Step Telemetry Pipeline -->
          <div class="arch-tab-pane" id="pane-telemetry">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.9rem; flex-wrap: wrap; gap: 0.5rem;">
              <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-dim);">
                Sequential Data Pipeline Telemetry (Click nodes or run auto simulation)
              </span>
              <button id="simulate-pipeline-btn" class="btn btn-primary btn-sm" style="font-size: 0.65rem; padding: 0.35rem 0.85rem;">
                <span>▶ RUN DATA FLOW SIMULATION</span>
              </button>
            </div>

            <!-- Interactive Node Pipeline -->
            <div class="pipeline-flow-container" id="pipeline-flow">
              ${(data.pipeline || []).map((step, idx) => `
                <div class="pipeline-node ${idx === 0 ? 'active' : ''}" data-step-index="${idx}" tabindex="0" role="button">
                  <div class="pipeline-node-header">
                    <span class="pipeline-node-step">${step.step}</span>
                    <span class="pipeline-node-badge">${step.badge}</span>
                  </div>
                  <div class="pipeline-node-title">${step.title}</div>
                </div>
                ${idx < data.pipeline.length - 1 ? `<div class="pipeline-arrow" aria-hidden="true">→</div>` : ''}
              `).join('')}
            </div>

            <!-- Deep Node Telemetry Details Box -->
            <div id="pipeline-node-telemetry" class="pipeline-telemetry-box" style="margin-top: 1rem;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
                <strong id="telemetry-node-title" style="color: var(--accent-highlight); font-size: 0.85rem; font-family: var(--font-editorial);">${data.pipeline ? data.pipeline[0].title : ''}</strong>
                <span id="telemetry-node-badge" class="pipeline-node-badge">${data.pipeline ? data.pipeline[0].badge : ''}</span>
              </div>
              <p id="telemetry-node-desc" style="color: var(--text-light); font-size: 0.85rem; line-height: 1.6; margin: 0;">${data.pipeline ? data.pipeline[0].detail : ''}</p>
            </div>
          </div>
        </div>

        <div class="modal-stagger-5" style="margin-bottom: 2rem;">
          <h3 style="font-size: 0.85rem; color: var(--accent-primary); margin-bottom: 0.75rem; text-transform: uppercase; font-family: var(--font-editorial); letter-spacing: 0.15em;">Technology Stack</h3>
          <div class="tech-tags-list">
            ${data.stack.map((t) => `<span class="tech-tag">${t}</span>`).join('')}
          </div>
        </div>

        <div class="modal-stagger-5" style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <a href="${data.githubUrl || 'https://github.com/GobindPatel2441'}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
            <span>View on GitHub ↗</span>
          </a>
          <button class="btn btn-secondary" onclick="window.closeModal && window.closeModal()">
            Close Case Study
          </button>
        </div>
      </div>
    `;

    // Helper: Universal horizontal mousewheel and click-and-drag scrolling
    function enableHorizontalScroll(el) {
      if (!el) return;
      el.addEventListener('wheel', (e) => {
        if (el.scrollWidth > el.clientWidth) {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            el.scrollLeft += e.deltaY * 0.9;
            e.preventDefault();
          }
        }
      }, { passive: false });

      let isDown = false;
      let startX;
      let scrollLeft;

      el.addEventListener('mousedown', (e) => {
        if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.arch-system-node') || e.target.closest('.pipeline-node')) return;
        isDown = true;
        startX = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
      });

      window.addEventListener('mouseup', () => { isDown = false; });

      el.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - el.offsetLeft;
        const walk = (x - startX) * 1.5;
        el.scrollLeft = scrollLeft - walk;
      });
    }

    // 1. Wire up Architecture View Tabs
    const tabBtns = modalContent.querySelectorAll('.arch-tab-btn');
    const tabPanes = modalContent.querySelectorAll('.arch-tab-pane');
    const archTabs = modalContent.querySelector('.arch-view-tabs');
    enableHorizontalScroll(archTabs);

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        tabBtns.forEach((b) => b.classList.remove('active'));
        tabPanes.forEach((p) => p.classList.remove('active'));

        btn.classList.add('active');
        const activePane = modalContent.querySelector(`#pane-${targetTab}`);
        if (activePane) activePane.classList.add('active');
        if (window.PortfolioAudio) window.PortfolioAudio.playClick();
      });
    });

    // 2. Wire up Architecture Canvas, Nodes, Mode Toggles, and Scroll Arrows
    const archCanvas = modalContent.querySelector('#arch-diagram-canvas');
    const archNodesGrid = modalContent.querySelector('#arch-nodes-grid');
    const btnModeGrid = modalContent.querySelector('#btn-mode-grid');
    const btnModePipeline = modalContent.querySelector('#btn-mode-pipeline');
    const btnScrollLeft = modalContent.querySelector('#arch-scroll-left');
    const btnScrollRight = modalContent.querySelector('#arch-scroll-right');

    enableHorizontalScroll(archCanvas);
    enableHorizontalScroll(archNodesGrid);

    if (btnModeGrid && btnModePipeline && archNodesGrid) {
      btnModeGrid.addEventListener('click', () => {
        btnModeGrid.classList.add('active');
        btnModePipeline.classList.remove('active');
        archNodesGrid.classList.remove('mode-pipeline');
        if (window.PortfolioAudio) window.PortfolioAudio.playClick();
      });

      btnModePipeline.addEventListener('click', () => {
        btnModePipeline.classList.add('active');
        btnModeGrid.classList.remove('active');
        archNodesGrid.classList.add('mode-pipeline');
        archNodesGrid.scrollLeft = 0;
        if (window.PortfolioAudio) window.PortfolioAudio.playClick();
      });
    }

    if (btnScrollLeft && btnScrollRight) {
      btnScrollLeft.addEventListener('click', () => {
        const target = (archNodesGrid && archNodesGrid.classList.contains('mode-pipeline')) ? archNodesGrid : (archCanvas || archNodesGrid);
        if (target) {
          target.scrollBy({ left: -300, behavior: 'smooth' });
          if (window.PortfolioAudio) window.PortfolioAudio.playClick();
        }
      });
      btnScrollRight.addEventListener('click', () => {
        const target = (archNodesGrid && archNodesGrid.classList.contains('mode-pipeline')) ? archNodesGrid : (archCanvas || archNodesGrid);
        if (target) {
          target.scrollBy({ left: 300, behavior: 'smooth' });
          if (window.PortfolioAudio) window.PortfolioAudio.playClick();
        }
      });
    }

    // Also enable sideways scroll on all code contract blocks
    const codeBlocks = modalContent.querySelectorAll('.code-contract-content');
    codeBlocks.forEach(cb => enableHorizontalScroll(cb));

    // 3. Wire up Interactive Subsystem Node Clicks
    const archNodes = modalContent.querySelectorAll('.arch-system-node');
    const inspName = modalContent.querySelector('#inspector-name');
    const inspFile = modalContent.querySelector('#inspector-file');
    const inspInput = modalContent.querySelector('#inspector-input');
    const inspOutput = modalContent.querySelector('#inspector-output');
    const inspDesc = modalContent.querySelector('#inspector-desc');
    const pulseArchBtn = modalContent.querySelector('#pulse-architecture-btn');

    archNodes.forEach((node) => {
      node.addEventListener('click', () => {
        const idx = parseInt(node.dataset.nodeIdx, 10);
        archNodes.forEach(n => n.classList.remove('selected'));
        node.classList.add('selected');

        if (data.archNodes && data.archNodes[idx]) {
          const item = data.archNodes[idx];
          inspName.textContent = item.name;
          inspFile.textContent = item.file;
          inspInput.textContent = item.input;
          inspOutput.textContent = item.output;
          inspDesc.textContent = item.desc;
        }
        if (window.PortfolioAudio) window.PortfolioAudio.playClick();
      });
    });

    if (pulseArchBtn) {
      pulseArchBtn.addEventListener('click', () => {
        if (!data.archNodes) return;
        pulseArchBtn.disabled = true;
        pulseArchBtn.querySelector('span').textContent = '⚡ FLOW PULSING...';

        data.archNodes.forEach((nodeItem, i) => {
          setTimeout(() => {
            archNodes.forEach(n => n.classList.remove('selected', 'pulse-beam'));
            if (archNodes[i]) {
              archNodes[i].classList.add('selected', 'pulse-beam');
              inspName.textContent = nodeItem.name;
              inspFile.textContent = nodeItem.file;
              inspInput.textContent = nodeItem.input;
              inspOutput.textContent = nodeItem.output;
              inspDesc.textContent = nodeItem.desc;
            }
            if (window.PortfolioAudio) window.PortfolioAudio.playTone ? window.PortfolioAudio.playTone(400 + i * 120, 'sine', 0.08, 0.04) : window.PortfolioAudio.playClick();

            if (i === data.archNodes.length - 1) {
              setTimeout(() => {
                pulseArchBtn.disabled = false;
                pulseArchBtn.querySelector('span').textContent = '⚡ PULSE DATA FLOW';
              }, 800);
            }
          }, i * 400);
        });
      });
    }

    // 3. Wire up Sequential Pipeline Clicks and Simulation
    const pipeNodes = modalContent.querySelectorAll('.pipeline-node');
    const pipeFlow = modalContent.querySelector('#pipeline-flow');
    enableHorizontalScroll(pipeFlow);
    const telTitle = modalContent.querySelector('#telemetry-node-title');
    const telBadge = modalContent.querySelector('#telemetry-node-badge');
    const telDesc = modalContent.querySelector('#telemetry-node-desc');
    const simBtn = modalContent.querySelector('#simulate-pipeline-btn');

    pipeNodes.forEach((node) => {
      node.addEventListener('click', () => {
        const idx = parseInt(node.dataset.stepIndex, 10);
        pipeNodes.forEach(n => n.classList.remove('active'));
        node.classList.add('active');

        if (data.pipeline && data.pipeline[idx]) {
          telTitle.textContent = data.pipeline[idx].title;
          telBadge.textContent = data.pipeline[idx].badge;
          telDesc.textContent = data.pipeline[idx].detail;
        }
        if (window.PortfolioAudio) window.PortfolioAudio.playClick();
      });
    });

    if (simBtn) {
      simBtn.addEventListener('click', () => {
        if (!data.pipeline) return;
        simBtn.disabled = true;
        simBtn.querySelector('span').textContent = '⚡ FLOW PULSING...';

        data.pipeline.forEach((step, i) => {
          setTimeout(() => {
            pipeNodes.forEach(n => n.classList.remove('active', 'pulse-glow'));
            if (pipeNodes[i]) {
              pipeNodes[i].classList.add('active', 'pulse-glow');
              telTitle.textContent = step.title;
              telBadge.textContent = step.badge;
              telDesc.textContent = step.detail;
            }
            if (window.PortfolioAudio) window.PortfolioAudio.playTone ? window.PortfolioAudio.playTone(500 + i * 150, 'sine', 0.08, 0.04) : window.PortfolioAudio.playClick();

            if (i === data.pipeline.length - 1) {
              setTimeout(() => {
                simBtn.disabled = false;
                simBtn.querySelector('span').textContent = '▶ RUN DATA FLOW SIMULATION';
              }, 800);
            }
          }, i * 450);
        });
      });
    }

    modalOverlay.classList.add('active');
    modalOverlay.setAttribute('data-lenis-prevent', 'true');
    document.body.style.overflow = 'hidden';

    if (window.lenis && typeof window.lenis.stop === 'function') {
      window.lenis.stop();
    }

    // Cinematic Shared-Element Expansion
    const modalDialog = modalOverlay.querySelector('.modal-dialog');
    if (modalDialog) {
      modalDialog.scrollTop = 0;
      modalDialog.setAttribute('data-lenis-prevent', 'true');
    }

    if (modalDialog && triggerEl) {
      const sourceRect = triggerEl.getBoundingClientRect();
      const dialogRect = modalDialog.getBoundingClientRect();

      const sourceCenterX = sourceRect.left + sourceRect.width / 2;
      const sourceCenterY = sourceRect.top + sourceRect.height / 2;
      const dialogCenterX = dialogRect.left + dialogRect.width / 2;
      const dialogCenterY = dialogRect.top + dialogRect.height / 2;

      const deltaX = sourceCenterX - dialogCenterX;
      const deltaY = sourceCenterY - dialogCenterY;
      const scaleX = Math.max(0.2, Math.min(0.85, sourceRect.width / dialogRect.width));
      const scaleY = Math.max(0.18, Math.min(0.85, sourceRect.height / dialogRect.height));

      const anim = modalDialog.animate([
        {
          transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scaleX}, ${scaleY})`,
          opacity: 0.6,
          filter: 'blur(5px)'
        },
        {
          transform: 'translate3d(0, 0, 0) scale(1, 1)',
          opacity: 1,
          filter: 'blur(0px)'
        }
      ], {
        duration: 440,
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

    if (window.PortfolioAudio) window.PortfolioAudio.playClick();
  }

  // Bind trigger buttons & image clicks
  document.querySelectorAll('[data-project-target]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const target = el.dataset.projectTarget;
      openProjectModal(target, el);
    });
  });

  // Close handlers
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    // Forward wheel events on overlay backdrop to scrollable dialog
    modalOverlay.addEventListener('wheel', (e) => {
      const modalDialog = modalOverlay.querySelector('.modal-dialog');
      if (modalDialog && (e.target === modalOverlay || e.target === modalContent)) {
        modalDialog.scrollTop += e.deltaY;
      }
    }, { passive: true });

    let touchStartY = 0;
    modalOverlay.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    modalOverlay.addEventListener('touchmove', (e) => {
      if (e.target === modalOverlay && e.touches && e.touches.length > 0) {
        const deltaY = touchStartY - e.touches[0].clientY;
        touchStartY = e.touches[0].clientY;
        const modalDialog = modalOverlay.querySelector('.modal-dialog');
        if (modalDialog) {
          modalDialog.scrollTop += deltaY;
        }
      }
    }, { passive: true });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  function closeModal() {
    if (!modalOverlay || !modalOverlay.classList.contains('active')) return;
    const modalDialog = modalOverlay.querySelector('.modal-dialog');

    let closed = false;
    const finalizeClose = () => {
      if (closed) return;
      closed = true;
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
      if (modalContent) {
        // Explicitly tear down all iframes and background renderers
        const iframes = modalContent.querySelectorAll('iframe');
        iframes.forEach((f) => {
          try {
            f.onload = null;
            f.onerror = null;
            f.src = 'about:blank';
            f.remove();
          } catch (e) {}
        });
        modalContent.innerHTML = '';
      }
      if (window.lenis && typeof window.lenis.start === 'function') {
        window.lenis.start();
      }
    };

    if (modalDialog && typeof modalDialog.animate === 'function') {
      try {
        const anim = modalDialog.animate([
          { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 },
          { transform: 'translate3d(0, 24px, 0) scale(0.96)', opacity: 0 }
        ], {
          duration: 240,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both'
        });

        modalOverlay.animate([
          { opacity: 1 },
          { opacity: 0 }
        ], {
          duration: 240,
          easing: 'ease'
        });

        anim.onfinish = finalizeClose;
        setTimeout(finalizeClose, 260);
      } catch (e) {
        finalizeClose();
      }
    } else {
      finalizeClose();
    }
  }

  // Expose to window for direct invocation
  window.openProjectModal = openProjectModal;
  window.openResumeModal = openResumeModal;
  window.closeModal = closeModal;

  // Enable horizontal mousewheel on all card-micro-pipeline strips on the main page
  document.querySelectorAll('.card-micro-pipeline').forEach((pipe) => {
    pipe.addEventListener('wheel', (e) => {
      if (pipe.scrollWidth > pipe.clientWidth) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          pipe.scrollLeft += e.deltaY * 0.9;
          e.preventDefault();
        }
      }
    }, { passive: false });
  });

  // Resume Modal trigger
  const resumeBtns = document.querySelectorAll('.view-resume-btn');
  resumeBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openResumeModal(btn);
    });
  });

  function openResumeModal(triggerEl) {
    if (!modalContent || !modalOverlay) return;

    const isMobile = window.innerWidth < 768 || (('ontouchstart' in window) && window.innerWidth < 900);

    const resumeViewerHtml = isMobile ? `
      <div class="modal-stagger-2" style="width: 100%; padding: 2rem 1.25rem; border-radius: 12px; border: 1px solid var(--border-glass); background: #0c0d14; text-align: center;">
        <div style="font-size: 2.2rem; margin-bottom: 0.75rem;">📄</div>
        <h3 style="font-family: var(--font-monumental); font-size: 1.2rem; color: #fff; margin-bottom: 0.5rem;">Official Resume & Curriculum Vitae</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; max-width: 420px; margin: 0 auto 1.5rem auto; line-height: 1.5;">
          Optimized for high-speed mobile reading. View the complete document in full resolution or save a copy.
        </p>
        <div style="display: flex; flex-direction: column; gap: 0.75rem; max-width: 340px; margin: 0 auto;">
          <a href="assets/Gobind_Patel_Resume.pdf" target="_blank" rel="noopener noreferrer" class="btn btn-primary" type="button" style="width: 100%; justify-content: center;">
            <span>Open Resume (New Tab) ↗</span>
          </a>
          <a href="assets/Gobind_Patel_Resume.pdf" download="Gobind_Patel_Resume.pdf" class="btn btn-secondary" type="button" style="width: 100%; justify-content: center;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>Download PDF (137 KB)</span>
          </a>
          <button type="button" class="btn btn-secondary btn-sm" id="resume-inline-load-btn" style="width: 100%; justify-content: center; font-size: 0.75rem; opacity: 0.8;">
            <span>Load Inline Viewer</span>
          </button>
        </div>
      </div>
    ` : `
      <div class="modal-stagger-2" style="width: 100%; height: min(75vh, 800px); border-radius: 12px; overflow: hidden; border: 1px solid var(--border-glass); background: #0c0d14; position: relative;">
        <div id="resume-spinner" style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #0c0d14; z-index: 2; transition: opacity 0.3s ease;">
          <div style="width: 36px; height: 36px; border: 3px solid rgba(212, 175, 55, 0.2); border-top-color: var(--accent-primary); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
          <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-highlight); margin-top: 1rem; letter-spacing: 0.05em;">Loading Resume Document...</span>
        </div>
        <iframe 
          id="resume-iframe-el"
          src="assets/Gobind_Patel_Resume.pdf#toolbar=1" 
          width="100%" 
          height="100%" 
          title="Gobind Patel Resume"
          style="border: none; display: block;"
          loading="lazy"
        ></iframe>
      </div>
    `;

    modalContent.innerHTML = `
      <div style="padding: clamp(1.25rem, 3vw, 2.5rem);">
        <div class="modal-stagger-1" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 style="font-family: var(--font-monumental); font-size: 1.6rem; color: #fff; margin-bottom: 0.25rem;">Gobind Patel — Resume</h2>
            <p style="color: var(--text-muted); font-size: 0.85rem;">B.Tech CSE (AI/ML) • Sri Sri University • CGPA: 8.89/10</p>
          </div>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <a href="assets/Gobind_Patel_Resume.pdf" download="Gobind_Patel_Resume.pdf" class="btn btn-primary btn-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span>Download PDF</span>
            </a>
            <a href="assets/Gobind_Patel_Resume.pdf" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
              <span>Open in New Tab</span>
            </a>
          </div>
        </div>
        ${resumeViewerHtml}
      </div>
    `;

    // Wire desktop spinner fade
    const resumeIframe = document.getElementById('resume-iframe-el');
    const resumeSpinner = document.getElementById('resume-spinner');
    if (resumeIframe && resumeSpinner) {
      resumeIframe.onload = () => {
        resumeSpinner.style.opacity = '0';
        setTimeout(() => { if (resumeSpinner) resumeSpinner.style.display = 'none'; }, 300);
      };
      // 3.5s timeout fallback
      setTimeout(() => {
        if (resumeSpinner) {
          resumeSpinner.style.opacity = '0';
          setTimeout(() => { if (resumeSpinner) resumeSpinner.style.display = 'none'; }, 300);
        }
      }, 3500);
    }

    // Wire mobile on-demand inline loader
    const inlineBtn = document.getElementById('resume-inline-load-btn');
    if (inlineBtn) {
      inlineBtn.addEventListener('click', () => {
        const parent = inlineBtn.closest('.modal-stagger-2');
        if (parent) {
          parent.innerHTML = `
            <div style="width: 100%; height: min(70vh, 600px); border-radius: 8px; overflow: hidden; background: #000;">
              <iframe src="assets/Gobind_Patel_Resume.pdf#toolbar=1" width="100%" height="100%" style="border: none;" title="Gobind Patel Resume"></iframe>
            </div>
          `;
        }
      });
    }
    modalOverlay.classList.add('active');
    modalOverlay.setAttribute('data-lenis-prevent', 'true');
    document.body.style.overflow = 'hidden';

    if (window.lenis && typeof window.lenis.stop === 'function') {
      window.lenis.stop();
    }

    const modalDialog = modalOverlay.querySelector('.modal-dialog');
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
        duration: 400,
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

    if (window.PortfolioAudio) window.PortfolioAudio.playClick();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProjectsModal);
} else {
  initProjectsModal();
}

