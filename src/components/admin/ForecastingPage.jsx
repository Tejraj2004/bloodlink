import React from 'react'
import { Activity, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts'
import { demandForecast, inventory } from '../../data/mockData'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm">
      <p className="text-slate-400 mb-1 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value ?? 'N/A'}</p>
      ))}
    </div>
  )
}

const componentForecast = [
  { group: 'O+', rbc: 85, plasma: 60, platelets: 40, demand: 'High' },
  { group: 'A+', rbc: 70, plasma: 45, platelets: 35, demand: 'Medium' },
  { group: 'B+', rbc: 55, plasma: 38, platelets: 28, demand: 'Medium' },
  { group: 'AB-', rbc: 12, plasma: 8, platelets: 6, demand: 'Critical' },
  { group: 'O-', rbc: 18, plasma: 10, platelets: 8, demand: 'High' },
]

const seasonalRisk = [
  { factor: 'Dengue Season (Jul–Sep)', impact: 'High Platelet Demand', severity: 'critical' },
  { factor: 'Festival Period (Oct–Nov)', impact: 'Low Donation Rate', severity: 'warning' },
  { factor: 'Monsoon Accidents', impact: 'Surge in O+ RBC Demand', severity: 'warning' },
  { factor: 'Post-monsoon Recovery', impact: 'Stable Inventory Needed', severity: 'info' },
]

export default function ForecastingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">AI Demand Forecasting</h1>
        <p className="text-slate-500 text-sm mt-0.5">Predictive analytics powered by historical data and seasonal trends</p>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { title: 'Shortage Risk — July', detail: 'O- and AB- projected below safe threshold by July 15', severity: 'critical' },
          { title: 'Dengue Alert', detail: 'Platelet demand expected to surge 40% in Q3', severity: 'warning' },
          { title: 'Camp Recommendation', detail: 'Schedule 3 more camps in Bhubaneswar before Jul 10', severity: 'info' },
        ].map((ins, i) => {
          const colors = {
            critical: 'bg-blood-900/30 border-blood-700 text-blood-300',
            warning: 'bg-amber-900/30 border-amber-700 text-amber-300',
            info: 'bg-blue-900/30 border-blue-700 text-blue-300',
          }
          return (
            <div key={i} className={`rounded-2xl border p-4 ${colors[ins.severity]}`}>
              <div className="flex items-start gap-2 mb-1">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5"/>
                <div className="font-semibold text-sm">{ins.title}</div>
              </div>
              <p className="text-xs opacity-80 pl-6">{ins.detail}</p>
            </div>
          )
        })}
      </div>

      {/* Main Forecast Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="section-title">6-Month Demand vs Supply</div>
            <p className="text-slate-500 text-sm mt-0.5">Actual vs AI-predicted demand (dashed = forecast)</p>
          </div>
          <span className="badge-blue">XGBoost Model · 91% accuracy</span>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={demandForecast}>
            <defs>
              <linearGradient id="gActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e51d1d" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#e51d1d" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="month" stroke="#475569" tick={{ fill:'#64748b', fontSize:12 }} axisLine={false} tickLine={false}/>
            <YAxis stroke="#475569" tick={{ fill:'#64748b', fontSize:12 }} axisLine={false} tickLine={false}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12, color: '#94a3b8' }}/>
            <ReferenceLine x="Jun" stroke="#475569" strokeDasharray="4 4" label={{ value:'Today', fill:'#64748b', fontSize:11 }}/>
            <Area type="monotone" dataKey="actual" name="Actual Demand" stroke="#e51d1d" strokeWidth={2.5} fill="url(#gActual)" connectNulls={false}/>
            <Area type="monotone" dataKey="forecast" name="AI Forecast" stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 3" fill="url(#gForecast)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Component Forecast */}
        <div className="card">
          <div className="section-title mb-1">Component Demand Forecast</div>
          <p className="text-slate-500 text-sm mb-4">Projected units needed in next 30 days</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={componentForecast} barGap={2}>
              <XAxis dataKey="group" stroke="#475569" tick={{ fill:'#64748b', fontSize:12 }} axisLine={false} tickLine={false}/>
              <YAxis stroke="#475569" tick={{ fill:'#64748b', fontSize:12 }} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="rbc" name="RBC" fill="#e51d1d" radius={[4,4,0,0]}/>
              <Bar dataKey="plasma" name="Plasma" fill="#f59e0b" radius={[4,4,0,0]}/>
              <Bar dataKey="platelets" name="Platelets" fill="#3b82f6" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Seasonal Risk Factors */}
        <div className="card">
          <div className="section-title mb-4">Seasonal Risk Factors</div>
          <div className="space-y-3">
            {seasonalRisk.map((r, i) => {
              const dot = r.severity === 'critical' ? 'bg-blood-500' : r.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
              const text = r.severity === 'critical' ? 'text-blood-400' : r.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'
              return (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-800 rounded-xl">
                  <div className={`w-2 h-2 rounded-full ${dot} mt-1.5 flex-shrink-0`}/>
                  <div>
                    <div className={`text-sm font-semibold ${text}`}>{r.factor}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{r.impact}</div>
                  </div>
                </div>
              )
            })}
          </div>
          <button className="w-full mt-4 btn-secondary text-sm">Download Full Report</button>
        </div>
      </div>
    </div>
  )
}
