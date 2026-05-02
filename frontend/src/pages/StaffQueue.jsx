import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api'

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })

const formatAmount = (amount, currency) =>
  new Intl.NumberFormat('en-ZA', { style: 'decimal', minimumFractionDigits: 2 }).format(amount) + ' ' + currency

export default function StaffQueue() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [actionLoading, setActionLoading] = useState({})
  const [successMsg, setSuccessMsg]     = useState('')

  const fetchPending = () => {
    setLoading(true)
    api.get('/transactions/pending')
      .then(({ data }) => setTransactions(data.transactions))
      .catch(() => setError('Could not load transactions.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchPending() }, [])

  const handleVerify = async (id) => {
    setActionLoading((p) => ({ ...p, [`verify_${id}`]: true }))
    try {
      await api.patch(`/transactions/${id}/verify`)
      setSuccessMsg('Transaction verified successfully.')
      fetchPending()
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed.')
    } finally {
      setActionLoading((p) => ({ ...p, [`verify_${id}`]: false }))
      setTimeout(() => setSuccessMsg(''), 3000)
    }
  }

  const handleSubmitToSwift = async (id) => {
    setActionLoading((p) => ({ ...p, [`submit_${id}`]: true }))
    try {
      await api.post(`/transactions/${id}/submit-to-swift`)
      setSuccessMsg('Transaction submitted to SWIFT successfully.')
      fetchPending()
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed.')
    } finally {
      setActionLoading((p) => ({ ...p, [`submit_${id}`]: false }))
      setTimeout(() => setSuccessMsg(''), 3000)
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1>
              Transaction Queue
              <span className="staff-badge">Staff</span>
            </h1>
            <p>Review, verify and submit pending customer payments to SWIFT</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={fetchPending} disabled={loading}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            Refresh
          </button>
        </div>

        {error   && <div className="alert alert-error">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <div className="card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#6b7280' }}>Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <svg width="40" height="40" fill="none" stroke="#d1d5db" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              <p>No pending transactions — all clear</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Account</th>
                    <th>Amount</th>
                    <th>SWIFT Code</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td style={{ fontWeight: 600 }}>{tx.customer?.fullName || '—'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{tx.customer?.accountNumber || '—'}</td>
                      <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{formatAmount(tx.amount, tx.currency)}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{tx.payeeSwiftCode}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(tx.createdAt)}</td>
                      <td>
                        <span className={`badge ${tx.status === 'PENDING' ? 'badge-pending' : 'badge-verified'}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {tx.status === 'PENDING' && (
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => handleVerify(tx.id)}
                              disabled={actionLoading[`verify_${tx.id}`]}
                            >
                              {actionLoading[`verify_${tx.id}`] ? <span className="spinner" style={{ borderColor: '#14532d', borderTopColor: '#14532d' }} /> : 'Verify'}
                            </button>
                          )}
                          {tx.status === 'VERIFIED' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleSubmitToSwift(tx.id)}
                              disabled={actionLoading[`submit_${tx.id}`]}
                            >
                              {actionLoading[`submit_${tx.id}`] ? <span className="spinner" /> : 'Submit to SWIFT'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Workflow guide */}
        <div className="card" style={{ marginTop: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#14532d', marginBottom: '0.5rem' }}>
            Verification Workflow
          </h3>
          <div style={{ display: 'flex', gap: '2rem', fontSize: '0.82rem', color: '#374151' }}>
            <div><strong style={{ color: '#d97706' }}>① PENDING</strong> — Customer submitted, awaiting staff review</div>
            <div><strong style={{ color: '#2563eb' }}>② VERIFIED</strong> — Staff verified, ready for SWIFT submission</div>
            <div><strong style={{ color: '#14532d' }}>③ SUBMITTED</strong> — Sent to SWIFT for processing</div>
          </div>
        </div>
      </main>
    </div>
  )
}
