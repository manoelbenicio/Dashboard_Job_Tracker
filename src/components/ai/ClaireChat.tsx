import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Sparkles, Bot, User } from 'lucide-react'
import { useJobs } from '@/context/JobContext'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

/* ─── Claire Chat Bubble ─────────────────────────────── */

export function ClaireChat() {
  const { state } = useJobs()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hey! I'm Claire, your AI career coach 🎯\n\nI can help you with:\n• Interview preparation tips\n• Salary negotiation strategies\n• Career transition advice\n• Job search optimization\n\nHow can I help you today?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const buildContext = () => {
    const jobsSummary = state.jobs.map(j => `${j.role} at ${j.company} (${j.status})`).join('; ')
    return `You are Claire, a warm, encouraging, and expert AI career coach inside JobFlow, a job tracking app.

Current user profile:
- Name: ${state.profile.name || 'Not set'}
- Skills: ${state.profile.skills.join(', ') || 'Not specified'}
- Summary: ${state.profile.summary || 'Not provided'}

Active job applications (${state.jobs.length} total):
${jobsSummary || 'No jobs yet'}

Instructions:
- Be concise but helpful (2-3 paragraphs max)
- Use a warm, encouraging tone
- Reference the user's actual data when relevant
- Give specific, actionable advice
- Use emoji sparingly for warmth`
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const apiKey = state.profile.apiKey
      if (!apiKey) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString() + '-err',
            role: 'assistant',
            content: "I'd love to help, but I need a Gemini API key first! Head to **Settings** and add your key under AI Configuration. 🔑",
            timestamp: new Date(),
          },
        ])
        setLoading(false)
        return
      }

      const { GoogleGenAI } = await import('@google/genai')
      const client = new GoogleGenAI({ apiKey })

      const conversationHistory = messages
        .slice(-6)
        .map(m => `${m.role === 'user' ? 'User' : 'Claire'}: ${m.content}`)
        .join('\n')

      const prompt = `${buildContext()}\n\nConversation:\n${conversationHistory}\nUser: ${userMsg.content}\nClaire:`

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      })

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString() + '-ai',
          role: 'assistant',
          content: response.text || "I'm having trouble thinking right now. Could you try again?",
          timestamp: new Date(),
        },
      ])
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString() + '-err',
          role: 'assistant',
          content: "Oops, something went wrong. Please check your API key in Settings and try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* FAB */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center z-40 transition-all hover:scale-110 active:scale-95"
          style={{
            background: 'var(--gradient-primary)',
            boxShadow: '0 8px 32px rgba(16,185,129,0.35)',
          }}
        >
          <MessageCircle size={24} style={{ color: 'var(--color-on-primary)' }} />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col animate-fade-in-up rounded-2xl overflow-hidden"
          style={{
            width: '380px',
            height: '540px',
            background: 'var(--color-surface-container)',
            border: '1px solid var(--glass-stroke)',
            boxShadow: '0 12px 48px rgba(0,0,0,0.3)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <Sparkles size={18} style={{ color: '#fff' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#fff' }}>Claire</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>AI Career Coach</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:opacity-70" style={{ color: '#fff' }}>
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: msg.role === 'user' ? 'var(--color-surface-container-high)' : 'var(--gradient-primary-subtle)',
                  }}
                >
                  {msg.role === 'user' ? (
                    <User size={14} style={{ color: 'var(--color-on-surface-variant)' }} />
                  ) : (
                    <Bot size={14} style={{ color: 'var(--color-primary)' }} />
                  )}
                </div>
                <div
                  className="max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                  style={{
                    background: msg.role === 'user' ? 'var(--color-primary-container)' : 'var(--color-surface-container-low)',
                    color: msg.role === 'user' ? 'var(--color-on-primary-container)' : 'var(--color-on-surface)',
                    borderBottomRightRadius: msg.role === 'user' ? '6px' : undefined,
                    borderBottomLeftRadius: msg.role === 'assistant' ? '6px' : undefined,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--gradient-primary-subtle)' }}>
                  <Bot size={14} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div className="rounded-2xl px-4 py-3 flex gap-1" style={{ background: 'var(--color-surface-container-low)' }}>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-primary)', animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-primary)', animationDelay: '200ms' }} />
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-primary)', animationDelay: '400ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3" style={{ borderTop: '1px solid var(--color-surface-container-high)' }}>
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder="Ask Claire anything..."
                className="flex-1 bg-transparent text-sm outline-none px-3 py-2.5 rounded-xl"
                style={{
                  background: 'var(--color-surface-container-lowest)',
                  color: 'var(--color-on-surface)',
                  border: '1px solid var(--color-surface-container-high)',
                  fontFamily: 'var(--font-primary)',
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <Send size={16} style={{ color: 'var(--color-on-primary)' }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
