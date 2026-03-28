import React, { useEffect, useState } from 'react';
import { AlertCircle, ShieldCheck, Activity, Brain } from 'lucide-react';

interface AnalysisResult {
  center: [number, number, number];
  score: number;
  radius: number;
  malignancy_score: number;
  risk_level: string;
}

interface AnalysisDashboardProps {
  filename: string;
  isDemo?: boolean;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ filename, isDemo }) => {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      try {
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const response = await fetch(`${apiBaseUrl}/full-analysis/${filename}`);

        const data = await response.json();
        setResults(data.analysis_results);
      } catch (err) {
        console.error("Error fetching analysis:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalysis();
  }, [filename]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-12 bg-panel rounded-2xl border border-slate-800 gap-4">
      <Brain className="w-10 h-10 text-primary animate-pulse" />
      <span className="text-slate-400">AI Classification in progress...</span>
    </div>
  );

  const avgMalignancy = results.length > 0 
    ? (results.reduce((acc, r) => acc + r.malignancy_score, 0) / results.length * 100).toFixed(1)
    : "0";

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-panel p-6 rounded-2xl border border-slate-800">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Nodules Found</div>
          <div className="text-4xl font-bold flex items-center gap-2 text-white">
            <Activity className="text-primary" /> {results.length}
          </div>
        </div>
        <div className="bg-panel p-6 rounded-2xl border border-slate-800">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Avg. Malignancy Score</div>
          <div className="text-4xl font-bold flex items-center gap-2 text-white">
             <ShieldCheck className="text-secondary" /> 
             {avgMalignancy}%
          </div>
        </div>
      </div>

      <div className="bg-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 bg-slate-800/50 border-b border-slate-800">
          <h3 className="text-lg font-semibold flex items-center gap-2"> 
            <Brain size={20} className="text-primary" /> Detailed Nodule Report
          </h3>
        </div>
        <div className="divide-y divide-slate-800/50">
          {results.map((res, i) => (
            <div key={i} className="p-6 hover:bg-slate-800/30 transition-colors flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-slate-300">Nodule #{i+1}</span>
                <span className="text-xs text-slate-500 font-mono">
                  Z:{res.center[0]}, Y:{res.center[1]}, X:{res.center[2]} | Size: {res.radius*2}mm
                </span>
                <div className="mt-4 flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest
                    ${res.risk_level === 'high' ? 'bg-red-500/20 text-red-400' : 
                      res.risk_level === 'medium' ? 'bg-orange-500/20 text-orange-400' : 
                      'bg-green-500/20 text-green-400'}`}>
                    {res.risk_level} Risk
                  </span>
                  <div className="h-2 w-32 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        res.malignancy_score > 0.7 ? 'bg-red-500' : 
                        res.malignancy_score > 0.4 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${res.malignancy_score * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                 <div className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-tight">Malignancy Score</div>
                 <div className="text-2xl font-bold font-mono">{(res.malignancy_score * 100).toFixed(1)}%</div>
              </div>
            </div>
          ))}
          {results.length === 0 && (
            <div className="p-12 text-center text-slate-500">
               No nodules detected in this volume.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
