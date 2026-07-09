import React, { useState } from 'react'
import { Calendar, MapPin, Users, Target, Plus, TrendingUp } from 'lucide-react'
import { camps } from '../../data/mockData'

export default function CampaignsPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Donation Campaigns</h1>
          <p className="text-slate-500 text-sm mt-0.5">Upcoming camps and drives</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15}/> Create Camp
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Upcoming Camps', value: 3, color: 'text-blue-400' },
          { label: 'Total Registered', value: 224, color: 'text-white' },
          { label: 'Total Target', value: 330, color: 'text-amber-400' },
          { label: 'Success Rate', value: '84%', color: 'text-emerald-400' },
        ].map((s, i) => (
          <div key={i} className="card text-center">
            <div className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-slate-500 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Camps */}
      <div className="space-y-4">
        {camps.map(camp => {
          const pct = Math.round((camp.registered / camp.target) * 100)
          return (
            <div key={camp.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white text-lg">{camp.name}</h3>
                  <div className="flex items-center gap-4 mt-1.5 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><MapPin size={13}/>{camp.venue}</span>
                    <span className="flex items-center gap-1"><Calendar size={13}/>{camp.date}</span>
                    <span className="flex items-center gap-1"><Users size={13}/>{camp.organizer}</span>
                  </div>
                </div>
                <span className="badge-blue">Upcoming</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Registration</span><span>{camp.registered} / {camp.target}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blood-600 rounded-full transition-all" style={{ width: `${pct}%` }}/>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-xl font-bold text-blood-400">{pct}%</div>
                  <div className="text-xs text-slate-600">Filled</div>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button className="btn-secondary flex-1 text-sm">Manage</button>
                <button className="btn-primary flex-1 text-sm">View Registrations</button>
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg mx-4">
            <h2 className="font-display font-bold text-xl text-white mb-5">Create Donation Camp</h2>
            <div className="space-y-4">
              {[['Camp Name','text','e.g. College Blood Drive'],['Venue','text','Full address'],['Organizer','text','Organization name'],['Target Donors','number','100']].map(([label,type,ph]) => (
                <div key={label}><label className="label">{label}</label><input type={type} className="input text-sm" placeholder={ph}/></div>
              ))}
              <div><label className="label">Date</label><input type="date" className="input text-sm"/></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={() => setShowModal(false)} className="btn-primary flex-1 text-sm">Create Camp</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
