import React from 'react';
import { Upload, Loader2, CheckCircle } from 'lucide-react';

interface Props {
  onUpload: (files: FileList) => void;
  loading: boolean;
  isIndexed: boolean;
}

const UploadSection: React.FC<Props> = ({ onUpload, loading, isIndexed }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border h-fit">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-800">
        <Upload className="w-5 h-5 text-blue-600" /> 1. Ingestion
      </h2>
      
      <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50 transition">
        <input 
          type="file" 
          multiple 
          accept=".pdf"
          onChange={(e) => e.target.files && onUpload(e.target.files)}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100 mb-2 cursor-pointer"
        />
        <p className="text-xs text-slate-400 mt-2">Upload Financial PDFs (Max 10MB)</p>
      </div>

      <div className="mt-4">
        {loading ? (
          <button disabled className="w-full bg-blue-600 text-white py-2 rounded-lg flex justify-center items-center gap-2 opacity-70">
            <Loader2 className="animate-spin w-4 h-4" /> Indexing...
          </button>
        ) : isIndexed ? (
          <div className="p-3 bg-green-50 text-green-700 rounded-lg flex items-center justify-center gap-2 text-sm font-medium border border-green-200">
            <CheckCircle className="w-4 h-4"/> Documents Indexed
          </div>
        ) : (
          <p className="text-sm text-center text-slate-500">Upload to start processing</p>
        )}
      </div>
    </div>
  );
};

export default UploadSection;