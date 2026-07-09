import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Droplets, AlertCircle, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function ForgotPasswordPage() {
  const { forgotPassword, resetPassword } = useAuth()
  const [step, setStep]       = useState(1) // 1=email, 2=otp+newpass
  const [email, setEmail]     = useState('')
  const [otp, setOtp]         = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [done, setDone]       = useState(false)

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await forgotPassword(email)
      toast.success('OTP sent!')
      setStep(2)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP'
      setError(msg)
    } finally { setLoading(false) }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (newPass !== confirm) { setError('Passwords do not match'); return }
    setLoading(true); setError('')
    try {
      await resetPassword(email, otp, newPass)
      setDone(true)
      toast.success('Password reset successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl shadow-lg shadow-primary-200 mb-4">
            <Droplets size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">BloodLink</h1>
        </div>

        <div className="auth-card">
          {done ? (
            <div className="text-center py-4">
              <CheckCircle size={52} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Password reset!</h2>
              <p className="text-gray-500 text-sm mb-6">Your password has been updated successfully.</p>
              <Link to="/login" className="btn-primary justify-center w-full py-3">Back to Sign In</Link>
            </div>
          ) : (
            <>
              <Link to="/login" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm mb-5">
                <ArrowLeft size={15}/> Back to login
              </Link>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {step === 1 ? 'Forgot your password?' : 'Reset your password'}
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                {step === 1 ? 'Enter your email and we\'ll send a reset OTP.' : `OTP sent to ${email}`}
              </p>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-700 text-sm">
                  <AlertCircle size={15}/>{error}
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="label">Email address</label>
                    <input type="email" className="input" placeholder="you@example.com"
                      value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                    {loading ? <><Loader2 size={17} className="animate-spin"/>Sending...</> : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleReset} className="space-y-4">
                  <div>
                    <label className="label">OTP Code</label>
                    <input className="input text-center text-xl font-bold tracking-[0.8rem]"
                      maxLength={6} placeholder="------"
                      value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,''))} required />
                  </div>
                  <div>
                    <label className="label">New Password</label>
                    <input type="password" className="input" placeholder="Min 8 characters"
                      minLength={8} value={newPass} onChange={e => setNewPass(e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">Confirm Password</label>
                    <input type="password" className="input" placeholder="Re-enter password"
                      value={confirm} onChange={e => setConfirm(e.target.value)} required />
                  </div>
                  <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full justify-center py-3">
                    {loading ? <><Loader2 size={17} className="animate-spin"/>Resetting...</> : 'Reset Password'}
                  </button>
                  <button type="button" onClick={() => setStep(1)} className="btn-ghost w-full justify-center text-sm">
                    Change email
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
