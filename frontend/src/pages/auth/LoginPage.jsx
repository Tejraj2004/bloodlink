import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Droplets, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const ROLES = [
  { value: 'donor',     label: 'Donor',      color: 'emerald' },
  { value: 'patient',   label: 'Patient',    color: 'blue'    },
  { value: 'hospital',  label: 'Hospital',   color: 'violet'  },
  { value: 'bloodbank', label: 'Blood Bank', color: 'orange'  },
  { value: 'ambulance', label: 'Ambulance',  color: 'amber'   },
  { value: 'admin',     label: 'Admin',      color: 'gray'    },
]

export default function LoginPage() {
  const { login, googleLogin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [form, setForm]         = useState({ email: '', password: '', role: 'donor' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError]       = useState('')

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await login(form.email, form.password, form.role)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      setError(msg)
      toast.error(msg)
    } finally { setLoading(false) }
  }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      setGoogleLoading(true)
      try {
        await googleLogin(response.access_token, form.role)
        toast.success('Logged in with Google!')
        navigate(from, { replace: true })
      } catch (err) {
        const msg = err.response?.data?.message || 'Google login failed'
        setError(msg); toast.error(msg)
      } finally { setGoogleLoading(false) }
    },
    onError: () => { setError('Google sign-in failed'); setGoogleLoading(false) },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-lg shadow-primary-200 mb-4">
            <Droplets size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">BloodLink</h1>
          <p className="text-gray-500 mt-1">Smart Blood Management Platform</p>
        </div>

        <div className="auth-card">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Sign in to your account</h2>
          <p className="text-gray-500 text-sm mb-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">Register here</Link>
          </p>

          {/* Role selector */}
          <div className="mb-5">
            <label className="label">Select your role</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(r => (
                <button key={r.value} type="button"
                  onClick={() => set('role', r.value)}
                  className={`py-2 px-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                    form.role === r.value
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >{r.label}</button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-700 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input pr-11"
                  placeholder="Enter your password"
                  value={form.password} onChange={e => set('password', e.target.value)} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-primary-600 w-4 h-4 rounded"/>
                <span className="text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-primary-600 hover:underline font-medium">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? <><Loader2 size={18} className="animate-spin"/>Signing in...</> : 'Sign in'}
            </button>
          </form>

          <div className="divider"><span className="text-gray-400 text-sm">or continue with</span></div>

          <button onClick={() => handleGoogleLogin()} disabled={googleLoading}
            className="btn-white w-full justify-center py-3 text-sm font-semibold">
            {googleLoading ? <Loader2 size={18} className="animate-spin"/> :
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            }
            Continue with Google
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            By signing in you agree to our{' '}
            <span className="text-primary-600 cursor-pointer hover:underline">Terms</span> &{' '}
            <span className="text-primary-600 cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  )
}
