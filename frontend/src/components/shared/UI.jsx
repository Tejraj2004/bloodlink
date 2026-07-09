import React from 'react'
import { Loader2, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

// ─── Spinner ─────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 16, md: 24, lg: 40 }
  return <Loader2 size={sizes[size]} className={`animate-spin text-primary-600 ${className}`} />
}

export const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <Spinner size="lg" className="mx-auto mb-3" />
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  </div>
)

// ─── Empty State ─────────────────────────────────────────────────────────────
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {icon && <div className="text-5xl mb-4">{icon}</div>}
    <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
    {description && <p className="text-gray-500 text-sm mb-5 max-w-sm">{description}</p>}
    {action}
  </div>
)

// ─── Alert ────────────────────────────────────────────────────────────────────
const alertStyles = {
  error:   { bg: 'bg-red-50 border-red-200 text-red-700',   Icon: AlertCircle },
  success: { bg: 'bg-green-50 border-green-200 text-green-700', Icon: CheckCircle },
  info:    { bg: 'bg-blue-50 border-blue-200 text-blue-700',    Icon: Info },
  warning: { bg: 'bg-amber-50 border-amber-200 text-amber-700', Icon: AlertTriangle },
}
export const Alert = ({ type = 'info', message, className = '' }) => {
  const { bg, Icon } = alertStyles[type]
  return (
    <div className={`flex items-start gap-3 border rounded-xl p-3.5 text-sm ${bg} ${className}`}>
      <Icon size={17} className="flex-shrink-0 mt-0.5" />
      <span className="leading-relaxed">{message}</span>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null
  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${widths[size]} animate-fade-in`} onClick={e => e.stopPropagation()}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">✕</button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export const StatCard = ({ icon, label, value, sub, color = 'red', trend }) => {
  const colors = {
    red:    'bg-red-50 text-red-600',
    green:  'bg-green-50 text-green-600',
    blue:   'bg-blue-50 text-blue-600',
    amber:  'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    gray:   'bg-gray-100 text-gray-600',
  }
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm font-medium text-gray-700 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

// ─── Blood Group Badge ────────────────────────────────────────────────────────
export const BloodGroupBadge = ({ group, size = 'md' }) => {
  const rare = ['O-','AB-','B-','A-'].includes(group)
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' }
  return (
    <div className={`${sizes[size]} rounded-xl bg-primary-50 border-2 ${rare ? 'border-primary-400' : 'border-primary-200'} flex items-center justify-center font-bold text-primary-700 flex-shrink-0`}>
      {group}
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const statusMap = {
  'Pending':    'badge-yellow',
  'Processing': 'badge-blue',
  'Allocated':  'badge-blue',
  'In Transit': 'badge-blue',
  'Fulfilled':  'badge-green',
  'Cancelled':  'badge-gray',
  'Critical':   'badge-red',
  'Urgent':     'badge-yellow',
  'Normal':     'badge-green',
  'Approved':   'badge-green',
  'Rejected':   'badge-red',
  'Delivered':  'badge-green',
  'Assigned':   'badge-yellow',
  'Eligible':   'badge-green',
  'Verified':   'badge-green',
}
export const StatusBadge = ({ status }) => (
  <span className={statusMap[status] || 'badge-gray'}>{status}</span>
)

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export const ProgressBar = ({ value, max, color = 'red', showLabel = false }) => {
  const pct = Math.min((value / max) * 100, 100)
  const colors = { red: 'bg-primary-600', green: 'bg-green-500', blue: 'bg-blue-500', amber: 'bg-amber-500' }
  return (
    <div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${colors[color]}`} style={{ width: `${pct}%` }}/>
      </div>
      {showLabel && <div className="text-xs text-gray-500 mt-1">{value}/{max} ({Math.round(pct)}%)</div>}
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────
export const SectionHeader = ({ title, action }) => (
  <div className="section-header">
    <h2 className="section-title">{title}</h2>
    {action}
  </div>
)

// ─── Table ────────────────────────────────────────────────────────────────────
export const Table = ({ headers, children, empty }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-100">
          {headers.map((h, i) => <th key={i} className="table-header">{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {children}
      </tbody>
    </table>
    {empty && <div className="py-12 text-center text-gray-400 text-sm">{empty}</div>}
  </div>
)
