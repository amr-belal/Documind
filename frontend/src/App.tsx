import { Sidebar } from './components/Sidebar';

function App() {
  return (
    <div className="flex h-screen bg-gray-50 text-slate-900 overflow-hidden">
      {/* استدعاء الـ Sidebar هنا */}
      <Sidebar />

      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center px-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700">Knowledge Graph Chat</h2>
        </header>

        <div className="flex-1 p-8 overflow-y-auto bg-[#f8fafc]">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-slate-600 leading-relaxed">
                Welcome <span className="font-bold text-blue-600">Amr</span>! 
                Start by uploading research papers.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border-t">
          <div className="max-w-3xl mx-auto relative">
            <input 
              type="text" 
              placeholder="Ask about your papers..." 
              className="w-full p-4 pr-12 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 shadow-sm"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;