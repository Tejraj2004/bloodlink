import React, { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../../services/api'
import { PageLoader } from '../../components/shared/UI'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const COLORS  = ['#dc2626','#b91c1c','#ef4444','#f87171','#fca5a5','#7c3aed','#2563eb','#059669']

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="text-gray-500 font-medium mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} style={{color:p.color}} className="font-semibold">{p.name}: {p.value}</p>)}
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData]     = useState(null)
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/analytics'),
      api.get('/admin/dashboard'),
    ]).then(([a, s]) => {
      setData(a.data.data)
      setStats(s.data.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  const donTrend = data?.monthlyDonations?.map(d => ({
    month: MONTHS[d._id.month - 1], donations: d.count
  })) || []

  const reqTrend = data?.monthlyRequests?.map(d => ({
    month: MONTHS[d._id.month - 1], requests: d.count
  })) || []

  const merged = MONTHS.slice(0, Math.max(donTrend.length, reqTrend.length, 6)).map((m, i) => ({
    month: m,
    donations: donTrend[i]?.donations || 0,
    requests:  reqTrend[i]?.requests  || 0,
  }))

  const pieData = data?.bloodGroupDistribution?.map((d, i) => ({
    name: d._id, value: d.count, color: COLORS[i % COLORS.length]
  })) || []

  const statusData = data?.fulfilmentRate?.map(s => ({ name: s._id, value: s.count })) || []

  const kpis = [
    { label:'Total Donors',     value: stats?.totalDonors?.toLocaleString() || 0 },
    { label:'Total Hospitals',  value: stats?.totalHospitals || 0 },
    { label:'Blood Banks',      value: stats?.totalBanks || 0 },
    { label:'Total Requests',   value: stats?.totalRequests?.toLocaleString() || 0 },
    { label:'Donations Today',  value: stats?.donationsToday || 0 },
    { label:'Fulfilled Today',  value: stats?.fulfilledToday || 0 },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Analytics & Reports</h1>
        <p className="page-subtitle">Platform-wide performance metrics and insights</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="card text-center py-4">
            <div className="text-2xl font-bold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-500 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="section-title mb-4">Monthly Donations</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={merged}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:'#9ca3af',fontSize:12}}/>
              <YAxis axisLine={false} tickLine={false} tick={{fill:'#9ca3af',fontSize:12}}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Bar dataKey="donations" name="Donations" fill="#dc2626" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="section-title mb-4">Monthly Requests</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={merged}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:'#9ca3af',fontSize:12}}/>
              <YAxis axisLine={false} tickLine={false} tick={{fill:'#9ca3af',fontSize:12}}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Line type="monotone" dataKey="requests" name="Requests" stroke="#2563eb" strokeWidth={2.5} dot={{ fill:'#2563eb', r:4 }}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Group Pie */}
        <div className="card">
          <h2 className="section-title mb-4">Blood Group Distribution</h2>
          {pieData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.color}/>)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{background:d.color}}/>
                    <span className="text-xs text-gray-500">{d.name} — {d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Request Status */}
        <div className="card">
          <h2 className="section-title mb-4">Request Fulfilment Status</h2>
          {statusData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={statusData} layout="vertical">
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill:'#9ca3af',fontSize:11}}/>
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#6b7280',fontSize:11}} width={70}/>
                <Tooltip content={<ChartTooltip/>}/>
                <Bar dataKey="value" name="Count" fill="#dc2626" radius={[0,6,6,0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Export */}
      <div className="card bg-gray-50 border border-gray-100 flex items-center justify-between p-4">
        <div>
          <div className="font-semibold text-gray-900">Export Reports</div>
          <div className="text-sm text-gray-500 mt-0.5">Download platform data as CSV or PDF</div>
        </div>
        <div className="flex gap-2">
          <button className="btn-white text-sm">Export CSV</button>
          <button className="btn-white text-sm">Export PDF</button>
        </div>
      </div>
    </div>
  )
}
