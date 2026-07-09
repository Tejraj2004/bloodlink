import React from 'react'
import { Heart, Award, Calendar, MapPin, Clock, CheckCircle, Droplets, Star, Bell } from 'lucide-react'
import { camps } from '../../data/mockData'

const badges = [
  { name: 'First Drop', icon: '🩸', earned: true, desc: 'First donation' },
  { name: 'Life Saver', icon: '❤️', earned: true, desc: '5 donations' },
  { name: 'Iron Will', icon: '🏆', earned: true, desc: '10 donations' },
  { name: 'Rare Hero', icon: '⭐', earned: false, desc: 'Rare blood group' },
  { name: 'Champion', icon: '🥇', earned: false, desc: '15 donations' },
  { name: 'Legend', icon: '👑', earned: false, desc: '25 donations' },
]

export default function DonorDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blood-900/60 to-slate-900 border border-blood-800/50 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <div className="text-slate-400 text-sm mb-1">Welcome back,</div>
          <h1 className="font-display text-2xl font-bold text-white">Arjun Sharma</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="badge-red">O+</span>
            <span className="text-slate-400 text-sm flex items-center gap-1"><Heart size={13} className="text-blood-400"/> 8 donations · 24 lives impacted</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-slate-500 text-xs mb-1">Next eligible</div>
          <div className="font-display text-3xl font-bold text-emerald-400">Jun 28</div>
          <div className="flex items-center gap-1.5 mt-1 justify-end">
            <CheckCircle size={14} className="text-emerald-400"/>
            <span className="text-emerald-400 text-sm font-medium">Eligible to donate</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Donations', value: 8, icon: Heart, color: 'blood' },
          { label: 'Lives Impacted', value: 24, icon: Star, color: 'amber' },
          { label: 'Donor Score', value: 94, icon: Award, color: 'purple' },
          { label: 'Next Camp', value: '3d', icon: Calendar, color: 'blue' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="card text-center">
              <div className={`w-10 h-10 rounded-xl bg-${s.color}-900/30 border border-${s.color}-800/50 flex items-center justify-center mx-auto mb-3`}>
                <Icon size={18} className={`text-${s.color}-400`}/>
              </div>
              <div className="font-display text-3xl font-bold text-white">{s.value}</div>
              <div className="text-slate-500 text-xs mt-1">{s.label}</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Donation History */}
        <div className="card col-span-2">
          <div className="section-title mb-4">Donation History</div>
          <div className="space-y-3">
            {[
              { date: '12 Mar 2025', center: 'State Blood Bank', component: 'Whole Blood', units: 1, cert: true },
              { date: '08 Nov 2024', center: 'Red Cross Cuttack', component: 'RBC', units: 1, cert: true },
              { date: '22 Jul 2024', center: 'State Blood Bank', component: 'Whole Blood', units: 1, cert: true },
              { date: '15 Apr 2024', center: 'Tata Blood Centre', component: 'Whole Blood', units: 1, cert: false },
            ].map((d, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-slate-800/60 rounded-xl">
                <div className="w-10 h-10 bg-blood-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Droplets size={18} className="text-blood-400"/>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{d.center}</div>
                  <div className="text-xs text-slate-500">{d.component} · {d.units} unit</div>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1"><Clock size={11}/>{d.date}</div>
                {d.cert && <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">Certificate</button>}
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="card">
          <div className="section-title mb-4">Achievements</div>
          <div className="grid grid-cols-3 gap-2">
            {badges.map((b, i) => (
              <div key={i} className={`rounded-xl p-2.5 text-center border transition-all ${b.earned ? 'bg-amber-900/20 border-amber-800/50' : 'bg-slate-800 border-slate-700 opacity-40'}`}>
                <div className="text-2xl mb-1">{b.icon}</div>
                <div className={`text-xs font-semibold ${b.earned ? 'text-amber-300' : 'text-slate-500'}`}>{b.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nearby Camps */}
      <div className="card">
        <div className="section-title mb-4">Nearby Donation Camps</div>
        <div className="grid grid-cols-3 gap-4">
          {camps.map(camp => {
            const pct = Math.round((camp.registered / camp.target) * 100)
            return (
              <div key={camp.id} className="bg-slate-800 rounded-xl p-4">
                <div className="font-semibold text-white text-sm mb-1">{camp.name}</div>
                <div className="flex items-center gap-1 text-slate-500 text-xs mb-1"><MapPin size={11}/>{camp.venue.split(',')[0]}</div>
                <div className="flex items-center gap-1 text-slate-500 text-xs mb-3"><Calendar size={11}/>{camp.date}</div>
                <div className="h-1.5 bg-slate-700 rounded-full mb-2 overflow-hidden">
                  <div className="h-full bg-blood-600 rounded-full" style={{ width: `${pct}%` }}/>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{camp.registered}/{camp.target} slots</span>
                  <button className="text-blood-400 font-semibold hover:text-blood-300">Register</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
