import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import zxcvbn from 'zxcvbn'
import api from '../api'
import logo from '../assets/logo.png'

const STRENGTH = [
  { label: 'Very weak', color: '#dc2626', width: '20%' },
  { label: 'Weak',      color: '#f97316', width: '40%' },
  { label: 'Fair',      color: '#eab308', width: '60%' },
  { label: 'Strong',    color: '#22c55e', width: '80%' },
  { label: 'Very strong', color: '#16a34a', width: '100%' },
]

// Client-side regex patterns (defense in depth — backend also validates)
const PATTERNS = {
  fullName:      /^[a-zA-Z\s'-]{2,100}$/,
  idNumber:      /^\d{13}$/,
  accountNumber: /^\d{7,11}$/,
  username:      /^[a-zA-Z0-9_]{3,30}$/,
  password:      /^.{12,128}$/,
}

const FIELD_HINTS = {
  fullName:      'Letters, spaces, hyphens and apostrophes only',
  idNumber:      'Exactly 13 digits',
  accountNumber: '7 to 11 digits',
  username:      '3–30 characters, letters, numbers and underscores only',
  password:      'Minimum 12 characters',
}

export default function RegisterPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '', idNumber: '', accountNumber: '', username: '', password: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const strength = form.password ? zxcvbn(form.password) : null

  const validateField = (name, value) => {
    if (!value) return 'This field is required.'
    if (PATTERNS[name] && !PATTERNS[name].test(value)) return FIELD_HINTS[name]
    return ''
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    setError('')
    setFieldErrors({ ...fieldErrors, [name]: validateField(name, value) })
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setFieldErrors({ ...fieldErrors, [name]: validateField(name, value) })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Full client-side validation pass
    const errors = {}
    Object.keys(form).forEach((k) => {
      const err = validateField(k, form[k])
      if (err) errors[k] = err
    })

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    if (strength && strength.score < 2) {
      setError('Please choose a stronger password.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await api.post('/auth/register', form)
      setSuccess('Account created successfully. Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const s = strength ? STRENGTH[strength.score] : null

  return (
    <div style={styles.page}>
      {/* Left panel */}
      <div style={styles.left}>
        <div style={styles.leftInner}>
          <div style={styles.logoRow}>
            <img src={logo} alt="RAND" style={styles.logoImg} />
            <span style={styles.logoText}>RAND</span>
          </div>

          <div style={styles.heroText}>
            <h1 style={styles.heroHeading}>Join RAND<br />Banking</h1>
            <p style={styles.heroSub}>
              Open your account in minutes.<br />
              Send money internationally with full SWIFT compliance.
            </p>
          </div>

          <div style={styles.trustRow}>
            <div style={styles.trustItem}>
              <svg width="20" height="20" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Argon2id Password Hashing</span>
            </div>
            <div style={styles.trustItem}>
              <svg width="20" height="20" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              <span>Breach Password Detection</span>
            </div>
            <div style={styles.trustItem}>
              <svg width="20" height="20" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              <span>End-to-End Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={styles.right}>
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Create account</h2>
          <p style={styles.formSub}>Fill in your details to get started</p>

          {error   && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {[
              { name: 'fullName',      label: 'Full Name',       type: 'text',     autocomplete: 'name' },
              { name: 'idNumber',      label: 'SA ID Number',    type: 'text',     autocomplete: 'off' },
              { name: 'accountNumber', label: 'Account Number',  type: 'text',     autocomplete: 'off' },
              { name: 'username',      label: 'Username',        type: 'text',     autocomplete: 'username' },
            ].map(({ name, label, type, autocomplete }) => (
              <div className="form-group" key={name}>
                <label htmlFor={name}>{label}</label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  autoComplete={autocomplete}
                  value={form[name]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={fieldErrors[name] ? 'error' : ''}
                  disabled={loading}
                />
                {fieldErrors[name]
                  ? <span className="form-error">{fieldErrors[name]}</span>
                  : <span className="form-hint">{FIELD_HINTS[name]}</span>
                }
              </div>
            ))}

            {/* Password with strength meter */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={fieldErrors.password ? 'error' : ''}
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

              {/* zxcvbn strength meter */}
              {form.password && s && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div className="strength-bar">
                    <div
                      className="strength-bar-fill"
                      style={{ width: s.width, background: s.color }}
                    />
                  </div>
                  <span className="strength-label" style={{ color: s.color }}>
                    {s.label}
                  </span>
                </div>
              )}

              {fieldErrors.password
                ? <span className="form-error">{fieldErrors.password}</span>
                : <span className="form-hint">{FIELD_HINTS.password}</span>
              }
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              style={{ marginTop: '0.5rem', padding: '0.8rem' }}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <p style={styles.switchText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.switchLink}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { display: 'flex', minHeight: '100vh' },
  left: {
    flex: '0 0 48%',
    background: 'linear-gradient(160deg, #14532d 0%, #166534 60%, #15803d 100%)',
    display: 'flex',
    flexDirection: 'column',
    padding: '2.5rem',
    overflow: 'hidden',
  },
  leftInner: { display: 'flex', flexDirection: 'column', height: '100%' },
  logoRow:   { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  logoImg:   { width: '48px', height: '48px', objectFit: 'contain', background: 'white', borderRadius: '50%', padding: '3px' },
  logoText:  { color: 'white', fontSize: '1.4rem', fontWeight: '800', letterSpacing: '0.08em' },
  heroText:  { marginTop: 'auto', marginBottom: '3rem' },
  heroHeading: { color: 'white', fontSize: '2.6rem', fontWeight: '800', lineHeight: '1.2', marginBottom: '1rem' },
  heroSub:   { color: 'rgba(255,255,255,0.72)', fontSize: '1rem', lineHeight: '1.7' },
  trustRow:  { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  trustItem: { display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem' },
  right:     { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', padding: '2rem' },
  formCard:  { background: 'white', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '2.5rem', width: '100%', maxWidth: '400px' },
  formTitle: { fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' },
  formSub:   { color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.75rem' },
  eyeBtn:    { position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' },
  switchText: { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: '#6b7280' },
  switchLink: { color: '#14532d', fontWeight: '600', textDecoration: 'underline' },
}
