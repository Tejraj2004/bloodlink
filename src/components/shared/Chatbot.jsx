import React, { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, X, Bot, User, Minimize2 } from 'lucide-react'

const quickQuestions = [
  'Am I eligible to donate?',
  'Which blood groups are compatible with O+?',
  'How often can I donate blood?',
  'What is the donation process?',
]

const autoReplies = {
  'eligible': 'To donate blood, you must be 18–65 years old, weigh at least 45 kg, and have not donated whole blood in the last 90 days. Certain medical conditions may affect eligibility.',
  'compatible': 'O+ can receive blood from O+, O-, A+, A-, B+, B-, AB+, AB-. O+ can donate to A+, B+, AB+, and O+.',
  'often': 'Whole blood can be donated once every 90 days (3 months). Platelets can be donated every 7 days, plasma every 28 days.',
  'process': 'The donation process takes 30–45 minutes: Registration → Medical screening → Blood collection (10–15 min) → Rest and refreshments. Your blood is then tested and processed.',
  'default': "I'm LifeBot, BloodLink's AI assistant. I can help with blood compatibility, donation eligibility, process guidance, and platform navigation. What would you like to know?",
}

function getReply(msg) {
  const lower = msg.toLowerCase()
  if (lower.includes('eligible') || lower.includes('donate') || lower.includes('qualify')) return autoReplies.eligible
  if (lower.includes('compatible') || lower.includes('o+') || lower.includes('blood group')) return autoReplies.compatible
  if (lower.includes('often') || lower.includes('how many') || lower.includes('frequency')) return autoReplies.often
  if (lower.includes('process') || lower.includes('how') || lower.includes('steps')) return autoReplies.process
  return autoReplies.default
}

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm LifeBot 🩸 — your BloodLink AI assistant. Ask me anything about blood donation, compatibility, or platform features." }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const send = (text) => {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages(prev => [...prev, { role: 'bot', text: getReply(msg) }])
    }, 900)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blood-600 hover:bg-blood-500 rounded-full shadow-2xl shadow-blood-900/50 flex items-center justify-center text-white transition-all z-50"
      >
        {open ? <X size={22}/> : <MessageSquare size={22}/>}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden" style={{ height: 420 }}>
          {/* Header */}
          <div className="bg-blood-700 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-blood-500 rounded-full flex items-center justify-center">
              <Bot size={16} className="text-white"/>
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm">LifeBot</div>
              <div className="flex items-center gap-1.5 text-xs text-blood-200">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"/>Online
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-blood-200 hover:text-white">
              <Minimize2 size={16}/>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${m.role==='bot' ? 'bg-blood-700' : 'bg-slate-700'}`}>
                  {m.role === 'bot' ? <Bot size={13} className="text-white"/> : <User size={13} className="text-white"/>}
                </div>
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'bot' ? 'bg-slate-800 text-slate-200 rounded-tl-sm' : 'bg-blood-700 text-white rounded-tr-sm'
                }`}>{m.text}</div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-blood-700 flex items-center justify-center flex-shrink-0">
                  <Bot size={13} className="text-white"/>
                </div>
                <div className="bg-slate-800 px-3 py-2 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    {[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Quick Questions */}
          <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
            {quickQuestions.slice(0,2).map(q => (
              <button key={q} onClick={() => send(q)} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full px-2.5 py-1 transition-all border border-slate-700">{q}</button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-800 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask LifeBot..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blood-500 placeholder:text-slate-600"
            />
            <button onClick={() => send()} className="w-9 h-9 bg-blood-600 hover:bg-blood-500 rounded-xl flex items-center justify-center text-white transition-all">
              <Send size={15}/>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
