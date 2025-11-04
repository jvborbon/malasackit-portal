
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Authentication from './auth/Authentication'
import RouteProtection from './components/utilities/RouteProtection'
import Login from './auth/login'
import DonorDashboard from './Pages/DonorDashboard'
import StaffDashboard from './Pages/StaffDashboard'
import AdminDashboard from './Pages/AdminDashboard'
import './App.css'

function App() {
  return (
    <Router>
      <Authentication>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            
            <Route 
              path="/donor-dashboard" 
              element={
                <RouteProtection allowedRoles={['Donor', 'Resource Staff', 'Executive Admin']}>
                  <DonorDashboard />
                </RouteProtection>
              } 
            />
            
            <Route 
              path="/staff-dashboard" 
              element={
                <RouteProtection allowedRoles={['Resource Staff', 'Executive Admin']}>
                  <StaffDashboard />
                </RouteProtection>
              } 
            />
            
            <Route 
              path="/admin-dashboard" 
              element={
                <RouteProtection allowedRoles={['Executive Admin']}>
                  <AdminDashboard />
                </RouteProtection>
              } 
            />
            
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Authentication>
    </Router>
  )
}

export default App
