# Medical AI Assistant

A web-based AI assistant built with Flask, LangChain, and HuggingFace, designed to answer medical queries. The application utilizes FAISS for vector storage and Groq for language model inference.

## Features
- **Conversational Interface:** A web chat interface to interact with the medical AI.
- **RAG Architecture:** Uses Retrieval-Augmented Generation (RAG) to fetch relevant context from a local vector store (FAISS).
- **Session Management:** Keeps track of conversation history for continuous context in a Flask session.

## Technologies Used
- **Backend:** Flask
- **LLM Orchestration:** LangChain
- **Vector Database:** FAISS
- **Embeddings:** HuggingFace Sentence Transformers
- **Inference:** Groq API

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/GobindPatel2441/Medical-AI-Assistant.git
   cd Medical-AI-Assistant
   ```

2. Create a virtual environment and install the required dependencies:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   pip install -r req.txt
   ```

3. Set up the environment variables by creating a `.env` file in the root directory:
   ```env
   GROQ_API_KEY=your_groq_api_key
   ```
   *(Add any other required keys as configured in your retriever logic)*

4. Run the application:
   ```bash
   python -m app.application
   ```
   Or run the Flask app directly:
   ```bash
   flask --app app/application run
   ```

5. Open your browser and navigate to `http://localhost:5000`.

## Project Structure
- `app/`: Contains the Flask application, templates, and components.
- `req.txt`: Project dependencies.
- `vectorstore/`: Local FAISS index files (if generated).
- `data/`: Source documents used to build the vector store.
