import React from 'react';
import { FileText, PlayCircle } from 'lucide-react';

// 1. Define the structure of a single answer item
interface Source {
  source?: string;
  page: number;
  content?: string;
}

interface AnswerData {
  question?: string;
  answer: string;
  confidence: string;
  sources: Source[];
}

// 2. Define the Props interface
interface Props {
  data: AnswerData[]; // Array of AnswerData
  onRun: () => void;  // Function that returns nothing
  loading: boolean;   // Boolean
  disabled: boolean;  // Boolean
}

// 3. Apply the Props to the Component
const BulkReviewSection: React.FC<Props> = ({ data, onRun, loading, disabled }) => {
  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
          <FileText className="w-5 h-5 text-blue-600" /> 3. Bulk Questionnaire Review
        </h2>
        <button 
          onClick={onRun} 
          disabled={disabled || loading}
          className="text-sm bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition flex items-center gap-2 font-medium"
        >
          <PlayCircle className="w-4 h-4" />
          {loading ? "Generating Report..." : "Run Auto-Review"}
        </button>
      </div>

      {data.length > 0 ? (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3 font-medium">Question</th>
                <th className="px-6 py-3 font-medium">AI Answer</th>
                <th className="px-6 py-3 font-medium">Confidence</th>
                <th className="px-6 py-3 font-medium">Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row, i) => (
                <tr key={i} className="bg-white hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-900">{row.question}</td>
                  <td className="px-6 py-4 text-slate-600">{row.answer}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${
                      row.confidence === 'High' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {row.confidence}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                     Pg {row.sources[0]?.page || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
          <p className="text-slate-400">Upload documents and click "Run Auto-Review" to generate report</p>
        </div>
      )}
    </section>
  );
};

export default BulkReviewSection;