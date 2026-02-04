# Due Diligence Questionnaire (DDQ) AI Agent
![Project Status](https://img.shields.io/badge/Status-Completed-success)
![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.95+-009688?logo=fastapi)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)

##  Overview
This project implements an AI-powered agent to automate the Due Diligence process. It parses company documents (PDFs), accepts a list of questions (CSV), and generates answers with confidence scores and citations using RAG (Retrieval Augmented Generation).

##  Features
- **Document Indexing:** Uses `pypdf` and `chroma_db` to index financial reports.
- **RAG Engine:** Leverages OpenAI `gpt-4o-mini` for accurate context-aware answers.
- **Bulk Processing:** Automatically answers full questionnaires from CSV files.
- **Human-in-the-Loop:** Interactive table allowing auditors to review and edit AI answers before export.
- **Citation Tracking:** Provides source document names and page numbers for verification.

##  Tech Stack
- **Language:** Python 3.10+
- **Frontend:** Streamlit
- **LLM Framework:** LangChain
- **Vector Store:** FAISS (Local)

## 🏃‍♂️ How to Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/DueDiligenceAgent.git
   cd DueDiligenceAgent
Install Dependencies:
code
Bash
pip install -r requirements.txt
Set up API Key:
Create a .env file in the root directory:
code
Env
OPENAI_API_KEY=your_openai_api_key_here
