import React, { useState } from 'react'
import { Building2, Truck, AlertTriangle, CheckCircle, Plus, MapPin, Clock, Zap } from 'lucide-react'
import { requests, deliveries, inventory } from '../../data/mockData'
import { useApp } from '../../context/AppContext'

export default function HospitalDashboard() {
  const { setActivePage } = useApp()
  const [showEmergency, setShowEmergency] = useState(false)

  const myRequests = requests.slice(0, 4)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">AIIMS Bhubaneswar</h1>
          <p className="text-slate-500 text-sm mt-0.5">Hospital Portal · Verified Partner</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowEmergency(true)} className="flex items-center gap-2 bg-blood-600 hover:bg-blood-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all animate-pulse">
            <Zap size={16}/> Emergency Request
          </button>
          <button onClick={() => setActivePage('requests')} className="btn-secondary flex items-center gap-2 text-sm">
            <Plus size={15}/> New Request
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Requests', value: 3, color: 'amber', sub: '1 critical' },
          { label: 'In Transit', value: 1, color: 'blue', sub: 'ETA 25 min' },
          { label: 'Fulfilled Today', value: 4, color: 'emerald', sub: 'all fulfilled' },
          { label: 'Total This Month', value: 28, color: 'purple', sub: '96% fulfillment' },
        ].map((s, i) => (
          <div key={i} className="card">
            <div className={`font-display text-3xl font-bold text-${s.color}-400`}>{s.value}</div>
            <div className="text-white text-sm font-medium mt-1">{s.label}</div>
            <div className="text-slate-600 text-xs mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* My Requests */}
        <div className="card col-span-2">
          <div className="section-title mb-4">Active Blood Requests</div>
          <div className="space-y-2">
            {myRequests.map(req => (
              <div key={req.id} className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl">
                <div className="w-10 h-10 bg-blood-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-blood-400 font-bold text-sm">{req.bloodGroup}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{req.patient}</div>
                  <div className="text-xs text-slate-500">{req.component} · {req.units} unit(s)</div>
                </div>
                <span className={`badge text-xs ${req.urgency==='Critical' ? 'badge-red' : req.urgency==='Urgent' ? 'badge-yellow' : 'badge-green'}`}>{req.urgency}</span>
                <span className={`badge text-xs ${req.status==='Fulfilled' ? 'badge-green' : req.status==='In Transit' ? 'badge-blue' : 'badge-yellow'}`}>{req.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nearby Blood Banks */}
        <div className="card">
          <div className="section-title mb-4">Nearby Blood Banks</div>
          <div className="space-y-3">
            {[
              { name: 'State Blood Bank', dist: '2.3 km', units: 248, available: true },
              { name: 'Tata Blood Centre', dist: '4.1 km', units: 95, available: true },
              { name: 'Red Cross Cuttack', dist: '28 km', units: 183, available: true },
            ].map((b, i) => (
              <div key={i} className="p-3 bg-slate-800 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium text-white">{b.name}</div>
                  <CheckCircle size={14} className="text-emerald-400"/>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-slate-500"><MapPin size={11}/>{b.dist}</span>
                  <span className="text-emerald-400 font-semibold">{b.units} units</span>
                </div>
                <button className="w-full mt-2 text-xs text-blood-400 hover:text-blood-300 font-medium">Request →</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Delivery Tracking */}
      {deliveries.filter(d => d.status === 'In Transit').map(d => (
        <div key={d.id} className="bg-blue-900/20 border border-blue-800/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-900/50 rounded-xl">
                <Truck size={20} className="text-blue-400"/>
              </div>
              <div>
                <div className="font-semibold text-white">Delivery {d.id} — In Transit</div>
                <div className="text-sm text-blue-400">{d.bloodGroup} · {d.units} units · Driver: {d.driver}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-blue-300 font-display text-2xl font-bold">{d.eta}</div>
              <div className="text-slate-500 text-xs">Estimated arrival</div>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="relative">
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}/>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1.5">
              <span>{d.from}</span>
              <span>{d.to}</span>
            </div>
          </div>
        </div>
      ))}

      {/* Emergency Modal */}
      {showEmergency && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-blood-700 rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-blood-900/50 rounded-xl"><Zap size={20} className="text-blood-400"/></div>
              <div>
                <h2 className="font-display font-bold text-xl text-white">Emergency Blood Request</h2>
                <p className="text-blood-400 text-xs">High priority — immediate allocation</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Blood Group</label>
                  <select className="input text-sm">{['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(g=><option key={g}>{g}</option>)}</select>
                </div>
                <div><label className="label">Units Needed</label>
                  <input type="number" className="input text-sm" defaultValue={2}/></div>
              </div>
              <div><label className="label">Component</label>
                <select className="input text-sm"><option>RBC</option><option>Plasma</option><option>Platelets</option><option>Whole Blood</option></select>
              </div>
              <div><label className="label">Patient Condition</label>
                <input className="input text-sm" placeholder="Brief description..."/></div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowEmergency(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={() => setShowEmergency(false)} className="flex-1 bg-blood-600 hover:bg-blood-500 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                <Zap size={15}/> Send Emergency Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
