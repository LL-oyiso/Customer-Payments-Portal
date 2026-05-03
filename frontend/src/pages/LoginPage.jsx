import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import api from '../api'
import logo from '../assets/logo.png'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', accountNumber: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data } = await api.post('/auth/login', form)
      login(data.user, data.accessToken, data.refreshToken)
      navigate(data.user.role === 'STAFF' ? '/staff' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      {/* Left panel */}
      <div style={styles.left}>
        <div style={styles.leftInner}>
          <div style={styles.logoRow}>
            <img src={logo} alt="RAND" style={styles.logoImg} />
            <span style={styles.logoText}>RAND</span>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={styles.heroText}>
              <h1 style={styles.heroHeading}>Secure International<br />Payments</h1>
              <p style={styles.heroSub}>
                Move money across borders with confidence.<br />
                Fast, compliant, and ironclad security.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Right panel */}
      <div style={styles.right}>
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Welcome back</h2>
          <p style={styles.formSub}>Sign in to your RAND account</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="accountNumber">Account Number</label>
              <input
                id="accountNumber"
                name="accountNumber"
                type="text"
                autoComplete="off"
                placeholder="Your bank account number"
                value={form.accountNumber}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  tabIndex={-1}
                >
                  {showPassword
                    ? <svg width="18" height="18" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="18" height="18" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              style={{ marginTop: '0.5rem', padding: '0.8rem' }}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : 'Sign In'}
            </button>
          </form>

          <p style={styles.switchText}>
            New customer?{' '}
            <Link to="/register" style={styles.switchLink}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
  },
  left: {
    flex: '0 0 48%',
    background: 'linear-gradient(160deg, #14532d 0%, #166534 60%, #15803d 100%)',
    display: 'flex',
    flexDirection: 'column',
    padding: '2.5rem',
    position: 'relative',
    overflow: 'hidden',
  },
  leftInner: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logoImg: {
    width: '48px',
    height: '48px',
    objectFit: 'contain',
    background: 'white',
    borderRadius: '50%',
    padding: '3px',
  },
  logoText: {
    color: 'white',
    fontSize: '1.4rem',
    fontWeight: '800',
    letterSpacing: '0.08em',
  },
  heroText: {
    textAlign: 'center',
    padding: '2rem 0',
  },
  heroHeading: {
    color: 'white',
    fontSize: '2.6rem',
    fontWeight: '800',
    lineHeight: '1.2',
    marginBottom: '1rem',
  },
  heroSub: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: '1rem',
    lineHeight: '1.7',
  },
  trustRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    alignItems: 'center',
  },
  trustItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    color: 'rgba(255,255,255,0.75)',
    fontSize: '0.88rem',
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f9fafb',
    padding: '2rem',
  },
  formCard: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '400px',
  },
  formTitle: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '0.35rem',
  },
  formSub: {
    color: '#6b7280',
    fontSize: '0.9rem',
    marginBottom: '1.75rem',
  },
  eyeBtn: {
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
  },
  switchText: {
    textAlign: 'center',
    marginTop: '1.5rem',
    fontSize: '0.88rem',
    color: '#6b7280',
  },
  switchLink: {
    color: '#14532d',
    fontWeight: '600',
    textDecoration: 'underline',
  },
}
