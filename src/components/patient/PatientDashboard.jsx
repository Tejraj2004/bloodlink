import React, { useState } from 'react'
import { ClipboardList, MapPin, Clock, CheckCircle, Truck, Plus, Upload, Search } from 'lucide-react'
import { requests, inventory } from '../../data/mockData'
import { useApp } from '../../context/AppContext'

export default function PatientDashboard() {
  const { setActivePage } = useApp()
  const myRequests = requests.slice(0, 3)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">My Blood Requests</h1>
          <p className="text-slate-500 text-sm mt-0.5">Track and manage your blood requirements</p>
        </div>
        <button onClick={() => setActivePage('newrequest')} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15}/> New Request
        </button>
      </div>

      {/* Active requests */}
      <div className="space-y-3">
        {myRequests.map(req => (
          <div key={req.id} className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blood-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-blood-300 font-display font-bold text-lg">{req.bloodGroup}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white">{req.component}</span>
                  <span className="text-slate-500 text-sm">·</span>
                  <span className="text-slate-400 text-sm">{req.units} unit(s)</span>
                  <span className={`badge text-xs ${req.urgency==='Critical' ? 'badge-red' : req.urgency==='Urgent' ? 'badge-yellow' : 'badge-green'}`}>{req.urgency}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin size={11}/>{req.hospital}</span>
                  <span className="flex items-center gap-1"><Clock size={11}/>{req.date}</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`badge text-xs ${req.status==='Fulfilled' ? 'badge-green' : req.status==='In Transit' ? 'badge-blue' : 'badge-yellow'}`}>{req.status}</span>
                {req.assignedBank && <div className="text-xs text-slate-500 mt-1">{req.assignedBank}</div>}
              </div>
            </div>
            {req.status === 'In Transit' && (
              <div className="mt-3 pt-3 border-t border-slate-800">
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '70%' }}/>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1.5">
                  <span>Blood Bank</span><span className="text-blue-400 font-medium">ETA ~25 min</span><span>Hospital</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Nearby blood banks */}
      <div className="card">
        <div className="section-title mb-4">Nearby Blood Banks — Availability</div>
        <div className="grid grid-cols-3 gap-3">
          {['O+','A+','B+','AB-','O-','B-'].map(group => {
            const item = inventory.find(i => i.group === group)
            const total = item ? item.rbc + item.plasma : 0
            return (
              <div key={group} className="bg-slate-800 rounded-xl p-3 text-center">
                <div className="font-display font-bold text-blood-300 text-xl">{group}</div>
                <div className={`text-sm font-semibold mt-1 ${total > 20 ? 'text-emerald-400' : total > 5 ? 'text-amber-400' : 'text-blood-400'}`}>
                  {total > 20 ? 'Available' : total > 5 ? 'Low' : 'Critical'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{total} units nearby</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
