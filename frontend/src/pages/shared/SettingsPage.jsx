import React, { useState } from 'react'
import { User, Bell, Lock, Shield, Save, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { Alert } from '../../components/shared/UI'

export default function SettingsPage() {
  const { user } = useAuth()
  const [tab, setTab]       = useState('profile')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [profile, setProfile] = useState({ name:user?.name||'', phone:user?.phone||'' })
  const [passForm, setPassForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' })
  const [notifPrefs, setNotifPrefs] = useState({ email:true, sms:true, push:true, whatsapp:false })

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r=>setTimeout(r,800))
    setSaving(false); setSaved(true)
    toast.success('Settings saved!')
    setTimeout(()=>setSaved(false),2000)
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirmPassword) { toast.error('Passwords do not match'); return }
    setSaving(true)
    await new Promise(r=>setTimeout(r,800))
    setSaving(false)
    toast.success('Password changed!')
    setPassForm({ currentPassword:'', newPassword:'', confirmPassword:'' })
  }

  const tabs = [
    {id:'profile', icon:User,   label:'Profile'},
    {id:'notifs',  icon:Bell,   label:'Notifications'},
    {id:'security',icon:Lock,   label:'Security'},
  ]

  const roleColors = { admin:'badge-purple', bloodbank:'badge-red', hospital:'badge-blue', donor:'badge-green', patient:'badge-yellow', ambulance:'badge-yellow' }

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div><h1 className="page-title">Settings</h1><p className="page-subtitle">Manage your account and preferences</p></div>

      <div className="flex bg-gray-100 rounded-xl p-1 gap-1 w-fit">
        {tabs.map(({id,icon:Icon,label})=>(
          <button key={id} onClick={()=>setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab===id?'bg-white text-gray-900 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>
            <Icon size={15}/>{label}
          </button>
        ))}
      </div>

      {tab==='profile'&&(
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Profile Information</h2>
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {user?.avatar
                ? <img src={user.avatar} alt="" className="w-full h-full rounded-2xl object-cover"/>
                : user?.name?.[0]?.toUpperCase()
              }
            </div>
            <div>
              <div className="font-semibold text-gray-900">{user?.name}</div>
              <div className="text-sm text-gray-500">{user?.email}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge text-xs capitalize ${roleColors[user?.role]||'badge-gray'}`}>{user?.role}</span>
                {user?.isEmailVerified && <span className="badge-green text-xs flex items-center gap-1"><CheckCircle size={10}/>Verified</span>}
                {!user?.isAdminVerified && ['hospital','bloodbank'].includes(user?.role) && (
                  <span className="badge-yellow text-xs">Pending Admin Approval</span>
                )}
                {user?.isAdminVerified && ['hospital','bloodbank'].includes(user?.role) && (
                  <span className="badge-green text-xs flex items-center gap-1"><Shield size={10}/>Admin Verified</span>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div><label className="label">Full Name</label>
              <input className="input" value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))}/></div>
            <div><label className="label">Phone</label>
              <input className="input" value={profile.phone} onChange={e=>setProfile(p=>({...p,phone:e.target.value}))}/></div>
            <div><label className="label">Email</label>
              <input className="input bg-gray-50 cursor-not-allowed" value={user?.email||''} readOnly/>
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed after registration.</p></div>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary mt-5">
            {saving?<><Loader2 size={15} className="animate-spin"/>Saving...</>:saved?<><CheckCircle size={15}/>Saved!</>:<><Save size={15}/>Save Changes</>}
          </button>
        </div>
      )}

      {tab==='notifs'&&(
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Notification Preferences</h2>
          <div className="space-y-3">
            {[
              {key:'email',   label:'Email Notifications',    desc:'OTPs, emergency alerts, fulfilment updates'},
              {key:'sms',     label:'SMS Notifications',      desc:'Emergency alerts and appointment reminders via Twilio'},
              {key:'push',    label:'Push Notifications',     desc:'Real-time browser and mobile alerts via Firebase FCM'},
              {key:'whatsapp',label:'WhatsApp Notifications', desc:'Camp announcements and donation reminders'},
            ].map(n=>(
              <div key={n.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{n.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{n.desc}</div>
                </div>
                <button onClick={()=>setNotifPrefs(p=>({...p,[n.key]:!p[n.key]}))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${notifPrefs[n.key]?'bg-red-600':'bg-gray-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${notifPrefs[n.key]?'translate-x-7':'translate-x-1'}`}/>
                </button>
              </div>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary mt-5">
            {saving?<><Loader2 size={15} className="animate-spin"/>Saving...</>:<><Save size={15}/>Save Preferences</>}
          </button>
        </div>
      )}

      {tab==='security'&&(
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Change Password</h2>
          {user?.authProvider==='google'&&(
            <Alert type="info" message="Your account uses Google Sign-In. Password change is not available for OAuth accounts." className="mb-4"/>
          )}
          <form onSubmit={changePassword} className="space-y-4">
            <div><label className="label">Current Password</label>
              <input type="password" className="input" disabled={user?.authProvider==='google'}
                value={passForm.currentPassword} onChange={e=>setPassForm(p=>({...p,currentPassword:e.target.value}))}/></div>
            <div><label className="label">New Password</label>
              <input type="password" className="input" disabled={user?.authProvider==='google'} minLength={8}
                value={passForm.newPassword} onChange={e=>setPassForm(p=>({...p,newPassword:e.target.value}))}/></div>
            <div><label className="label">Confirm New Password</label>
              <input type="password" className="input" disabled={user?.authProvider==='google'}
                value={passForm.confirmPassword} onChange={e=>setPassForm(p=>({...p,confirmPassword:e.target.value}))}/></div>
            <button type="submit" disabled={saving||user?.authProvider==='google'} className="btn-primary">
              {saving?<><Loader2 size={15} className="animate-spin"/>Changing...</>:<><Shield size={15}/>Change Password</>}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
