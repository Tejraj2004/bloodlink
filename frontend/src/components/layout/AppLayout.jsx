import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Droplets, LayoutDashboard, Heart, Building2, Package, ClipboardList,
  Truck, BarChart3, Users, Calendar, Bell, Settings, LogOut, Menu, X,
  FlaskConical, Activity, Zap, ShieldCheck, ChevronDown, MapPin
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const roleMenus = {
  admin: [
    { path: '/dashboard',   icon: LayoutDashboard, label: 'Overview' },
    { path: '/inventory',   icon: Package,          label: 'Inventory' },
    { path: '/requests',    icon: ClipboardList,    label: 'All Requests' },
    { path: '/donors',      icon: Users,            label: 'Donors' },
    { path: '/hospitals',   icon: Building2,        label: 'Hospitals' },
    { path: '/bloodbanks',  icon: Droplets,         label: 'Blood Banks' },
    { path: '/deliveries',  icon: Truck,            label: 'Deliveries' },
    { path: '/camps',       icon: Calendar,         label: 'Campaigns' },
    { path: '/analytics',   icon: BarChart3,        label: 'Analytics' },
  ],
  bloodbank: [
    { path: '/dashboard',   icon: LayoutDashboard,  label: 'Dashboard' },
    { path: '/inventory',   icon: Package,          label: 'Inventory' },
    { path: '/units',       icon: Droplets,         label: 'Blood Units' },
    { path: '/testing',     icon: FlaskConical,     label: 'TTI Testing' },
    { path: '/requests',    icon: ClipboardList,    label: 'Requests' },
    { path: '/donors',      icon: Users,            label: 'Donors' },
    { path: '/appointments',icon: Calendar,         label: 'Appointments' },
    { path: '/deliveries',  icon: Truck,            label: 'Deliveries' },
    { path: '/camps',       icon: MapPin,           label: 'Camps' },
  ],
  hospital: [
    { path: '/dashboard',   icon: LayoutDashboard,  label: 'Dashboard' },
    { path: '/requests',    icon: ClipboardList,    label: 'Blood Requests' },
    { path: '/inventory',   icon: Package,          label: 'Find Blood' },
    { path: '/deliveries',  icon: Truck,            label: 'Deliveries' },
    { path: '/camps',       icon: Calendar,         label: 'Nearby Camps' },
  ],
  donor: [
    { path: '/dashboard',   icon: LayoutDashboard,  label: 'My Dashboard' },
    { path: '/appointments',icon: Calendar,         label: 'Appointments' },
    { path: '/history',     icon: Heart,            label: 'Donation History' },
    { path: '/camps',       icon: MapPin,           label: 'Nearby Camps' },
    { path: '/achievements',icon: ShieldCheck,      label: 'Achievements' },
  ],
  patient: [
    { path: '/dashboard',   icon: LayoutDashboard,  label: 'My Requests' },
    { path: '/requests/new',icon: ClipboardList,    label: 'New Request' },
    { path: '/inventory',   icon: Package,          label: 'Find Blood' },
    { path: '/deliveries',  icon: Truck,            label: 'Track Delivery' },
  ],
  ambulance: [
    { path: '/dashboard',   icon: LayoutDashboard,  label: 'Assignments' },
    { path: '/deliveries',  icon: Truck,            label: 'Active Delivery' },
    { path: '/history',     icon: ClipboardList,    label: 'History' },
  ],
}

const roleColors = {
  admin: 'bg-purple-100 text-purple-700',
  bloodbank: 'bg-red-100 text-red-700',
  hospital: 'bg-blue-100 text-blue-700',
  donor: 'bg-green-100 text-green-700',
  patient: 'bg-amber-100 text-amber-700',
  ambulance: 'bg-orange-100 text-orange-700',
}

export default function AppLayout({ children }) {
  const { user, logout, unreadCount } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menu = roleMenus[user?.role] || []
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm shadow-primary-200">
            <Droplets size={20} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-lg leading-tight">BloodLink</div>
            <div className="text-xs text-gray-400">Emergency Network</div>
          </div>
        </Link>
      </div>

      {/* User chip */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover"/>
              : user?.name?.[0]?.toUpperCase()
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-800 truncate">{user?.name}</div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColors[user?.role]}`}>
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menu.map(item => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <Link key={item.path} to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`nav-link ${active ? 'active' : ''}`}>
              <Icon size={18} className={active ? 'text-primary-600' : 'text-gray-400'} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3 space-y-1">
        <Link to="/notifications" className="nav-link" onClick={() => setSidebarOpen(false)}>
          <Bell size={18} className="text-gray-400"/>
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="ml-auto bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        <Link to="/settings" className="nav-link" onClick={() => setSidebarOpen(false)}>
          <Settings size={18} className="text-gray-400"/><span>Settings</span>
        </Link>
        <button onClick={handleLogout} className="nav-link w-full text-red-500 hover:text-red-600 hover:bg-red-50">
          <LogOut size={18}/><span>Sign out</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 hidden lg:flex flex-col flex-shrink-0 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)}/>
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
              <Menu size={20} className="text-gray-600"/>
            </button>
            <h1 className="font-semibold text-gray-900 text-base capitalize">
              {menu.find(m => isActive(m.path))?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Emergency */}
            <Link to="/requests/new"
              className="hidden sm:flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm shadow-primary-200">
              <Zap size={14}/> Emergency
            </Link>
            {/* Notifications */}
            <Link to="/notifications" className="relative p-2 rounded-xl hover:bg-gray-100 transition-all">
              <Bell size={19} className="text-gray-500"/>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
