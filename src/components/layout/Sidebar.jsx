import React from 'react'
import {
  LayoutDashboard, Heart, Building2, Droplets, Truck as Ambulance, ShieldCheck,
  Users, Package, ClipboardList, MapPin, Bell, BarChart3, Settings,
  Activity, Truck, Calendar, FlaskConical, ChevronRight
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

const roleMenus = {
  admin: [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
    { id: 'inventory', icon: Package, label: 'National Inventory' },
    { id: 'requests', icon: ClipboardList, label: 'All Requests' },
    { id: 'donors', icon: Users, label: 'Donors' },
    { id: 'hospitals', icon: Building2, label: 'Hospitals' },
    { id: 'bloodbanks', icon: Droplets, label: 'Blood Banks' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'forecasting', icon: Activity, label: 'AI Forecasting' },
    { id: 'campaigns', icon: Calendar, label: 'Campaigns' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ],
  bloodbank: [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'inventory', icon: Package, label: 'Inventory' },
    { id: 'donations', icon: Heart, label: 'Donations' },
    { id: 'testing', icon: FlaskConical, label: 'TTI Testing' },
    { id: 'requests', icon: ClipboardList, label: 'Requests' },
    { id: 'donors', icon: Users, label: 'Donors' },
    { id: 'camps', icon: Calendar, label: 'Camps' },
    { id: 'deliveries', icon: Truck, label: 'Deliveries' },
    { id: 'reports', icon: BarChart3, label: 'Reports' },
  ],
  hospital: [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'requests', icon: ClipboardList, label: 'Blood Requests' },
    { id: 'inventory', icon: Package, label: 'Find Blood' },
    { id: 'deliveries', icon: Truck, label: 'Deliveries' },
    { id: 'emergency', icon: Activity, label: 'Emergency' },
    { id: 'hospitals', icon: Building2, label: 'Collaborate' },
  ],
  donor: [
    { id: 'dashboard', icon: LayoutDashboard, label: 'My Dashboard' },
    { id: 'appointments', icon: Calendar, label: 'Appointments' },
    { id: 'history', icon: Heart, label: 'Donation History' },
    { id: 'camps', icon: MapPin, label: 'Nearby Camps' },
    { id: 'badges', icon: ShieldCheck, label: 'Badges & Impact' },
  ],
  patient: [
    { id: 'dashboard', icon: LayoutDashboard, label: 'My Requests' },
    { id: 'newrequest', icon: ClipboardList, label: 'New Request' },
    { id: 'inventory', icon: Package, label: 'Find Blood' },
    { id: 'tracking', icon: Truck, label: 'Track Delivery' },
  ],
  ambulance: [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Assignments' },
    { id: 'active', icon: Truck, label: 'Active Delivery' },
    { id: 'history', icon: ClipboardList, label: 'History' },
  ],
}

const roleColors = {
  admin: 'text-purple-400',
  bloodbank: 'text-blood-400',
  hospital: 'text-blue-400',
  donor: 'text-emerald-400',
  patient: 'text-amber-400',
  ambulance: 'text-orange-400',
}

const roleIcons = {
  admin: ShieldCheck,
  bloodbank: Droplets,
  hospital: Building2,
  donor: Heart,
  patient: Users,
  ambulance: Ambulance,
}

export default function Sidebar() {
  const { activeRole, activePage, setActivePage, notifications } = useApp()
  const menu = roleMenus[activeRole] || roleMenus.admin
  const unread = notifications.filter(n => !n.read).length
  const RoleIcon = roleIcons[activeRole]

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full fixed left-0 top-0 bottom-0 z-20">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blood-600 rounded-xl flex items-center justify-center shadow-lg shadow-blood-900/50">
            <Droplets size={20} className="text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-lg leading-tight">BloodLink</div>
            <div className="text-xs text-slate-500">Emergency Network</div>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-2">
          <RoleIcon size={15} className={roleColors[activeRole]} />
          <span className={`text-xs font-semibold ${roleColors[activeRole]}`}>
            {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)} Portal
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {menu.map(item => {
          const Icon = item.icon
          const isActive = activePage === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`nav-link w-full text-left ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} className={isActive ? 'text-blood-400' : ''} />
              <span className="text-sm">{item.label}</span>
              {item.id === 'emergency' && (
                <span className="ml-auto w-2 h-2 bg-blood-500 rounded-full pulse-dot" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-1">
        <button
          onClick={() => setActivePage('notifications')}
          className="nav-link w-full text-left"
        >
          <Bell size={18} />
          <span className="text-sm">Notifications</span>
          {unread > 0 && (
            <span className="ml-auto bg-blood-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
      </div>
    </aside>
  )
}
