import os
import shutil
import glob
from typing import List, Dict, Any

# Updated Imports for LangChain 0.1+
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter # New location
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_chroma import Chroma # Updated from community
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

# Configuration for Local Vector DB
DB_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")



class RAGEngine:
    def __init__(self):
        # Initialize Embeddings and LLM
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        self.vector_store = None
        
        # Load existing DB if available to avoid re-indexing on restart
        if os.path.exists(DB_DIR):
            self.vector_store = Chroma(persist_directory=DB_DIR, embedding_function=self.embeddings)

    def clear_database(self):
        """Clears previous data for a fresh start"""
        if os.path.exists(DB_DIR):
            shutil.rmtree(DB_DIR)
        self.vector_store = None

    def ingest_files(self, file_paths: List[str]) -> int:
        """Loads PDFs, splits them, and creates a Vector Index"""
        documents = []
        for path in file_paths:
            try:
                loader = PyPDFLoader(path)
                documents.extend(loader.load())
            except Exception as e:
                print(f"Error loading {path}: {e}")
                continue
            
        if not documents:
            return 0

        # Optimization: Chunking with overlap for better context retention
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(documents)
        
        # Create and persist Vector Store
        self.vector_store = Chroma.from_documents(
            documents=splits, 
            embedding=self.embeddings, 
            persist_directory=DB_DIR
        )
        return len(splits)

    def query(self, question: str) -> Dict[str, Any]:
        """RAG Logic: Retrieve -> Generate Answer -> Extract Citations"""
        if not self.vector_store:
            return {
                "answer": "Please upload and index documents first.", 
                "confidence": "Low", 
                "sources": []
            }

        # Retrieve top 4 relevant chunks
        retriever = self.vector_store.as_retriever(search_kwargs={"k": 4})

        # Professional Prompt for Auditing
        system_prompt = (
            "You are an expert Due Diligence Auditor AI. Use the provided context to answer the user's question accurately.\n\n"
            "Rules:\n"
            "1. Answer strictly based on the provided context.\n"
            "2. If the answer is not in the context, explicitly say 'Data not available in the provided documents'.\n"
            "3. Assess your confidence level (High/Medium/Low).\n"
            "\nContext:\n{context}"
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}"),
        ])

        # Chain Construction
        question_answer_chain = create_stuff_documents_chain(self.llm, prompt)
        rag_chain = create_retrieval_chain(retriever, question_answer_chain)

        # Execution
        response = rag_chain.invoke({"input": question})

        # Process Sources/Citations
        sources = []
        for doc in response.get("context", []):
            sources.append({
                "source": os.path.basename(doc.metadata.get("source", "Unknown File")),
                "page": doc.metadata.get("page", 0) + 1, # Page numbers are 0-indexed in code
                "content": doc.page_content[:150] + "..." # Snippet for preview
            })

        # Simple Logic for Confidence (Can be improved with structured output)
        answer_text = response["answer"]
        confidence = "High"
        if "not available" in answer_text.lower() or "don't know" in answer_text.lower():
            confidence = "Low"

        return {
            "answer": answer_text,
            "confidence": confidence,
            "sources": sources
        }