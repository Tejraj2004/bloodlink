import React, { useState } from 'react'
import { Search, Bell, ChevronDown, Activity, Zap } from 'lucide-react'
import { useApp, roles } from '../../context/AppContext'

const roleGradients = {
  admin: 'from-purple-600 to-purple-800',
  bloodbank: 'from-blood-600 to-blood-800',
  hospital: 'from-blue-600 to-blue-800',
  donor: 'from-emerald-600 to-emerald-800',
  patient: 'from-amber-600 to-amber-800',
  ambulance: 'from-orange-600 to-orange-800',
}

export default function Header() {
  const { activeRole, setActiveRole, setActivePage, notifications } = useApp()
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const unread = notifications.filter(n => !n.read).length
  const currentRole = roles.find(r => r.id === activeRole)

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Left: Search */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search donors, requests, hospitals..."
            className="bg-slate-800 text-sm text-slate-300 rounded-xl pl-9 pr-4 py-2 w-72 focus:outline-none focus:ring-1 focus:ring-blood-500 placeholder:text-slate-500 border border-slate-700"
          />
        </div>
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 bg-emerald-900/30 border border-emerald-800/50 rounded-lg px-3 py-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full pulse-dot" />
          <span className="text-xs text-emerald-400 font-medium">Live</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Emergency button */}
        <button
          onClick={() => setActivePage('emergency')}
          className="flex items-center gap-2 bg-blood-600 hover:bg-blood-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-blood-900/30"
        >
          <Zap size={15} />
          Emergency
        </button>

        {/* Notifications */}
        <button
          onClick={() => setActivePage('notifications')}
          className="relative p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blood-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unread}
            </span>
          )}
        </button>

        {/* Role switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl px-3 py-2 transition-all"
          >
            <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${roleGradients[activeRole]} flex items-center justify-center`}>
              <span className="text-white text-xs font-bold">{currentRole?.label[0]}</span>
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-white">{currentRole?.label}</div>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="p-2 space-y-1">
                <div className="px-3 py-1.5 text-xs text-slate-500 font-medium">Switch Portal</div>
                {roles.map(role => (
                  <button
                    key={role.id}
                    onClick={() => { setActiveRole(role.id); setActivePage('dashboard'); setShowRoleMenu(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                      activeRole === role.id ? 'bg-blood-900/40 text-blood-300' : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${roleGradients[role.id]}`} />
                    <span className="text-sm font-medium">{role.label}</span>
                    {activeRole === role.id && <Activity size={12} className="ml-auto text-blood-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
