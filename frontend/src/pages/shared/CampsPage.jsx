import React, { useState, useEffect, useCallback } from 'react'
import { MapPin, Calendar, Users, Plus, Search, RefreshCw, Activity } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { PageLoader, ProgressBar, Modal, EmptyState } from '../../components/shared/UI'
import SyncBanner from '../../components/shared/SyncBanner'
import { useAuth } from '../../context/AuthContext'
import { useSync } from '../../context/SyncContext'

export default function CampsPage() {
  const { user } = useAuth()
  const { newCamps } = useSync()
  const [camps, setCamps]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting]= useState(false)
  const [search, setSearch]       = useState('')
  const [form, setForm] = useState({ name:'', venue:'', address:'', city:'', date:'', startTime:'09:00', endTime:'17:00', targetDonors:100, description:'' })
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const canCreate = ['admin','bloodbank'].includes(user?.role)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/camps').then(r => setCamps(r.data.data?.camps || r.data.data || []))
      .catch(console.error).finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  // Real-time: new camp published by blood bank → show to donors
  useEffect(() => {
    if (!newCamps.length) return
    setCamps(prev => {
      const ids = new Set(prev.map(c=>c._id))
      const fresh = newCamps.map(n=>n.camp).filter(c=>c&&!ids.has(c._id))
      return [...fresh, ...prev]
    })
  }, [newCamps.length])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/camps', form)
      toast.success('✅ Camp created! All eligible donors have been notified via push & email.')
      setShowModal(false)
      setForm({name:'',venue:'',address:'',city:'',date:'',startTime:'09:00',endTime:'17:00',targetDonors:100,description:''})
      load()
    } catch(err) { toast.error(err.response?.data?.message||'Failed') }
    finally { setSubmitting(false) }
  }

  const handleRegister = async (campId) => {
    try {
      await api.post(`/camps/${campId}/register`)
      toast.success('✅ Registered! Blood bank has been notified.')
      load()
    } catch(err) { toast.error(err.response?.data?.message||'Registration failed') }
  }

  const filtered = camps.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.city?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5 animate-fade-in">
      <SyncBanner/>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Donation Camps</h1>
          <p className="page-subtitle flex items-center gap-2">
            Upcoming blood donation drives · real-time synced with donors
            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/>Live
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-white py-2 px-3"><RefreshCw size={15}/></button>
          {canCreate && (
            <button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={17}/>Create Camp</button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {label:'Upcoming',     value: camps.filter(c=>c.status==='Upcoming').length,  color:'text-blue-600'   },
          {label:'Total Registered', value: camps.reduce((s,c)=>s+(c.registeredDonors?.length||0),0), color:'text-red-600' },
          {label:'Total Target', value: camps.reduce((s,c)=>s+(c.targetDonors||0),0),  color:'text-amber-600'  },
        ].map((s,i)=>(
          <div key={i} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input className="input pl-9 py-2 text-sm" placeholder="Search camps..."
          value={search} onChange={e => setSearch(e.target.value)}/>
      </div>

      {loading ? <PageLoader/> : filtered.length===0 ? (
        <EmptyState icon="📍" title="No camps found" description={canCreate?"Create the first camp to notify all eligible donors instantly.":"No upcoming donation camps. Check back soon!"}/>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(camp => {
            const registered  = camp.registeredDonors?.length||0
            const isRegistered= camp.registeredDonors?.includes?.(user?._id)
            const isFull      = registered >= camp.targetDonors
            return (
              <div key={camp._id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-red-100 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🩸</div>
                  <span className={`badge text-xs ${camp.status==='Upcoming'?'badge-blue':camp.status==='Ongoing'?'badge-green':camp.status==='Completed'?'badge-gray':'badge-red'}`}>
                    {camp.status}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-3 leading-snug">{camp.name}</h3>
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm"><MapPin size={14} className="text-red-400 flex-shrink-0"/><span className="truncate">{camp.venue}, {camp.city}</span></div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm"><Calendar size={14} className="text-red-400 flex-shrink-0"/>{new Date(camp.date).toDateString()} · {camp.startTime}–{camp.endTime}</div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm"><Users size={14} className="text-red-400 flex-shrink-0"/>{camp.organizer?.name||'Organizer'}</div>
                </div>
                {camp.description && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{camp.description}</p>}
                <ProgressBar value={registered} max={camp.targetDonors} showLabel/>
                {user?.role==='donor' && camp.status==='Upcoming' && (
                  <button
                    onClick={() => handleRegister(camp._id)}
                    disabled={isRegistered||isFull}
                    className={`mt-3 w-full py-2 rounded-xl text-sm font-bold transition-all border ${
                      isRegistered?'bg-green-50 text-green-700 border-green-200 cursor-default':
                      isFull?'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed':
                      'bg-red-50 text-red-600 border-red-200 hover:bg-red-600 hover:text-white'
                    }`}>
                    {isRegistered?'✓ Registered':isFull?'Fully Booked':'Register →'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showModal} onClose={()=>setShowModal(false)} title="Create Donation Camp" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="label">Camp Name *</label>
            <input className="input" required value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. ITER College Blood Drive"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Venue *</label>
              <input className="input" required value={form.venue} onChange={e=>set('venue',e.target.value)}/></div>
            <div><label className="label">City *</label>
              <input className="input" required value={form.city} onChange={e=>set('city',e.target.value)}/></div>
          </div>
          <div><label className="label">Address *</label>
            <input className="input" required value={form.address} onChange={e=>set('address',e.target.value)}/></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Date *</label>
              <input type="date" className="input" required value={form.date} onChange={e=>set('date',e.target.value)}/></div>
            <div><label className="label">Start</label>
              <input type="time" className="input" value={form.startTime} onChange={e=>set('startTime',e.target.value)}/></div>
            <div><label className="label">End</label>
              <input type="time" className="input" value={form.endTime} onChange={e=>set('endTime',e.target.value)}/></div>
          </div>
          <div><label className="label">Target Donors</label>
            <input type="number" min={1} className="input" value={form.targetDonors} onChange={e=>set('targetDonors',e.target.value)}/></div>
          <div><label className="label">Description</label>
            <textarea className="input resize-none h-20" value={form.description} onChange={e=>set('description',e.target.value)}/></div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 flex items-center gap-2">
            <Activity size={13}/>Publishing will instantly notify all eligible donors via push notification and email.
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={()=>setShowModal(false)} className="btn-white flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting?'Creating...':'Create & Notify Donors'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
