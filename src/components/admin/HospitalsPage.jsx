import React, { useState } from 'react'
import { Building2, CheckCircle, Clock, MapPin, Phone, Activity, AlertTriangle, Plus } from 'lucide-react'
import { hospitals } from '../../data/mockData'

export default function HospitalsPage() {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Hospital Network</h1>
          <p className="text-slate-500 text-sm mt-0.5">Verified hospitals and collaboration partners</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15}/> Register Hospital
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {hospitals.map(h => (
          <div key={h.id} className="card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-900/40 rounded-xl flex items-center justify-center border border-blue-800/50">
                  <Building2 size={22} className="text-blue-400"/>
                </div>
                <div>
                  <div className="font-semibold text-white">{h.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin size={11} className="text-slate-500"/><span className="text-slate-500 text-xs">{h.city}</span>
                    <span className="text-slate-700">·</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${h.type === 'Government' ? 'bg-purple-900/30 text-purple-400 border-purple-800' : 'bg-blue-900/30 text-blue-400 border-blue-800'}`}>{h.type}</span>
                  </div>
                </div>
              </div>
              {h.verified
                ? <span className="badge-green flex items-center gap-1"><CheckCircle size={11}/>Verified</span>
                : <span className="badge-yellow flex items-center gap-1"><Clock size={11}/>Pending</span>
              }
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-800 rounded-xl py-3">
                <div className="font-display font-bold text-white text-xl">{h.beds}</div>
                <div className="text-slate-500 text-xs">Beds</div>
              </div>
              <div className="bg-slate-800 rounded-xl py-3">
                <div className={`font-display font-bold text-xl ${h.activeRequests > 2 ? 'text-blood-400' : 'text-amber-400'}`}>{h.activeRequests}</div>
                <div className="text-slate-500 text-xs">Active Requests</div>
              </div>
              <div className="bg-slate-800 rounded-xl py-3">
                <div className="font-display font-bold text-emerald-400 text-xl">98%</div>
                <div className="text-slate-500 text-xs">Fulfillment</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn-secondary flex-1 text-xs py-2">View Profile</button>
              <button className="btn-primary flex-1 text-xs py-2">Send Blood</button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg mx-4">
            <h2 className="font-display font-bold text-xl text-white mb-5">Register Hospital</h2>
            <div className="space-y-4">
              {[['Hospital Name','text','e.g. Apollo Hospitals'],['City','text','City'],['Beds','number','Total beds'],['Contact Number','tel','Phone']].map(([label,type,ph]) => (
                <div key={label}>
                  <label className="label">{label}</label>
                  <input type={type} className="input text-sm" placeholder={ph}/>
                </div>
              ))}
              <div>
                <label className="label">Type</label>
                <select className="input text-sm">
                  <option>Government</option><option>Private</option><option>Trust</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={() => setShowAddModal(false)} className="btn-primary flex-1 text-sm">Submit for Verification</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
