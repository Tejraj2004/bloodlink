import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Droplets, AlertCircle, Loader2, ChevronRight, Check, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const ROLES = [
  { value:'donor',     label:'Donor',      icon:'❤️', emoji_bg:'bg-red-50',    desc:'Register to donate blood and save lives'           },
  { value:'patient',   label:'Patient',    icon:'🏥', emoji_bg:'bg-blue-50',   desc:'Request blood for yourself or a loved one'         },
  { value:'hospital',  label:'Hospital',   icon:'🏨', emoji_bg:'bg-violet-50', desc:'Manage blood requests for your hospital'           },
  { value:'bloodbank', label:'Blood Bank', icon:'🩸', emoji_bg:'bg-orange-50', desc:'Manage your blood bank operations'                 },
  { value:'ambulance', label:'Ambulance',  icon:'🚑', emoji_bg:'bg-amber-50',  desc:'Handle blood deliveries and logistics'             },
]
const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-']

export default function RegisterPage() {
  const { register, googleLogin, verifyOTP, resendOTP } = useAuth()
  const navigate = useNavigate()
  const [step, setStep]       = useState(1)
  const [role, setRole]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [otp, setOtp]         = useState('')
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({
    name:'', email:'', phone:'', password:'', confirmPassword:'',
    bloodGroup:'O+', dateOfBirth:'', gender:'Male', city:'', state:'Odisha',
    hospitalName:'', registrationNo:'', type:'Private', address:'',
    bankName:'', licenseNo:'',
  })
  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setError('') }

  const handleRoleSelect = (r) => { setRole(r); setStep(2) }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    try {
      const payload = { ...form, role }; delete payload.confirmPassword
      await register(payload)
      setRegEmail(form.email); setStep(3)
      toast.success('OTP sent to your email & phone!')
    } catch(err) {
      const msg = err.response?.data?.message || 'Registration failed'
      setError(msg); toast.error(msg)
    } finally { setLoading(false) }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await verifyOTP(regEmail, otp)
      toast.success('Account verified! Welcome to BloodLink 🩸')
      navigate('/', { replace: true })
    } catch(err) {
      setError(err.response?.data?.message || 'Invalid OTP')
    } finally { setLoading(false) }
  }

  const handleGoogle = useGoogleLogin({
    onSuccess: async (res) => {
      if (!role) { toast.error('Please select a role first'); return }
      setLoading(true)
      try {
        await googleLogin(res.access_token, role)
        toast.success('Registered with Google!')
        navigate('/', { replace: true })
      } catch(err) { setError(err.response?.data?.message||'Google sign-up failed') }
      finally { setLoading(false) }
    },
  })

  const GoogleSVG = () => (
    <svg width="17" height="17" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-600 rounded-2xl shadow-lg shadow-red-200 mb-3">
            <Droplets size={24} className="text-white"/>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your BloodLink account</h1>
          <p className="text-gray-500 text-sm mt-1">Already have an account? <Link to="/login" className="text-red-600 font-semibold hover:underline">Sign in</Link></p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-6 px-2">
          {['Role','Details','Verify'].map((s,i)=>(
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${i+1<=step?'text-red-600':'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${i+1<step?'bg-red-600 border-red-600 text-white':i+1===step?'border-red-600 text-red-600 bg-white':'border-gray-200 text-gray-400 bg-white'}`}>
                  {i+1<step?<Check size={14}/>:i+1}
                </div>
                <span className="text-xs font-medium hidden sm:block">{s}</span>
              </div>
              {i<2&&<div className={`flex-1 h-0.5 rounded ${i+1<step?'bg-red-600':'bg-gray-200'}`}/>}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {/* STEP 1: Role */}
          {step===1&&(
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">I am a...</h2>
              <p className="text-gray-500 text-sm mb-5">Select the role that best describes you</p>
              <div className="space-y-3">
                {ROLES.map(r=>(
                  <button key={r.value} onClick={()=>handleRoleSelect(r.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all hover:border-red-400 hover:bg-red-50 ${role===r.value?'border-red-600 bg-red-50':'border-gray-100'}`}>
                    <div className={`w-11 h-11 ${r.emoji_bg} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>{r.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{r.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{r.desc}</div>
                    </div>
                    <ChevronRight size={18} className="text-gray-300"/>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Details */}
          {step===2&&(
            <form onSubmit={handleRegister}>
              <div className="flex items-center gap-2 mb-5">
                <button type="button" onClick={()=>setStep(1)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <ArrowLeft size={18} className="text-gray-500"/>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{ROLES.find(r=>r.value===role)?.icon}</span>
                  <h2 className="text-lg font-bold text-gray-900">{ROLES.find(r=>r.value===role)?.label} Registration</h2>
                </div>
              </div>

              {error&&(
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-700 text-sm">
                  <AlertCircle size={15}/>{error}
                </div>
              )}

              <div className="space-y-4 max-h-[52vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="label">Full Name *</label>
                    <input className="input" required value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Your full name"/>
                  </div>
                  <div className="col-span-2">
                    <label className="label">Email *</label>
                    <input type="email" className="input" required value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@example.com"/>
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input className="input" maxLength={10} value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="10-digit mobile"/>
                  </div>
                  <div>
                    <label className="label">City</label>
                    <input className="input" value={form.city} onChange={e=>set('city',e.target.value)} placeholder="Your city"/>
                  </div>
                </div>

                {/* Donor specific */}
                {role==='donor'&&(
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Blood Group *</label>
                      <select className="input" value={form.bloodGroup} onChange={e=>set('bloodGroup',e.target.value)}>
                        {BLOOD_GROUPS.map(g=><option key={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Gender *</label>
                      <select className="input" value={form.gender} onChange={e=>set('gender',e.target.value)}>
                        <option>Male</option><option>Female</option><option>Other</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="label">Date of Birth *</label>
                      <input type="date" className="input" required value={form.dateOfBirth} onChange={e=>set('dateOfBirth',e.target.value)}/>
                    </div>
                  </div>
                )}

                {/* Hospital specific */}
                {role==='hospital'&&(
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="label">Hospital Name *</label>
                      <input className="input" required value={form.hospitalName} onChange={e=>set('hospitalName',e.target.value)} placeholder="e.g. AIIMS Bhubaneswar"/>
                    </div>
                    <div>
                      <label className="label">Registration No *</label>
                      <input className="input" required value={form.registrationNo} onChange={e=>set('registrationNo',e.target.value)}/>
                    </div>
                    <div>
                      <label className="label">Type</label>
                      <select className="input" value={form.type} onChange={e=>set('type',e.target.value)}>
                        <option>Government</option><option>Private</option><option>Trust</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="label">Address *</label>
                      <input className="input" required value={form.address} onChange={e=>set('address',e.target.value)}/>
                    </div>
                  </div>
                )}

                {/* Blood Bank specific */}
                {role==='bloodbank'&&(
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="label">Blood Bank Name *</label>
                      <input className="input" required value={form.bankName} onChange={e=>set('bankName',e.target.value)} placeholder="e.g. State Blood Bank"/>
                    </div>
                    <div className="col-span-2">
                      <label className="label">License No *</label>
                      <input className="input" required value={form.licenseNo} onChange={e=>set('licenseNo',e.target.value)}/>
                    </div>
                    <div className="col-span-2">
                      <label className="label">Address *</label>
                      <input className="input" required value={form.address} onChange={e=>set('address',e.target.value)}/>
                    </div>
                  </div>
                )}

                {/* Hospital/BloodBank pending notice */}
                {(role==='hospital'||role==='bloodbank')&&(
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex items-start gap-2">
                    <span>⚠️</span>
                    <span>Your account will be reviewed and approved by the admin before you can access all features.</span>
                  </div>
                )}

                {/* Password */}
                <div>
                  <label className="label">Password *</label>
                  <div className="relative">
                    <input type={showPass?'text':'password'} className="input pr-11" required minLength={8}
                      placeholder="Min 8 characters" value={form.password} onChange={e=>set('password',e.target.value)}/>
                    <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPass?<EyeOff size={16}/>:<Eye size={16}/>}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Confirm Password *</label>
                  <input type="password" className="input" required value={form.confirmPassword} onChange={e=>set('confirmPassword',e.target.value)} placeholder="Re-enter password"/>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                  {loading?<><Loader2 size={17} className="animate-spin"/>Creating...</>:<>Create Account <ChevronRight size={17}/></>}
                </button>
                <div className="relative flex items-center gap-3"><div className="flex-1 h-px bg-gray-200"/><span className="text-gray-400 text-xs">or</span><div className="flex-1 h-px bg-gray-200"/></div>
                <button type="button" onClick={()=>handleGoogle()} disabled={loading}
                  className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                  <GoogleSVG/> Continue with Google
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: OTP */}
          {step===3&&(
            <form onSubmit={handleVerifyOTP}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">📱</div>
                <h2 className="text-lg font-bold text-gray-900">Verify your account</h2>
                <p className="text-gray-500 text-sm mt-1">OTP sent to <span className="font-semibold text-gray-700">{regEmail}</span></p>
              </div>
              {error&&<div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-700 text-sm"><AlertCircle size={15}/>{error}</div>}
              <div className="mb-5">
                <label className="label text-center block">Enter 6-digit OTP</label>
                <input className="input text-center text-2xl font-bold tracking-[1.2rem]"
                  maxLength={6} placeholder="——————"
                  value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))} required/>
              </div>
              <button type="submit" disabled={loading||otp.length!==6} className="btn-primary w-full justify-center py-3">
                {loading?<><Loader2 size={17} className="animate-spin"/>Verifying...</>:'Verify & Activate Account'}
              </button>
              <p className="text-center text-sm text-gray-500 mt-4">
                Didn't receive it? <button type="button" onClick={()=>resendOTP(regEmail)} className="text-red-600 font-semibold hover:underline">Resend OTP</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
