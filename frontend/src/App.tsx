import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CreateEventForm } from './components/CreateEventForm'
import { VotingGrid } from './components/VotingGrid'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
        
        {/* Simple Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                TimeSync
              </h1>
            </div>
            <nav>
              <a href="/" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">New Meeting</a>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-start min-h-[calc(100vh-4rem)]">
          <Routes>
            <Route path="/" element={<CreateEventForm />} />
            <Route path="/event/:id" element={<VotingGrid />} />
          </Routes>
        </main>

        {/* Simple Footer */}
        <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
          <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} TimeSync App. All rights reserved.
          </div>
        </footer>

      </div>
    </BrowserRouter>
  )
}

export default App
