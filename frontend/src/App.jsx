import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CustomerDashboard from './pages/CustomerDashboard'
import NewPayment from './pages/NewPayment'
import TransactionHistory from './pages/TransactionHistory'
import StaffQueue from './pages/StaffQueue'
import AllTransactions from './pages/staff/AllTransactions'
import CustomerAccounts from './pages/staff/CustomerAccounts'
import Reports from './pages/staff/Reports'
import AuditLogs from './pages/staff/AuditLogs'
import Settings from './pages/staff/Settings'

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
            <Route path="/staff/all-transactions" element={<AllTransactions />} />
            <Route path="/staff/customers" element={<CustomerAccounts />} />
            <Route path="/staff/reports" element={<Reports />} />
            <Route path="/staff/audit-logs" element={<AuditLogs />} />
            <Route path="/staff/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
