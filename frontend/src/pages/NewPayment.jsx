import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import api from '../api'

const CURRENCIES = [
  'USD','EUR','GBP','ZAR','JPY','CNY','AUD','CAD','CHF',
  'HKD','SGD','SEK','NOK','DKK','NZD','MXN','BRL','INR',
  'KRW','TRY','AED','SAR','NGN','KES','GHS','EGP',
]

// Client-side whitelist regex (mirrors backend validators.js)
const PATTERNS = {
  amount:        /^\d{1,12}(\.\d{1,2})?$/,
  payeeAccount:  /^[A-Z0-9]{1,34}$/,
  payeeSwiftCode:/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
}

const HINTS = {
  amount:        'Positive number, up to 2 decimal places',
  payeeAccount:  'Up to 34 alphanumeric characters (IBAN format)',
  payeeSwiftCode:'8 or 11 characters, e.g. FIRNZAJJ or FIRNZAJJXXX',
}

export default function NewPayment() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    amount: '', currency: 'USD', provider: 'SWIFT',
    payeeAccount: '', payeeSwiftCode: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const validateField = (name, value) => {
    if (!value) return 'This field is required.'
    if (PATTERNS[name] && !PATTERNS[name].test(value.toUpperCase())) return HINTS[name]
    if (name === 'amount' && parseFloat(value) <= 0) return 'Amount must be greater than zero.'
    return ''
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const formatted = ['payeeAccount', 'payeeSwiftCode'].includes(name) ? value.toUpperCase() : value
    setForm({ ...form, [name]: formatted })
    setError('')
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: validateField(name, formatted) })
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setFieldErrors({ ...fieldErrors, [name]: validateField(name, value) })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const errors = {}
    ;['amount', 'payeeAccount', 'payeeSwiftCode'].forEach((k) => {
      const err = validateField(k, form[k])
      if (err) errors[k] = err
    })

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    setError('')

    try {
      await api.post('/transactions', form)
      setSuccess('Payment submitted successfully. Redirecting...')
      setTimeout(() => navigate('/transactions'), 2000)
    } catch (err) {
      const detail = err.response?.data?.details
      if (detail) {
        const errs = {}
        detail.forEach(({ field, message }) => { errs[field] = message })
        setFieldErrors(errs)
      } else {
        setError(err.response?.data?.error || 'Submission failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>New International Payment</h1>
          <p>All payments are processed via SWIFT and encrypted end-to-end</p>
        </div>

        <div style={styles.formWrap}>
          <div className="card" style={styles.formCard}>
            {error   && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit} noValidate>
              {/* Amount + Currency row */}
              <div style={styles.row}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label htmlFor="amount">Amount</label>
                  <input
                    id="amount"
                    name="amount"
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={fieldErrors.amount ? 'error' : ''}
                    disabled={loading}
                  />
                  {fieldErrors.amount
                    ? <span className="form-error">{fieldErrors.amount}</span>
                    : <span className="form-hint">{HINTS.amount}</span>
                  }
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="currency">Currency</label>
                  <select
                    id="currency"
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Provider — locked to SWIFT */}
              <div className="form-group">
                <label htmlFor="provider">Payment Provider</label>
                <input
                  id="provider"
                  name="provider"
                  type="text"
                  value="SWIFT"
                  readOnly
                  style={{ background: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' }}
                />
                <span className="form-hint">International payments are processed via SWIFT only</span>
              </div>

              {/* Payee account */}
              <div className="form-group">
                <label htmlFor="payeeAccount">Payee Account Number (IBAN)</label>
                <input
                  id="payeeAccount"
                  name="payeeAccount"
                  type="text"
                  placeholder="e.g. DE89370400440532013000"
                  value={form.payeeAccount}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={fieldErrors.payeeAccount ? 'error' : ''}
                  disabled={loading}
                />
                {fieldErrors.payeeAccount
                  ? <span className="form-error">{fieldErrors.payeeAccount}</span>
                  : <span className="form-hint">{HINTS.payeeAccount}</span>
                }
              </div>

              {/* SWIFT code */}
              <div className="form-group">
                <label htmlFor="payeeSwiftCode">Payee SWIFT / BIC Code</label>
                <input
                  id="payeeSwiftCode"
                  name="payeeSwiftCode"
                  type="text"
                  placeholder="e.g. DEUTDEDB"
                  value={form.payeeSwiftCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={fieldErrors.payeeSwiftCode ? 'error' : ''}
                  disabled={loading}
                />
                {fieldErrors.payeeSwiftCode
                  ? <span className="form-error">{fieldErrors.payeeSwiftCode}</span>
                  : <span className="form-hint">{HINTS.payeeSwiftCode}</span>
                }
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                  disabled={loading}
                >
                  {loading ? <span className="spinner" /> : 'Submit Payment'}
                </button>
              </div>
            </form>

            <p style={styles.disclaimer}>
              By submitting, you confirm this payment is authorised and compliant with applicable regulations.
              All transactions are audit logged.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

const styles = {
  formWrap: { maxWidth: '600px' },
  formCard: { padding: '2rem' },
  secureNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#dcfce7',
    color: '#14532d',
    fontSize: '0.82rem',
    fontWeight: '600',
    padding: '0.6rem 0.85rem',
    borderRadius: '6px',
    marginBottom: '1.5rem',
    border: '1px solid #86efac',
  },
  row: { display: 'flex', gap: '1rem', alignItems: 'flex-start' },
  disclaimer: {
    marginTop: '1.25rem',
    fontSize: '0.75rem',
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: '1.6',
  },
}
