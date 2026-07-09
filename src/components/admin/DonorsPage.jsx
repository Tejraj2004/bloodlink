import React, { useState } from 'react'
import { Search, Filter, Heart, MapPin, Star, Phone, CheckCircle, XCircle, Zap } from 'lucide-react'
import { donors } from '../../data/mockData'

const scoreColor = (s) => s >= 95 ? 'text-emerald-400' : s >= 85 ? 'text-blue-400' : 'text-amber-400'
const rarityLabel = { 'O-': 'Universal Donor', 'AB-': 'Rare', 'B-': 'Rare', 'A-': 'Uncommon' }

export default function DonorsPage() {
  const [search, setSearch] = useState('')
  const [filterGroup, setFilterGroup] = useState('All')
  const [showActivateModal, setShowActivateModal] = useState(false)

  const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  const filtered = donors.filter(d =>
    (filterGroup === 'All' || d.bloodGroup === filterGroup) &&
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.bloodGroup.includes(search))
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Donor Registry</h1>
          <p className="text-slate-500 text-sm mt-0.5">AI-ranked donor intelligence system</p>
        </div>
        <button onClick={() => setShowActivateModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Zap size={15}/> Activate Donors
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Registered', value: '1,847', color: 'text-white' },
          { label: 'Eligible Now', value: '1,203', color: 'text-emerald-400' },
          { label: 'Active This Month', value: '387', color: 'text-blue-400' },
          { label: 'Rare Blood Donors', value: '94', color: 'text-blood-400' },
        ].map((s, i) => (
          <div key={i} className="card text-center">
            <div className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-slate-500 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or blood group..."
            className="input pl-9 text-sm" />
        </div>
        <div className="flex bg-slate-800 rounded-xl p-1 gap-1 flex-wrap">
          {bloodGroups.map(g => (
            <button key={g} onClick={() => setFilterGroup(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterGroup === g ? 'bg-blood-600 text-white' : 'text-slate-400 hover:text-white'
              }`}>{g}</button>
          ))}
        </div>
      </div>

      {/* Donor Cards */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map(donor => (
          <div key={donor.id} className="card-hover flex gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blood-800 to-blood-600 flex items-center justify-center flex-shrink-0 font-display font-bold text-white text-lg">
              {donor.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-white">{donor.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="badge-red text-xs">{donor.bloodGroup}</span>
                    {rarityLabel[donor.bloodGroup] && (
                      <span className="badge bg-purple-900/50 text-purple-400 border border-purple-800 text-xs">
                        {rarityLabel[donor.bloodGroup]}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`font-display font-bold text-xl ${scoreColor(donor.score)}`}>{donor.score}</div>
                  <div className="text-xs text-slate-600">AI Score</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1 text-slate-400">
                  <Heart size={11} className="text-blood-400"/> {donor.donations} donations
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <MapPin size={11} className="text-blue-400"/> {donor.city}
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Phone size={11} className="text-slate-500"/> {donor.phone.slice(0,5)}xxxxx
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {donor.eligible
                    ? <><CheckCircle size={13} className="text-emerald-400"/><span className="text-emerald-400 text-xs font-medium">Eligible</span></>
                    : <><XCircle size={13} className="text-slate-500"/><span className="text-slate-500 text-xs">Not eligible yet</span></>
                  }
                </div>
                <div className="text-xs text-slate-600">Last: {donor.lastDonation}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activate Modal */}
      {showActivateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="font-display font-bold text-xl text-white mb-2">Activate Donor Alert</h2>
            <p className="text-slate-400 text-sm mb-4">Send emergency notifications to eligible donors ranked by AI score.</p>
            <div className="space-y-3 mb-5">
              {['SMS', 'Email', 'WhatsApp', 'Push Notification'].map(ch => (
                <label key={ch} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-blood-500 w-4 h-4"/>
                  <span className="text-slate-300 text-sm">{ch}</span>
                </label>
              ))}
            </div>
            <div className="bg-slate-800 rounded-xl p-3 mb-5 text-sm text-slate-400">
              <strong className="text-white">8 eligible donors</strong> will be notified — prioritizing O- and AB- groups.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowActivateModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={() => setShowActivateModal(false)} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
                <Zap size={14}/> Send Alerts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
