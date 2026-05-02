import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CustomerDashboard from './pages/CustomerDashboard'
import NewPayment from './pages/NewPayment'
import TransactionHistory from './pages/TransactionHistory'
import StaffQueue from './pages/StaffQueue'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer routes */}
          <Route element={<ProtectedRoute role="CUSTOMER" />}>
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/new-payment" element={<NewPayment />} />
            <Route path="/transactions" element={<TransactionHistory />} />
          </Route>

          {/* Staff routes */}
          <Route element={<ProtectedRoute role="STAFF" />}>
            <Route path="/staff" element={<StaffQueue />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
