import { useState } from 'react';
import axios from 'axios';
import UploadSection from './components/UploadSection';
import ChatSection from './components/ChatSection';
import BulkReviewSection from './components/BulkReviewSection';

// API Endpoint (Make sure backend is running on port 8000)
const API_URL = "http://localhost:8000";

function App() {
  const [indexing, setIndexing] = useState(false);
  const [indexed, setIndexed] = useState(false);
  const [bulkAnswers, setBulkAnswers] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Demo Questions (Simulating a CSV file content)
  const defaultQuestions = [
    "What is the company's net profit for the year?",
    "List the key risks mentioned in the 'Risk Factors' section.",
    "Who are the board of directors?",
    "Is there any litigation pending against the company?"
  ];

  // 1. Handle File Upload
  const handleUpload = async (files: FileList) => {
    setIndexing(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]); // Must match backend key 'files'
    }

    try {
      await axios.post(`${API_URL}/upload`, formData);
      setIndexed(true);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload documents. Ensure backend is running.");
    } finally {
      setIndexing(false);
    }
  };

  // 2. Handle Single Question
  const handleAsk = async (question: string) => {
    try {
      const res = await axios.post(`${API_URL}/ask`, { question });
      return res.data;
    } catch (error) {
      console.error("Query failed", error);
      return null;
    }
  };

  // 3. Handle Bulk Review
  const handleBulkReview = async () => {
    setBulkLoading(true);
    try {
      const res = await axios.post(`${API_URL}/bulk-review`, { questions: defaultQuestions });
      setBulkAnswers(res.data.results);
    } catch (error) {
      console.error("Bulk review failed", error);
      alert("Failed to process bulk review.");
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-10">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              🕵️‍♂️ Due Diligence Agent
            </h1>
            <p className="text-xs text-slate-500 mt-1">Makebell Ltd. Assessment • Option A</p>
          </div>
          <div className="text-xs font-mono bg-slate-100 px-3 py-1 rounded text-slate-600">
            v1.0.0
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Upload */}
        <aside className="md:col-span-4 lg:col-span-3">
          <UploadSection 
            onUpload={handleUpload} 
            loading={indexing} 
            isIndexed={indexed} 
          />
        </aside>

        {/* Right Column: Interaction */}
        <div className="md:col-span-8 lg:col-span-9 space-y-8">
          <ChatSection 
            onAsk={handleAsk} 
            disabled={!indexed} 
          />
          
          <BulkReviewSection 
            data={bulkAnswers} 
            onRun={handleBulkReview} 
            loading={bulkLoading} 
            disabled={!indexed} 
          />
        </div>

      </main>
    </div>
  );
}

export default App;