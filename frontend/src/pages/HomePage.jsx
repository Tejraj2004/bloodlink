import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Droplets, Heart, Zap, Shield, MapPin, Bell, BarChart3, Users,
  Building2, Truck, ArrowRight, CheckCircle, Star, ChevronDown,
  Activity, Clock, Globe, Phone, Mail, Menu, X, FlaskConical,
  Calendar, AlertTriangle, Package, TrendingUp, Radio,
  ChevronRight, ExternalLink, UserCheck, Wifi
} from 'lucide-react'
import { useHomeSocket } from '../hooks/useHomeSocket'

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [val, setVal] = useState(0)
  const started = useRef(false)
  const ref = useRef()

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const steps = 60, step = duration / steps
        let i = 0
        const t = setInterval(() => {
          i++
          setVal(Math.round(target * (i / steps)))
          if (i >= steps) clearInterval(t)
        }, step)
      }
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

// ─── Pulse dot ────────────────────────────────────────────────────────────────
function PulseDot({ color = 'bg-green-500' }) {
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}/>
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`}/>
    </span>
  )
}

// ─── Google Map Embed ─────────────────────────────────────────────────────────
function GoogleMapEmbed() {
  const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const markers = [
    { lat: 20.2961, lng: 85.8245, label: 'State Blood Bank' },
    { lat: 20.3061, lng: 85.8396, label: 'AIIMS' },
    { lat: 20.4686, lng: 85.8792, label: 'SCB Medical' },
  ]

  if (MAPS_KEY && MAPS_KEY !== 'your_google_maps_api_key') {
    return (
      <iframe
        title="BloodLink Network Map"
        width="100%" height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=Bhubaneswar,Odisha&zoom=12`}
        className="w-full h-full rounded-2xl"
      />
    )
  }

  // Fallback: styled static map
  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl relative overflow-hidden flex items-center justify-center border border-blue-100">
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3b82f6" strokeWidth="0.5"/>
        </pattern></defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>
      {/* Decorative roads */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="55%" x2="100%" y2="48%" stroke="#d1d5db" strokeWidth="4"/>
        <line x1="30%" y1="0" x2="35%" y2="100%" stroke="#d1d5db" strokeWidth="3"/>
        <line x1="65%" y1="0" x2="60%" y2="100%" stroke="#d1d5db" strokeWidth="2.5"/>
        <line x1="0" y1="30%" x2="100%" y2="72%" stroke="#e5e7eb" strokeWidth="2"/>
        <circle cx="32%" cy="42%" r="40" fill="#dbeafe" opacity="0.5"/>
        <circle cx="62%" cy="60%" r="30" fill="#dcfce7" opacity="0.5"/>
      </svg>
      {/* Markers */}
      {[
        { x:'32%', y:'38%', label:'State Blood Bank', color:'bg-red-500',   pulse:'bg-red-400',   icon:'🩸' },
        { x:'62%', y:'55%', label:'AIIMS Bhubaneswar',color:'bg-blue-500',  pulse:'bg-blue-400',  icon:'🏥' },
        { x:'48%', y:'65%', label:'Red Cross Centre', color:'bg-green-500', pulse:'bg-green-400', icon:'🏨' },
        { x:'20%', y:'58%', label:'Apollo Hospital',  color:'bg-purple-500',pulse:'bg-purple-400',icon:'💉' },
        { x:'75%', y:'30%', label:'Tata Blood Centre',color:'bg-orange-500',pulse:'bg-orange-400',icon:'🔬' },
      ].map((m, i) => (
        <div key={i} className="absolute flex flex-col items-center" style={{ left: m.x, top: m.y, transform:'translate(-50%,-100%)' }}>
          <div className={`relative w-9 h-9 ${m.color} rounded-full flex items-center justify-center shadow-lg text-base cursor-pointer hover:scale-110 transition-transform`}>
            <span className={`animate-ping absolute w-full h-full rounded-full ${m.pulse} opacity-40`}/>
            {m.icon}
          </div>
          <div className="mt-1 bg-white text-xs font-semibold text-gray-700 px-2 py-0.5 rounded-full shadow border border-gray-100 whitespace-nowrap">{m.label}</div>
        </div>
      ))}
      {/* Delivery route */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 32% 38% Q 48% 20% 62% 55%" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 4" opacity="0.6"/>
      </svg>
      {/* Active delivery badge */}
      <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-lg px-3 py-2 border border-green-100 text-xs flex items-center gap-2">
        <PulseDot color="bg-green-500"/>
        <span className="font-semibold text-green-700">3 Deliveries Active</span>
      </div>
      <div className="absolute top-4 left-4 bg-white rounded-xl shadow-lg px-3 py-2 border border-blue-100 text-xs flex items-center gap-2">
        <MapPin size={13} className="text-blue-500"/>
        <span className="font-semibold text-gray-700">Bhubaneswar, Odisha</span>
      </div>
    </div>
  )
}

// ─── Feature Card ──────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, color, bgColor, title, desc, link, badge, onClick }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => { if (onClick) onClick(); else if (link) navigate(link) }}
      className="group bg-white rounded-2xl border border-gray-100 p-6 cursor-pointer hover:shadow-xl hover:shadow-red-50 hover:border-red-200 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon size={22} className={color}/>
        </div>
        {badge && <span className="text-xs font-bold bg-red-100 text-red-600 px-2.5 py-1 rounded-full">{badge}</span>}
      </div>
      <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-red-600 transition-colors">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed mb-4">{desc}</p>
      <div className="flex items-center gap-1 text-red-500 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
        Explore <ChevronRight size={15}/>
      </div>
    </div>
  )
}

// ─── Live Event Feed ──────────────────────────────────────────────────────────
const eventConfig = {
  donation:  { icon:'❤️',  bg:'bg-red-50',    text:'text-red-600',    label:'Donation'   },
  emergency: { icon:'⚡',  bg:'bg-amber-50',  text:'text-amber-600',  label:'Emergency'  },
  delivery:  { icon:'🚚',  bg:'bg-blue-50',   text:'text-blue-600',   label:'Delivery'   },
  camp:      { icon:'📍',  bg:'bg-purple-50', text:'text-purple-600', label:'Camp'       },
  verified:  { icon:'✅',  bg:'bg-green-50',  text:'text-green-600',  label:'Verified'   },
  request:   { icon:'🩸',  bg:'bg-rose-50',   text:'text-rose-600',   label:'Request'    },
}

function LiveFeed({ events }) {
  return (
    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
      {events.map((ev, i) => {
        const cfg = eventConfig[ev.type] || eventConfig.donation
        return (
          <div key={ev.id || i} className={`flex items-start gap-3 p-3 rounded-xl ${cfg.bg} border border-white`} style={{ animation: i === 0 ? 'fadeSlideIn .4s ease' : 'none' }}>
            <span className="text-lg flex-shrink-0">{cfg.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 font-medium leading-snug">{ev.msg}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10}/>{ev.time}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── MAIN HOMEPAGE ────────────────────────────────────────────────────────────
export default function HomePage() {
  const [menuOpen, setMenuOpen]   = useState(false)
  const [scrolled, setScrolled]   = useState(false)
  const { liveStats, liveEvents, onlineRoles } = useHomeSocket()
  const navigate = useNavigate()

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false) }

  const NAV = [
    { label: 'Features',    id: 'features'    },
    { label: 'How It Works',id: 'how-it-works'},
    { label: 'For You',     id: 'roles'       },
    { label: 'Live Map',    id: 'map'         },
    { label: 'Stats',       id: 'stats'       },
  ]

  const FEATURES = [
    { icon: Zap,          bgColor:'bg-red-50',    color:'text-red-600',    title:'Emergency Response',     badge:'LIVE', desc:'Critical requests activate donors instantly. AI ranks eligible donors by distance, blood group rarity, and response history — alerts sent via SMS, Email & Push.', link:'/requests/new' },
    { icon: Activity,     bgColor:'bg-blue-50',   color:'text-blue-600',   title:'Real-Time Inventory',    badge:null,   desc:'Live inventory across all blood banks powered by Socket.IO. Automatic shortage alerts and cross-bank stock sharing to prevent critical gaps.', link:'/inventory' },
    { icon: MapPin,       bgColor:'bg-green-50',  color:'text-green-600',  title:'GPS Delivery Tracking',  badge:null,   desc:'Ambulance drivers share live GPS location. Hospitals and patients track blood delivery in real time with estimated arrival times.', link:'/deliveries' },
    { icon: FlaskConical, bgColor:'bg-purple-50', color:'text-purple-600', title:'TTI Screening & Tracing', badge:null,  desc:'Full traceability: every unit tested for HIV, Hepatitis B/C, Malaria, Syphilis before approval. Component separation into RBC, Plasma, Platelets.', link:'/register' },
    { icon: Calendar,     bgColor:'bg-amber-50',  color:'text-amber-600',  title:'Donation Camps',         badge:null,   desc:'Blood banks publish camps. Donors discover, register, and attend. Real-time seat count, reminders, and eligibility checks — all synced instantly.', link:'/camps' },
    { icon: BarChart3,    bgColor:'bg-rose-50',   color:'text-rose-600',   title:'AI Demand Forecasting',  badge:'AI',   desc:'XGBoost models predict blood demand 30–60 days ahead using seasonal patterns, disease outbreaks, festivals, and historical usage data.', link:'/dashboard' },
    { icon: Bell,         bgColor:'bg-indigo-50', color:'text-indigo-600', title:'Smart Notifications',    badge:null,   desc:'Multi-channel alerts via Twilio SMS, Nodemailer email, Firebase FCM push, and WhatsApp keep donors, hospitals, and banks in sync 24/7.', link:'/notifications' },
    { icon: Shield,       bgColor:'bg-teal-50',   color:'text-teal-600',   title:'Secure Authentication',  badge:null,   desc:'JWT + Google OAuth + OTP verification. Role-based access for 6 portal types. Admin verification for hospitals and blood banks before activation.', link:'/login' },
    { icon: Users,        bgColor:'bg-orange-50', color:'text-orange-600', title:'Donor Intelligence',     badge:null,   desc:'Each donor gets an AI score based on rarity of blood group, donation frequency, response rate, and proximity — used to prioritize during emergencies.', link:'/register' },
  ]

  const ROLES = [
    { icon:'❤️', role:'Donor',      color:'border-green-200',  btn:'btn-green',   tag:'bg-green-50 text-green-700',   path:'/register', desc:'Register, book appointments, track donations, earn badges, and respond to emergency alerts.',        steps:['Sign up & verify OTP','Complete health profile','Get AI donor score','Respond to emergencies & earn badges'] },
    { icon:'🏥', role:'Patient',    color:'border-blue-200',   btn:'btn-blue',    tag:'bg-blue-50 text-blue-700',     path:'/register', desc:'Request blood for yourself or a loved one. Track in real time from allocation to delivery.',               steps:['Submit blood request','Specify urgency & component','Track allocation & delivery','Receive fulfilment notification'] },
    { icon:'🏨', role:'Hospital',   color:'border-violet-200', btn:'btn-violet',  tag:'bg-violet-50 text-violet-700', path:'/register', desc:'Manage blood requisitions, collaborate with blood banks, and track deliveries live.',                       steps:['Get admin verified','Post blood requests','Track live delivery GPS','Collaborate with nearby blood banks'] },
    { icon:'🩸', role:'Blood Bank', color:'border-red-200',    btn:'btn-red',     tag:'bg-red-50 text-red-700',       path:'/register', desc:'Record donations, run TTI screening, manage multi-component inventory, and dispatch to hospitals.',           steps:['Record donation & generate unit ID','Run 5-panel TTI screening','Separate into RBC / Plasma / Platelets','Allocate to hospital requests'] },
    { icon:'🚑', role:'Ambulance',  color:'border-orange-200', btn:'btn-orange',  tag:'bg-orange-50 text-orange-700', path:'/register', desc:'Accept delivery assignments, share live GPS location, and update delivery status in real time.',              steps:['Accept blood delivery assignment','Share live GPS location','Update status at each checkpoint','Confirm delivery at hospital'] },
    { icon:'⚙️', role:'Admin',      color:'border-gray-200',   btn:'btn-gray',    tag:'bg-gray-50 text-gray-700',     path:'/login',    desc:'Verify hospitals & blood banks, monitor national inventory, manage campaigns, and view analytics.',           steps:['Verify hospital & blood bank registrations','Monitor critical shortages','Activate donor campaigns','View analytics & AI forecasts'] },
  ]

  const WORKFLOW = [
    { n:'01', title:'Donor Registers',       icon: Users,        desc:'OTP verified sign-up → health profile → AI eligibility score assigned.' },
    { n:'02', title:'Blood Collected & Tested',icon: FlaskConical,desc:'Blood bank records unit → TTI screening (5 markers) → component separation.' },
    { n:'03', title:'Hospital Requests',     icon: Building2,    desc:'Hospital submits request with blood group, component, urgency → system alerts nearby banks.' },
    { n:'04', title:'AI Allocates',          icon: Activity,     desc:'AI matches request to nearest bank with stock → delivery created → ambulance notified.' },
    { n:'05', title:'Live GPS Delivery',     icon: Truck,        desc:'Ambulance shares real-time location → hospital tracks ETA on map.' },
    { n:'06', title:'Transfusion & Update',  icon: Heart,        desc:'Delivery confirmed → inventory updated → donor notified of impact → lifecycle complete.' },
  ]

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <style>{`
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes floatY { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
        .float-anim { animation: floatY 4s ease-in-out infinite; }
        .gradient-text { background: linear-gradient(135deg, #dc2626, #9f1239); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-gradient { background: radial-gradient(ellipse 80% 60% at 60% 40%, rgba(254,226,226,.6) 0%, rgba(255,255,255,0) 70%); }
        ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-thumb { background:#fca5a5; border-radius:10px; }
      `}</style>

      {/* ══ NAVBAR ══════════════════════════════════════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur shadow-md border-b border-red-50' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-sm shadow-red-200">
              <Droplets size={20} className="text-white"/>
            </div>
            <div>
              <span className="font-black text-xl text-gray-900 tracking-tight">BloodLink</span>
              <div className="flex items-center gap-1 -mt-0.5">
                <PulseDot color="bg-green-400"/>
                <span className="text-xs text-green-600 font-medium">{liveStats.liveUsers.toLocaleString()} online</span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {NAV.map(n => (
              <button key={n.label} onClick={() => scrollTo(n.id)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                {n.label}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login"    className="text-sm font-semibold text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-all">Sign In</Link>
            <Link to="/register" className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-sm shadow-red-200 flex items-center gap-1.5 transition-all">
              Get Started <ArrowRight size={15}/>
            </Link>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            {menuOpen ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1 shadow-xl">
            {NAV.map(n => (
              <button key={n.label} onClick={() => scrollTo(n.id)} className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl">{n.label}</button>
            ))}
            <div className="pt-3 border-t border-gray-100 flex gap-3">
              <Link to="/login"    className="flex-1 text-center py-2.5 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700">Sign In</Link>
              <Link to="/register" className="flex-1 text-center py-2.5 bg-red-600 rounded-xl text-sm font-bold text-white">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden hero-gradient">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-24 right-0 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-40"/>
          <div className="absolute bottom-0 left-0  w-72 h-72 bg-pink-100 rounded-full blur-3xl opacity-30"/>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 text-xs font-bold px-4 py-2 rounded-full mb-6 border border-red-200">
                <PulseDot color="bg-red-500"/>
                India's Smartest Blood Management Ecosystem
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
                Every Second<br/><span className="gradient-text">Saves a Life.</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-lg">
                BloodLink connects donors, blood banks, hospitals, patients, and ambulances through AI-powered emergency response, real-time inventory sync, GPS delivery tracking, and multi-channel notifications — all live.
              </p>
              <div className="flex flex-wrap gap-4 mb-10">
                <Link to="/register" className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-red-200 text-base flex items-center gap-2 transition-all hover:-translate-y-0.5">
                  Donate Blood <Heart size={18}/>
                </Link>
                <Link to="/register" className="border-2 border-red-200 text-red-700 font-bold px-8 py-4 rounded-2xl text-base flex items-center gap-2 hover:bg-red-50 transition-all">
                  Request Blood <ArrowRight size={18}/>
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                {[{icon:Shield,l:'NBTC Compliant'},{icon:CheckCircle,l:'OTP Verified'},{icon:Wifi,l:'Real-Time Sync'},{icon:Globe,l:'Pan-India'}].map(({icon:I,l})=>(
                  <div key={l} className="flex items-center gap-1.5"><I size={15} className="text-red-400"/>{l}</div>
                ))}
              </div>
            </div>
            {/* Right — Live dashboard card */}
            <div className="relative float-anim">
              <div className="bg-white rounded-3xl shadow-2xl shadow-red-100 border border-red-50 p-6 max-w-md mx-auto">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <PulseDot color="bg-red-500"/>
                    <span className="text-sm font-bold text-gray-700">Live Dashboard</span>
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={11}/>Real-time</span>
                </div>
                {/* Live stats mini */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { label:'Active Deliveries', val: liveStats.activeDeliveries, icon:'🚚', color:'bg-blue-50 text-blue-700'   },
                    { label:'Critical Alerts',   val: liveStats.criticalAlerts,   icon:'⚡', color:'bg-red-50 text-red-700'     },
                    { label:'Active Camps',       val: liveStats.activeCamps,      icon:'📍', color:'bg-purple-50 text-purple-700'},
                    { label:'Fulfilled Today',    val: liveStats.fulfilledToday,   icon:'✅', color:'bg-green-50 text-green-700' },
                  ].map((s,i)=>(
                    <div key={i} className={`rounded-xl p-3 ${s.color} flex items-center gap-3`}>
                      <span className="text-2xl">{s.icon}</span>
                      <div>
                        <div className="text-lg font-black">{s.val}</div>
                        <div className="text-xs opacity-80 font-medium">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Recent event */}
                {liveEvents[0] && (
                  <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Radio size={10}/> Latest Event</div>
                    <div className="text-sm font-semibold text-gray-800">{liveEvents[0].msg}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{liveEvents[0].time}</div>
                  </div>
                )}
                {/* Blood inventory mini bars */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-gray-500 mb-2">National Inventory Snapshot</div>
                  {[{g:'O+',pct:88},{g:'A+',pct:72},{g:'B+',pct:61},{g:'AB-',pct:18},{g:'O-',pct:22}].map(item=>(
                    <div key={item.g} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-700 w-7">{item.g}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${item.pct<25?'bg-red-500':item.pct<50?'bg-amber-400':'bg-green-500'} transition-all duration-1000`} style={{width:`${item.pct}%`}}/>
                      </div>
                      <span className="text-xs text-gray-400 w-6">{item.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-3 -left-4 bg-white rounded-2xl shadow-lg px-3 py-2 border border-green-100 hidden lg:flex items-center gap-2">
                <span className="text-lg">❤️</span>
                <div><div className="text-xs text-gray-500">Priya Patel</div><div className="text-xs font-bold text-green-600">Donated A+ ✓</div></div>
              </div>
              <div className="absolute -bottom-3 -right-4 bg-white rounded-2xl shadow-lg px-3 py-2 border border-blue-100 hidden lg:flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-sm font-bold text-red-700">O-</div>
                <div><div className="text-xs text-gray-500">2 units en route</div><div className="text-xs font-bold text-blue-600">ETA 12 min 🚚</div></div>
              </div>
            </div>
          </div>
        </div>
        <button onClick={() => scrollTo('stats')} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-400 hover:text-red-500 transition-colors animate-bounce">
          <span className="text-xs font-medium">Explore</span><ChevronDown size={20}/>
        </button>
      </section>

      {/* ══ LIVE STATS BAR ══════════════════════════════════════════════════ */}
      <section id="stats" className="bg-red-600 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-white text-center">
            {[
              { target:52847, suffix:'+', label:'Registered Donors',  sub:'& growing daily'   },
              { target:2913,  suffix:'+', label:'Lives Saved',        sub:'verified rescues'  },
              { target:120,   suffix:'+', label:'Partner Hospitals',  sub:'across India'      },
              { target:98,    suffix:'%', label:'Fulfilment Rate',    sub:'last 30 days'      },
            ].map((s,i)=>(
              <div key={i}>
                <div className="text-4xl lg:text-5xl font-black mb-1">
                  <AnimatedCounter target={s.target} suffix={s.suffix}/>
                </div>
                <div className="text-red-100 font-bold text-lg">{s.label}</div>
                <div className="text-red-300 text-sm mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
          {/* Online roles */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {Object.entries(onlineRoles).map(([role, count]) => (
              <div key={role} className="bg-white/10 border border-white/20 rounded-full px-4 py-1.5 flex items-center gap-2">
                <PulseDot color="bg-green-300"/>
                <span className="text-white text-xs font-semibold capitalize">{count} {role}s online</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ════════════════════════════════════════════════════════ */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block bg-red-50 text-red-600 text-xs font-bold px-4 py-1.5 rounded-full border border-red-100 mb-4">FEATURES</span>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Click to Explore Every Feature</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Each card links directly to its module. Click any feature to open it.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => <FeatureCard key={i} {...f}/>)}
          </div>
        </div>
      </section>

      {/* ══ LIVE ACTIVITY + MAP ═════════════════════════════════════════════ */}
      <section id="map" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-red-50 text-red-600 text-xs font-bold px-4 py-1.5 rounded-full border border-red-100 mb-4">LIVE NETWORK</span>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Real-Time Activity Across India</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Everything happening on BloodLink right now — donations, deliveries, emergencies, and camps.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Map */}
            <div className="lg:col-span-3 h-[460px] rounded-2xl overflow-hidden shadow-lg border border-gray-100">
              <GoogleMapEmbed/>
            </div>
            {/* Live feed */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Live Activity Feed</h3>
                <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                  <PulseDot color="bg-green-500"/>
                  <span className="text-xs font-bold text-green-700">LIVE</span>
                </div>
              </div>
              <LiveFeed events={liveEvents}/>
              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <Link to="/notifications" className="text-sm text-red-600 font-semibold hover:underline flex items-center justify-center gap-1">
                  View all notifications <ChevronRight size={15}/>
                </Link>
              </div>
            </div>
          </div>

          {/* Real-time sync explainer */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon:'🩸→🏥', title:'Blood Bank → Hospital', desc:'When a blood bank approves a unit, hospitals with matching pending requests see it instantly. The system auto-suggests allocation.' },
              { icon:'📍→❤️', title:'Camp Published → Donors', desc:'When a blood bank creates a donation camp, all eligible donors in the area receive a push notification and can register in one tap.' },
              { icon:'⚡→👥', title:'Emergency → Donors', desc:'A hospital\'s critical request instantly activates the top-ranked eligible donors via SMS, email, and push — prioritized by AI score.' },
            ].map((c,i)=>(
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-red-100 transition-all">
                <div className="text-3xl mb-3">{c.icon}</div>
                <h4 className="font-bold text-gray-900 mb-2">{c.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block bg-red-50 text-red-600 text-xs font-bold px-4 py-1.5 rounded-full border border-red-100 mb-4">BLOOD LIFECYCLE</span>
            <h2 className="text-4xl font-black text-gray-900 mb-4">From Vein to Vein — Fully Traced</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Every step logged, every unit traceable. Here's how blood flows through the BloodLink ecosystem.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {WORKFLOW.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} className="relative bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-red-200 hover:-translate-y-0.5 transition-all group">
                  <div className="text-5xl font-black text-red-100 group-hover:text-red-200 transition-colors mb-4 leading-none">{step.n}</div>
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-red-100 transition-colors">
                    <Icon size={20} className="text-red-600"/>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══ ROLES ════════════════════════════════════════════════════════════ */}
      <section id="roles" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block bg-red-50 text-red-600 text-xs font-bold px-4 py-1.5 rounded-full border border-red-100 mb-4">TAILORED PORTALS</span>
            <h2 className="text-4xl font-black text-gray-900 mb-4">One Platform for Every Role</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Six dedicated portals, each designed for a specific role in the blood supply chain.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ROLES.map((r, i) => (
              <div key={i} className={`bg-white rounded-2xl border-2 ${r.color} p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{r.icon}</span>
                  <div>
                    <h3 className="font-black text-gray-900 text-xl">{r.role}</h3>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${r.tag}`}>{r.role} Portal</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{r.desc}</p>
                <ul className="space-y-2 mb-5">
                  {r.steps.map((s, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{j+1}</div>
                      {s}
                    </li>
                  ))}
                </ul>
                <Link to={r.path}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all group-hover:shadow-md">
                  {r.role === 'Admin' ? 'Sign In' : `Register as ${r.role}`} <ArrowRight size={15}/>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TECH STACK ═══════════════════════════════════════════════════════ */}
      <section className="py-14 bg-white border-t border-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Powered by</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {['React.js + Vite','Node.js + Express','MongoDB Atlas','Socket.IO','Google OAuth 2.0','JWT Auth','Twilio SMS','Firebase FCM','Nodemailer','Cloudinary','Google Maps API','XGBoost AI','Scikit-Learn','OpenAI API','Tailwind CSS','Vercel + Render'].map(t => (
              <span key={t} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all cursor-default font-medium">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ═══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-br from-red-600 via-red-700 to-rose-800 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"/>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl"/>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="text-7xl mb-6">🩸</div>
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-5">Be the Reason Someone Survives.</h2>
          <p className="text-red-200 text-lg mb-10 max-w-xl mx-auto">
            Every registration expands the network. Every donation adds to the lifeline. Join BloodLink today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register" className="bg-white text-red-700 font-black px-10 py-4 rounded-2xl hover:bg-red-50 transition-all shadow-xl text-base flex items-center gap-2">
              Create Free Account <ArrowRight size={18}/>
            </Link>
            <Link to="/login"    className="border-2 border-white/40 text-white font-bold px-10 py-4 rounded-2xl hover:bg-white/10 transition-all text-base">
              Already a member? Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════════════ */}
      <footer className="bg-gray-950 text-gray-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center"><Droplets size={18} className="text-white"/></div>
                <span className="font-black text-white text-xl">BloodLink</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                India's most advanced AI-powered blood management and emergency response platform. Inspired by e-RaktKosh, enhanced for the future.
              </p>
              <div className="flex gap-3">
                {[{I:Phone,v:'+91-674-2390001',h:'tel:'},{I:Mail,v:'support@bloodlink.in',h:'mailto:'}].map(({I,v,h})=>(
                  <a key={v} href={`${h}${v}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-400 transition-colors">
                    <I size={13}/>{v}
                  </a>
                ))}
              </div>
            </div>
            {/* Links */}
            {[
              { title:'Platform',  links:[{l:'For Donors',p:'/register'},{l:'For Patients',p:'/register'},{l:'For Hospitals',p:'/register'},{l:'For Blood Banks',p:'/register'},{l:'For Ambulance',p:'/register'}] },
              { title:'Features',  links:[{l:'Emergency Response',p:'/requests/new'},{l:'Live Inventory',p:'/inventory'},{l:'GPS Delivery',p:'/deliveries'},{l:'Donation Camps',p:'/camps'},{l:'AI Forecasting',p:'/dashboard'}] },
              { title:'Quick Links',links:[{l:'Sign In',p:'/login'},{l:'Register',p:'/register'},{l:'Dashboard',p:'/dashboard'},{l:'Notifications',p:'/notifications'},{l:'Settings',p:'/settings'}] },
            ].map(col=>(
              <div key={col.title}>
                <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map(({l,p})=>(
                    <li key={l}><Link to={p} className="text-sm text-gray-500 hover:text-red-400 transition-colors">{l}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <span>© {new Date().getFullYear()} BloodLink. Built with ❤️ in India. Saving lives, one drop at a time.</span>
            <div className="flex items-center gap-2">
              <PulseDot color="bg-green-400"/>
              <span className="text-green-500 font-semibold">{liveStats.liveUsers} users online now</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
