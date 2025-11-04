
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AdminRoute, StaffRoute, DonorRoute, PublicRoute } from './components/utilities/ProtectedRoute'
import Login from './auth/login'
import DonorDashboard from './Pages/DonorDashboard'
import StaffDashboard from './Pages/StaffDashboard'
import AdminDashboard from './Pages/AdminDashboard'
import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            
            <Route 
              path="/donor-dashboard" 
              element={
                <DonorRoute>
                  <DonorDashboard />
                </DonorRoute>
              } 
            />
            
            <Route 
              path="/staff-dashboard" 
              element={
                <StaffRoute>
                  <StaffDashboard />
                </StaffRoute>
              } 
            />
            
            <Route 
              path="/admin-dashboard" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
