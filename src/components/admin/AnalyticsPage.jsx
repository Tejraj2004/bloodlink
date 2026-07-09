import React from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { donationStats, inventory } from '../../data/mockData'

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

const pieData = inventory.map((item, i) => ({
  name: item.group,
  value: item.rbc + item.plasma + item.platelets,
  color: ['#e51d1d','#c11414','#f83b3b','#ff6b6b','#ffa0a0','#3b82f6','#10b981','#f59e0b'][i],
}))

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">Analytics & Reports</h1>
        <p className="text-slate-500 text-sm mt-0.5">Platform-wide performance and impact metrics</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Lives Saved', value: '2,841', delta: '+124 this month' },
          { label: 'Total Donations', value: '18,394', delta: '+221 this month' },
          { label: 'Avg Fulfillment Time', value: '4.2h', delta: '↓ 0.8h improved' },
          { label: 'Donor Retention', value: '78%', delta: '+3% vs last year' },
          { label: 'Camp Efficiency', value: '84%', delta: 'Target achieved' },
        ].map((k, i) => (
          <div key={i} className="card text-center">
            <div className="font-display text-2xl font-bold text-white">{k.value}</div>
            <div className="text-slate-400 text-xs mt-1">{k.label}</div>
            <div className="text-emerald-400 text-xs mt-1">{k.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Monthly Donations */}
        <div className="card">
          <div className="section-title mb-1">Monthly Donation Volume</div>
          <p className="text-slate-500 text-sm mb-4">Donations and camps conducted</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={donationStats}>
              <XAxis dataKey="month" stroke="#475569" tick={{ fill:'#64748b', fontSize:12 }} axisLine={false} tickLine={false}/>
              <YAxis stroke="#475569" tick={{ fill:'#64748b', fontSize:12 }} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="donations" name="Donations" fill="#e51d1d" radius={[6,6,0,0]}/>
              <Bar dataKey="camps" name="Camps" fill="#3b82f6" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Blood Group Distribution */}
        <div className="card">
          <div className="section-title mb-1">Blood Group Distribution</div>
          <p className="text-slate-500 text-sm mb-4">Inventory share by group</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color}/>
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 grid grid-cols-2 gap-1.5">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.color }}/>
                  <span className="text-xs text-slate-400">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* State-wise Table */}
      <div className="card">
        <div className="section-title mb-4">City-wise Performance (Odisha)</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 text-xs uppercase border-b border-slate-800">
              {['City','Registered Donors','Donations (Jun)','Active Requests','Blood Banks','Status'].map(h => (
                <th key={h} className="text-left py-3 pr-6 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { city:'Bhubaneswar', donors:842, donations:98, requests:8, banks:3, status:'Good' },
              { city:'Cuttack', donors:534, donations:65, requests:12, banks:2, status:'Low Stock' },
              { city:'Puri', donors:198, donations:28, requests:4, banks:1, status:'Critical' },
              { city:'Rourkela', donors:312, donations:41, requests:6, banks:2, status:'Good' },
              { city:'Sambalpur', donors:161, donations:19, requests:3, banks:1, status:'Low Stock' },
            ].map((row, i) => (
              <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="py-3 pr-6 text-white font-semibold">{row.city}</td>
                <td className="py-3 pr-6 text-slate-300">{row.donors}</td>
                <td className="py-3 pr-6 text-emerald-400 font-semibold">{row.donations}</td>
                <td className="py-3 pr-6 text-amber-400 font-semibold">{row.requests}</td>
                <td className="py-3 pr-6 text-slate-300">{row.banks}</td>
                <td className="py-3 pr-6">
                  <span className={`badge text-xs ${row.status==='Good' ? 'badge-green' : row.status==='Low Stock' ? 'badge-yellow' : 'badge-red'}`}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
