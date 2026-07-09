import React from 'react'
import { Bell, AlertTriangle, Heart, Truck, CheckCircle, Info } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const icons = { critical: AlertTriangle, request: Bell, delivery: Truck, success: CheckCircle, info: Info, donation: Heart }
const colors = {
  critical: 'text-blood-400 bg-blood-900/30 border-blood-800',
  request: 'text-amber-400 bg-amber-900/30 border-amber-800',
  delivery: 'text-blue-400 bg-blue-900/30 border-blue-800',
  success: 'text-emerald-400 bg-emerald-900/30 border-emerald-800',
  info: 'text-slate-400 bg-slate-800 border-slate-700',
  donation: 'text-emerald-400 bg-emerald-900/30 border-emerald-800',
}

const allNotifications = [
  { id: 1, type: 'critical', title: 'O- Stock Critical', message: 'Only 3 units of O- remain across all centers. Immediate donor activation recommended.', time: '2 min ago', read: false },
  { id: 2, type: 'request', title: 'Emergency Request — AIIMS', message: 'AIIMS Bhubaneswar raised an emergency request for 2 units O- RBC. Assigned to State Blood Bank.', time: '8 min ago', read: false },
  { id: 3, type: 'delivery', title: 'Delivery DL002 In Transit', message: 'Delivery DL002 (AB-, 2 units) is on the way to SCB Medical. ETA: 25 minutes.', time: '15 min ago', read: true },
  { id: 4, type: 'donation', title: 'New Donation Recorded', message: 'Arjun Sharma donated O+ whole blood at State Blood Bank. Unit BU-20250616-001 created.', time: '1 hr ago', read: true },
  { id: 5, type: 'success', title: 'Request R001 Fulfilled', message: 'Blood request R001 for Rahul Das has been fulfilled successfully.', time: '2 hr ago', read: true },
  { id: 6, type: 'info', title: 'New Camp Registered', message: 'ITER College Blood Drive has been registered for June 20. 68 donors already registered.', time: '3 hr ago', read: true },
]

export default function NotificationsPage() {
  const { notifications, setNotifications } = useApp()

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Notifications</h1>
          <p className="text-slate-500 text-sm mt-0.5">{allNotifications.filter(n=>!n.read).length} unread alerts</p>
        </div>
        <button className="btn-secondary text-sm">Mark all read</button>
      </div>

      <div className="space-y-3">
        {allNotifications.map(n => {
          const Icon = icons[n.type] || Bell
          return (
            <div key={n.id} className={`card flex gap-4 transition-all ${!n.read ? 'border-slate-700' : 'opacity-70'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${colors[n.type]}`}>
                <Icon size={18}/>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-white text-sm">{n.title}</div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-600">{n.time}</span>
                    {!n.read && <span className="w-2 h-2 bg-blood-500 rounded-full"/>}
                  </div>
                </div>
                <p className="text-slate-400 text-sm mt-0.5 leading-relaxed">{n.message}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
