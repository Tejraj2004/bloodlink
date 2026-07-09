import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Calendar, MapPin, Award, CheckCircle, Clock, Droplets, Bell, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { StatCard, PageLoader, ProgressBar, EmptyState, Alert, Modal } from '../../components/shared/UI'
import SyncBanner from '../../components/shared/SyncBanner'
import { useSync } from '../../context/SyncContext'
import { useAuth } from '../../context/AuthContext'

const BADGES = [
  { name:'First Drop', icon:'🩸', threshold:1,  desc:'First donation' },
  { name:'Life Saver', icon:'❤️', threshold:5,  desc:'5 donations' },
  { name:'Iron Will',  icon:'🏆', threshold:10, desc:'10 donations' },
  { name:'Champion',   icon:'🥇', threshold:15, desc:'15 donations' },
  { name:'Legend',     icon:'👑', threshold:25, desc:'25 donations' },
  { name:'Rare Hero',  icon:'⭐', threshold:3,  desc:'Rare blood group' },
]

export default function DonorDashboard() {
  const { user } = useAuth()
  const { newCamps } = useSync()
  const [profile, setProfile]   = useState(null)
  const [stats, setStats]       = useState(null)
  const [history, setHistory]   = useState([])
  const [camps, setCamps]       = useState([])
  const [appts, setAppts]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [showApptModal, setShowApptModal] = useState(false)
  const [nearbyBanks, setNearbyBanks]     = useState([])
  const [apptForm, setApptForm] = useState({ bloodBankId:'', scheduledDate:'', scheduledTime:'10:00', notes:'' })
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      api.get('/donors/profile'),
      api.get('/donors/stats'),
      api.get('/donors/history'),
      api.get('/camps'),
      api.get('/donors/appointments'),
      api.get('/bloodbank/list'),
    ]).then(([p,s,h,c,a,b]) => {
      setProfile(p.data.data.profile)
      setStats(s.data.data)
      setHistory(h.data.data||[])
      setCamps(c.data.data?.camps||c.data.data||[])
      setAppts(a.data.data?.appointments||[])
      setNearbyBanks(b.data.data.banks||[])
    }).catch(console.error).finally(()=>setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  // New camp published in real-time → refresh
  useEffect(() => {
    if (newCamps.length) {
      setCamps(prev => {
        const ids = new Set(prev.map(c=>c._id))
        const fresh = newCamps.map(n=>n.camp).filter(c=>c&&!ids.has(c._id))
        return [...fresh, ...prev]
      })
      toast('📍 New donation camp available near you!', { icon:'📍', duration:6000 })
    }
  }, [newCamps.length])

  const registerCamp = async (campId) => {
    try {
      await api.post(`/camps/${campId}/register`)
      toast.success('✅ Registered for camp! Blood bank has been notified.')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message||'Registration failed')
    }
  }

  const bookAppointment = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/donors/appointments', apptForm)
      toast.success('✅ Appointment booked!')
      setShowApptModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message||'Booking failed')
    } finally { setSubmitting(false) }
  }

  if (loading) return <PageLoader/>

  const earnedBadges    = BADGES.filter(b => (stats?.totalDonations||0) >= b.threshold)
  const upcomingAppts   = appts.filter(a=>a.status==='Scheduled')
  const rareGroups      = ['O-','AB-','B-','A-']
  const isRare          = rareGroups.includes(profile?.bloodGroup)

  return (
    <div className="space-y-6 animate-fade-in">
      <SyncBanner/>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white shadow-lg shadow-red-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-red-200 text-sm mb-1">Welcome back,</p>
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className="bg-white/20 text-white text-sm font-bold px-3 py-1 rounded-full">{profile?.bloodGroup||'—'}</span>
              {isRare && <span className="bg-yellow-400/20 text-yellow-200 text-xs font-bold px-2 py-1 rounded-full border border-yellow-300/30">⭐ Rare Blood Group</span>}
              <span className="text-red-100 text-sm">❤️ {stats?.totalDonations||0} donations · {stats?.livesImpacted||0} lives saved</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-red-200 text-xs mb-1">AI Donor Score</div>
            <div className="text-4xl font-bold">{stats?.donorScore||0}</div>
            <div className="text-red-200 text-xs">/100</div>
          </div>
        </div>
      </div>

      {/* Eligibility */}
      {stats?.isEligible===false && stats?.nextEligibleDate && (
        <Alert type="warning" message={`You are not eligible to donate yet. Next eligible date: ${new Date(stats.nextEligibleDate).toDateString()}`}/>
      )}
      {stats?.isEligible===true && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600"/>
            <span className="text-green-800 font-semibold">You are eligible to donate right now!</span>
          </div>
          <button onClick={()=>setShowApptModal(true)} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all">
            Book Appointment
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Heart size={22}/>}       label="Total Donations"  value={stats?.totalDonations||0}  color="red"/>
        <StatCard icon={<Award size={22}/>}        label="Lives Impacted"   value={stats?.livesImpacted||0}   color="purple"/>
        <StatCard icon={<CheckCircle size={22}/>}  label="Donor Score"      value={`${stats?.donorScore||0}/100`} color="green"/>
        <StatCard icon={<Calendar size={22}/>}     label="Upcoming Appts"   value={upcomingAppts.length}       color="blue"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donation History */}
        <div className="card lg:col-span-2">
          <div className="section-header">
            <h2 className="section-title">Donation History</h2>
            <button onClick={load} className="p-1.5 hover:bg-gray-100 rounded-lg"><RefreshCw size={14} className="text-gray-400"/></button>
          </div>
          {history.length===0 ? (
            <EmptyState icon="🩸" title="No donations yet" description="Book an appointment to make your first life-saving donation."/>
          ) : (
            <div className="space-y-3">
              {history.slice(0,6).map((unit,i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-red-700 text-xs">{unit.bloodGroup}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{unit.bloodBank?.bankName||'Blood Bank'}</div>
                    <div className="text-xs text-gray-500">{unit.component} · {unit.bloodBank?.city}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">{new Date(unit.collectedAt).toLocaleDateString('en-IN')}</div>
                    <span className={`text-xs font-semibold ${unit.status==='Approved'?'text-green-600':'text-gray-400'}`}>{unit.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="card">
          <h2 className="section-title mb-4">Achievements</h2>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {BADGES.map(b => {
              const earned = (stats?.totalDonations||0) >= b.threshold
              return (
                <div key={b.name} title={b.desc}
                  className={`rounded-xl p-2.5 text-center border transition-all ${earned?'bg-amber-50 border-amber-200':'bg-gray-50 border-gray-100 opacity-40'}`}>
                  <div className="text-2xl mb-1">{b.icon}</div>
                  <div className={`text-xs font-semibold ${earned?'text-amber-700':'text-gray-400'}`}>{b.name}</div>
                </div>
              )
            })}
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <div className="text-sm text-gray-500">{earnedBadges.length} of {BADGES.length} badges earned</div>
            <ProgressBar value={earnedBadges.length} max={BADGES.length} color="red" showLabel/>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppts.length > 0 && (
        <div className="card">
          <h2 className="section-title mb-4">Upcoming Appointments</h2>
          <div className="space-y-3">
            {upcomingAppts.map(appt => (
              <div key={appt._id} className="flex items-center gap-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar size={18} className="text-blue-600"/>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">{appt.bloodBank?.bankName}</div>
                  <div className="text-xs text-gray-500">{appt.bloodBank?.city} · {appt.scheduledTime}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{new Date(appt.scheduledDate).toDateString()}</div>
                  <span className="badge-blue text-xs">Scheduled</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Donation Camps — real-time synced */}
      <div className="card">
        <div className="section-header">
          <h2 className="section-title">Donation Camps Near You</h2>
          <div className="flex items-center gap-2">
            <span className="relative inline-flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"/><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"/></span>
            <span className="text-xs text-green-600 font-medium">Live</span>
            <Link to="/camps" className="text-red-600 text-sm font-medium hover:underline">View all →</Link>
          </div>
        </div>
        {camps.length===0 ? (
          <EmptyState icon="📍" title="No upcoming camps" description="New donation camps published by blood banks will appear here instantly."/>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {camps.slice(0,3).map(camp => {
              const pct = Math.round(((camp.registeredDonors?.length||0)/camp.targetDonors)*100)
              const registered = camp.registeredDonors?.includes?.(user?._id)
              const full = (camp.registeredDonors?.length||0) >= camp.targetDonors
              return (
                <div key={camp._id} className="border border-gray-100 rounded-xl p-4 hover:border-red-200 hover:bg-red-50/20 transition-all">
                  <div className="font-semibold text-gray-900 text-sm mb-2">{camp.name}</div>
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1"><MapPin size={12}/>{camp.venue}</div>
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-3"><Calendar size={12}/>{new Date(camp.date).toDateString()}</div>
                  <ProgressBar value={camp.registeredDonors?.length||0} max={camp.targetDonors} showLabel/>
                  <button
                    onClick={() => registerCamp(camp._id)}
                    disabled={registered||full}
                    className={`mt-3 w-full text-xs font-bold py-2 rounded-xl border transition-all ${
                      registered?'bg-green-50 text-green-600 border-green-200 cursor-default':
                      full?'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed':
                      'bg-red-50 text-red-600 border-red-200 hover:bg-red-600 hover:text-white'
                    }`}>
                    {registered?'✓ Registered':full?'Fully Booked':'Register →'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      <Modal open={showApptModal} onClose={()=>setShowApptModal(false)} title="Book Donation Appointment">
        <form onSubmit={bookAppointment} className="space-y-4">
          <div>
            <label className="label">Select Blood Bank *</label>
            <select className="input" required value={apptForm.bloodBankId} onChange={e=>setApptForm(f=>({...f,bloodBankId:e.target.value}))}>
              <option value="">Choose a blood bank...</option>
              {nearbyBanks.map(b=><option key={b._id} value={b._id}>{b.bankName} — {b.city}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Date *</label>
              <input type="date" className="input" required value={apptForm.scheduledDate} onChange={e=>setApptForm(f=>({...f,scheduledDate:e.target.value}))} min={new Date().toISOString().split('T')[0]}/></div>
            <div><label className="label">Time *</label>
              <input type="time" className="input" required value={apptForm.scheduledTime} onChange={e=>setApptForm(f=>({...f,scheduledTime:e.target.value}))}/></div>
          </div>
          <div><label className="label">Notes</label>
            <textarea className="input resize-none h-16" placeholder="Any special notes..." value={apptForm.notes} onChange={e=>setApptForm(f=>({...f,notes:e.target.value}))}/></div>
          <div className="flex gap-3">
            <button type="button" onClick={()=>setShowApptModal(false)} className="btn-white flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting?'Booking...':'Book Appointment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
