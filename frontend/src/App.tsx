import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CreateEventForm } from './components/CreateEventForm'
import { VotingGrid } from './components/VotingGrid'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: '50px', maxWidth: '800px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<CreateEventForm />} />
          <Route path="/event/:id" element={<VotingGrid />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
