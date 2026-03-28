import { useState } from 'react'
import { Activity, Brain, LayoutDashboard, Database, HelpCircle, User, ShieldCheck } from 'lucide-react'
import UploadZone from './components/UploadZone'
import SliceViewer from './components/SliceViewer'
import AnalysisDashboard from './components/AnalysisDashboard'

function App() {
  const [sessionData, setSessionData] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 flex flex-col p-6 gap-8 bg-panel/30">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20">
            <Activity className="text-primary w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">LungSense AI</span>
        </div>

        <nav className="flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-xl font-medium transition-all border border-primary/20">
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-800/50 rounded-xl font-medium transition-all group">
            <Database size={20} className="group-hover:text-slate-300" /> Datasets
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-800/50 rounded-xl font-medium transition-all group">
            <HelpCircle size={20} className="group-hover:text-slate-300" /> Support
          </button>
        </nav>

        <div className="mt-auto flex flex-col gap-4">
          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-800 flex flex-col gap-3">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
               <ShieldCheck size={14} className="text-secondary" /> System Health
             </div>
             <div className="flex items-center justify-between text-xs">
               <span className="text-slate-400">ML Pipeline</span>
               <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
             </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-slate-800/30 rounded-xl">
             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
               <User size={16} className="text-slate-400" />
             </div>
             <span className="text-sm font-medium text-slate-300">Admin User</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-10 bg-panel/10 backdrop-blur-md">
           <h2 className="text-lg font-semibold text-slate-200">Patient Analysis Terminal</h2>
           <div className="flex items-center gap-4">
             <div className="px-3 py-1 bg-slate-800 rounded-full text-[10px] font-bold text-slate-400 border border-slate-700 uppercase tracking-widest">
                MVP v0.1.0
             </div>
             <button className="px-5 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-primary/20">
               New Session
             </button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          <div className="max-w-6xl mx-auto flex flex-col gap-8">
            {!sessionData ? (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <h1 className="text-3xl font-bold text-white tracking-tight">Lung Nodule Detection System</h1>
                  <p className="text-slate-400">Upload a 3D CT scan to begin the AI-powered diagnostic process.</p>
                </div>
                <UploadZone onUploadSuccess={(data) => setSessionData(data)} />
              </div>
            ) : (
              <div className="flex flex-col gap-8 animate-in fade-in duration-700">
                <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                  <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Analysis Results</h1>
                    <p className="text-slate-400">Scan: {sessionData.filename} | {sessionData.num_slices} Total Slices</p>
                  </div>
                  <button 
                    onClick={() => setSessionData(null)}
                    className="text-primary text-sm font-bold border-b border-primary/30 hover:border-primary transition-all"
                  >
                    Close Session
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-5 sticky top-0">
                    <SliceViewer 
                      filename={sessionData.filename} 
                      numSlices={sessionData.num_slices} 
                      detections={sessionData.detections}
                    />
                  </div>
                  <div className="lg:col-span-7">
                    <AnalysisDashboard 
                      filename={sessionData.filename} 
                      isDemo={sessionData.is_demo}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
