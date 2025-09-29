
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './auth/login'
import DonorDashboard from './Pages/DonorDashboard'
import StaffDashboard from './Pages/StaffDashboard'
import AdminDashboard from './Pages/AdminDashboard'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/donor-dashboard" element={<DonorDashboard />} />
          <Route path="/staff-dashboard" element={<StaffDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
