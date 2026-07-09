import React, { useState } from 'react'
import { ClipboardList, Building2, Clock, Zap, CheckCircle, Truck, Search, Plus } from 'lucide-react'
import { requests } from '../../data/mockData'

const urgencyColor = {
  Critical: 'bg-blood-900/60 text-blood-300 border border-blood-700',
  Urgent: 'bg-amber-900/60 text-amber-300 border border-amber-700',
  Normal: 'bg-emerald-900/60 text-emerald-300 border border-emerald-700',
}
const statusIcon = {
  Fulfilled: <CheckCircle size={14} className="text-emerald-400"/>,
  Processing: <Clock size={14} className="text-blue-400"/>,
  Pending: <Clock size={14} className="text-amber-400"/>,
  'In Transit': <Truck size={14} className="text-blue-400"/>,
  Allocated: <CheckCircle size={14} className="text-emerald-400"/>,
}

export default function RequestsPage({ showNewRequestForm }) {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(showNewRequestForm || false)
  const [formData, setFormData] = useState({ patient: '', hospital: '', bloodGroup: 'O+', units: 1, component: 'RBC', urgency: 'Normal', notes: '' })

  const statuses = ['All', 'Pending', 'Processing', 'Allocated', 'In Transit', 'Fulfilled']
  const filtered = requests.filter(r =>
    (filter === 'All' || r.status === filter) &&
    (r.patient.toLowerCase().includes(search.toLowerCase()) || r.hospital.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Blood Requests</h1>
          <p className="text-slate-500 text-sm mt-0.5">Track and manage all blood requisitions</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15}/> New Request
        </button>
      </div>

      {/* Summary Chips */}
      <div className="flex gap-3">
        {[
          { label: 'Critical', count: requests.filter(r=>r.urgency==='Critical').length, color: 'text-blood-400 bg-blood-900/30 border-blood-800' },
          { label: 'In Transit', count: requests.filter(r=>r.status==='In Transit').length, color: 'text-blue-400 bg-blue-900/30 border-blue-800' },
          { label: 'Pending', count: requests.filter(r=>r.status==='Pending').length, color: 'text-amber-400 bg-amber-900/30 border-amber-800' },
          { label: 'Fulfilled Today', count: requests.filter(r=>r.status==='Fulfilled').length, color: 'text-emerald-400 bg-emerald-900/30 border-emerald-800' },
        ].map((c,i) => (
          <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold ${c.color}`}>
            <span className="font-display font-bold text-lg leading-none">{c.count}</span> {c.label}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <div className="relative max-w-xs flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search patient or hospital..." className="input pl-9 text-sm"/>
        </div>
        <div className="flex bg-slate-800 rounded-xl p-1 gap-0.5">
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter===s ? 'bg-blood-600 text-white' : 'text-slate-400 hover:text-white'}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 text-xs uppercase border-b border-slate-800">
              {['Request ID','Patient','Hospital','Blood Group','Units','Component','Urgency','Status','Action'].map(h=>(
                <th key={h} className="text-left px-5 py-3.5 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(req => (
              <tr key={req.id} className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-all">
                <td className="px-5 py-4 text-slate-500 font-mono text-xs">{req.id}</td>
                <td className="px-5 py-4 font-medium text-white">{req.patient}</td>
                <td className="px-5 py-4 text-slate-400 flex items-center gap-1.5 mt-2">
                  <Building2 size={12}/>{req.hospital.split(' ')[0]}
                </td>
                <td className="px-5 py-4">
                  <span className="font-bold text-blood-300">{req.bloodGroup}</span>
                </td>
                <td className="px-5 py-4 text-white font-semibold">{req.units}</td>
                <td className="px-5 py-4 text-slate-400">{req.component}</td>
                <td className="px-5 py-4">
                  <span className={`badge text-xs px-2.5 py-1 rounded-full ${urgencyColor[req.urgency]}`}>{req.urgency}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    {statusIcon[req.status]}
                    <span className="text-slate-300">{req.status}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <button className="text-blood-400 hover:text-blood-300 text-xs font-medium hover:underline">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Request Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg mx-4">
            <h2 className="font-display font-bold text-xl text-white mb-5">New Blood Request</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Patient Name</label>
                  <input className="input text-sm" placeholder="Full name" value={formData.patient} onChange={e=>setFormData({...formData,patient:e.target.value})}/>
                </div>
                <div>
                  <label className="label">Hospital</label>
                  <input className="input text-sm" placeholder="Hospital name" value={formData.hospital} onChange={e=>setFormData({...formData,hospital:e.target.value})}/>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Blood Group</label>
                  <select className="input text-sm" value={formData.bloodGroup} onChange={e=>setFormData({...formData,bloodGroup:e.target.value})}>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g=><option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Units</label>
                  <input type="number" min={1} className="input text-sm" value={formData.units} onChange={e=>setFormData({...formData,units:e.target.value})}/>
                </div>
                <div>
                  <label className="label">Component</label>
                  <select className="input text-sm" value={formData.component} onChange={e=>setFormData({...formData,component:e.target.value})}>
                    {['RBC','Plasma','Platelets','Whole Blood'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Urgency Level</label>
                <div className="flex gap-3">
                  {['Normal','Urgent','Critical'].map(u=>(
                    <button key={u} onClick={()=>setFormData({...formData,urgency:u})}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        formData.urgency===u
                          ? u==='Critical' ? 'bg-blood-600 border-blood-500 text-white'
                          : u==='Urgent' ? 'bg-amber-600 border-amber-500 text-white'
                          : 'bg-emerald-700 border-emerald-600 text-white'
                          : 'border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}>{u}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Medical Notes</label>
                <textarea className="input text-sm resize-none h-20" placeholder="Optional notes..." value={formData.notes} onChange={e=>setFormData({...formData,notes:e.target.value})}/>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowForm(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={()=>setShowForm(false)} className="btn-primary flex-1 text-sm">Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
