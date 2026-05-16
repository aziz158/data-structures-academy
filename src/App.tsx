import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing/Landing'
import LinkedListPage from './pages/LinkedList/LinkedListPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/linked-list" element={<LinkedListPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
