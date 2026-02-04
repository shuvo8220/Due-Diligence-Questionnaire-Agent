import React, { useState } from 'react';
import { Search, Send } from 'lucide-react';

interface AnswerData {
  answer: string;
  confidence: string;
  sources: { source: string; page: number; content: string }[];
}

interface Props {
  onAsk: (q: string) => Promise<AnswerData | null>;
  disabled: boolean;
}

const ChatSection: React.FC<Props> = ({ onAsk, disabled }) => {
  const [question, setQuestion] = useState("");
  const [data, setData] = useState<AnswerData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!question) return;
    setLoading(true);
    const result = await onAsk(question);
    if (result) setData(result);
    setLoading(false);
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-800">
        <Search className="w-5 h-5 text-blue-600" /> 2. Quick Query
      </h2>
      
      <div className="flex gap-2">
        <input 
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., What is the total revenue for 2023?"
          className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
          disabled={disabled}
        />
        <button 
          onClick={handleSubmit} 
          disabled={disabled || loading} 
          className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition flex items-center gap-2"
        >
          {loading ? "..." : <Send className="w-4 h-4" />}
        </button>
      </div>

      {data && (
        <div className="mt-6 bg-slate-50 p-5 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-bottom-2">
          <p className="font-medium text-lg text-slate-800 mb-3">{data.answer}</p>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold uppercase text-slate-500">Confidence:</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              data.confidence === 'High' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {data.confidence}
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase text-slate-400">Citations</p>
            {data.sources.map((src, i) => (
              <div key={i} className="text-xs bg-white p-3 border rounded shadow-sm">
                <span className="font-semibold text-blue-600">{src.source} (Pg {src.page})</span>
                <p className="mt-1 text-slate-600 italic">"{src.content}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default ChatSection;