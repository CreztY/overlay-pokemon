import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Landing from './pages/Landing'
import Admin from './pages/Admin'
import Panel from './pages/Panel'
import Overlay from './pages/Overlay'
import Error404 from './pages/Error404'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/panel" element={<Panel />} />
          <Route path="/overlay/:apiKey" element={<Overlay />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
