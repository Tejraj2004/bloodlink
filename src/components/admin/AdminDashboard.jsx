import React from 'react'
import {
  Droplets, Heart, AlertTriangle, CheckCircle, TrendingUp, Activity,
  ArrowUpRight, ArrowDownRight, MapPin, Clock, Zap, Users, Building2
} from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts'
import { inventory, donationStats, recentActivity, requests, demandForecast } from '../../data/mockData'
import { useApp } from '../../context/AppContext'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

const activityColors = {
  donation: 'text-emerald-400 bg-emerald-900/30',
  request: 'text-blood-400 bg-blood-900/30',
  delivery: 'text-blue-400 bg-blue-900/30',
  alert: 'text-amber-400 bg-amber-900/30',
  camp: 'text-purple-400 bg-purple-900/30',
}

const urgencyColor = { Critical: 'badge-red', Urgent: 'badge-yellow', Normal: 'badge-green' }
const statusColor = {
  Fulfilled: 'badge-green', Processing: 'badge-blue', Pending: 'badge-yellow',
  'In Transit': 'badge-blue', Allocated: 'badge-green'
}

export default function AdminDashboard() {
  const { setActivePage } = useApp()
  const totalUnits = inventory.reduce((s, i) => s + i.rbc + i.plasma + i.platelets + i.whole, 0)
  const criticalRequests = requests.filter(r => r.urgency === 'Critical').length

  const radialData = inventory.slice(0, 5).map((item, i) => ({
    name: item.group,
    value: item.rbc + item.platelets,
    fill: ['#e51d1d','#c11414','#f83b3b','#ff6b6b','#ffa0a0'][i]
  }))

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Blood Units', value: totalUnits, sub: '+38 today', up: true, icon: Droplets, color: 'blood' },
          { label: 'Active Donations', value: '1,847', sub: 'registered donors', up: true, icon: Heart, color: 'emerald' },
          { label: 'Critical Requests', value: criticalRequests, sub: 'needs immediate action', up: false, icon: AlertTriangle, color: 'amber' },
          { label: 'Fulfilled Today', value: 12, sub: 'across 8 hospitals', up: true, icon: CheckCircle, color: 'blue' },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl bg-${stat.color}-900/30 border border-${stat.color}-800/50`}>
                  <Icon size={20} className={`text-${stat.color}-400`} />
                </div>
                <span className={`flex items-center gap-1 text-xs font-semibold ${stat.up ? 'text-emerald-400' : 'text-blood-400'}`}>
                  {stat.up ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                  {stat.up ? 'Up' : 'Critical'}
                </span>
              </div>
              <div className="font-display text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
              <div className="text-xs text-slate-600 mt-0.5">{stat.sub}</div>
            </div>
          )
        })}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Donation Trend */}
        <div className="card col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="section-title">Donation & Demand Trend</div>
              <div className="text-slate-500 text-sm mt-0.5">Monthly overview with AI forecast</div>
            </div>
            <span className="badge-blue badge">AI Powered</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={demandForecast}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e51d1d" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#e51d1d" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#475569" tick={{ fill:'#64748b', fontSize:12 }} axisLine={false} tickLine={false}/>
              <YAxis stroke="#475569" tick={{ fill:'#64748b', fontSize:12 }} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="actual" name="Actual" stroke="#e51d1d" strokeWidth={2} fill="url(#colorActual)" connectNulls={false}/>
              <Area type="monotone" dataKey="forecast" name="Forecast" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 3" fill="url(#colorForecast)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Blood Group Distribution */}
        <div className="card">
          <div className="section-title mb-1">Inventory Status</div>
          <div className="text-slate-500 text-sm mb-4">Units by blood group</div>
          <div className="space-y-2.5">
            {inventory.map(item => {
              const total = item.rbc + item.plasma + item.platelets + item.whole
              const max = 140
              const pct = Math.min((total / max) * 100, 100)
              const color = pct < 20 ? 'bg-blood-600' : pct < 50 ? 'bg-amber-500' : 'bg-emerald-500'
              return (
                <div key={item.group} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white w-8">{item.group}</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-slate-400 w-8 text-right">{total}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Recent Requests */}
        <div className="card col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="section-title">Active Requests</div>
            <button onClick={() => setActivePage('requests')} className="text-blood-400 text-sm hover:text-blood-300 flex items-center gap-1">
              View all <ArrowUpRight size={14}/>
            </button>
          </div>
          <div className="space-y-2">
            {requests.map(req => (
              <div key={req.id} className="flex items-center gap-4 p-3 bg-slate-800/60 rounded-xl hover:bg-slate-800 transition-all">
                <div className="w-10 h-10 bg-blood-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-blood-400 font-bold text-sm">{req.bloodGroup}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{req.patient}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Building2 size={11}/> {req.hospital}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-white font-bold text-sm">{req.units}u</div>
                  <div className="text-xs text-slate-500">{req.component}</div>
                </div>
                <span className={urgencyColor[req.urgency]}>{req.urgency}</span>
                <span className={statusColor[req.status]}>{req.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="section-title">Live Activity</div>
            <span className="w-2 h-2 bg-emerald-500 rounded-full pulse-dot" />
          </div>
          <div className="space-y-3">
            {recentActivity.map(item => (
              <div key={item.id} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${activityColors[item.type]}`}>
                  {item.icon === 'heart' && <Heart size={13}/>}
                  {item.icon === 'alert' && <AlertTriangle size={13}/>}
                  {item.icon === 'truck' && <Activity size={13}/>}
                  {item.icon === 'warning' && <Zap size={13}/>}
                  {item.icon === 'calendar' && <Users size={13}/>}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-300 leading-relaxed">{item.message}</p>
                  <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1"><Clock size={10}/> {item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
