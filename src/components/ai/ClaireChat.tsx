import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Sparkles, Bot, User, Image as ImageIcon } from 'lucide-react'
import { useJobs } from '@/context/JobContext'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
  timestamp: Date
}

export function ClaireChat() {
  const { state } = useJobs()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome', role: 'assistant',
      content: `Olá! Eu sou a Claire, sua coach de carreira com IA 🎯\n\nPosso te ajudar com:\n• Preparação para entrevistas\n• Estratégias de negociação salarial\n• Transição de carreira\n• Otimização da busca por emprego\n• Criação e melhoria de currículos\n• 📸 Análise de screenshots (cole ou envie uma imagem!)\n\nComo posso te ajudar hoje?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingImage, setPendingImage] = useState<{ dataUrl: string; mimeType: string } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  // Handle paste events (Ctrl+V screenshots)
  useEffect(() => {
    if (!isOpen) return
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) processImageFile(file)
          break
        }
      }
    }
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [isOpen])

  const processImageFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      setPendingImage({
        dataUrl: reader.result as string,
        mimeType: file.type || 'image/png',
      })
    }
    reader.readAsDataURL(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      processImageFile(file)
    }
    e.target.value = ''
  }

  const buildContext = () => {
    const jobsSummary = state.jobs.map(j => `${j.role} at ${j.company} (${j.status})`).join('; ')
    return `You are Claire, a warm, encouraging, and expert AI career coach inside JobFlow, a job tracking app.\n\nIMPORTANT: Always respond in Brazilian Portuguese (pt-BR) by default. If the user writes in another language, respond in that language instead.\n\nCurrent user profile:\n- Name: ${state.profile.name || 'Not set'}\n- Skills: ${state.profile.skills.join(', ') || 'Not specified'}\n- Summary: ${state.profile.summary || 'Not provided'}\n\nActive job applications (${state.jobs.length} total):\n${jobsSummary || 'No jobs yet'}\n\nInstructions:\n- ALWAYS respond in Brazilian Portuguese (pt-BR) unless the user explicitly writes in another language\n- Be concise but helpful (2-3 paragraphs max)\n- Use a warm, encouraging tone\n- Reference the user's actual data when relevant\n- Give specific, actionable advice\n- Use emoji sparingly for warmth\n- When the user shares a screenshot/image, analyze it carefully and provide detailed feedback about what you see\n- If the screenshot shows an error, identify the error, explain what's happening, and suggest fixes\n- If the screenshot shows a UI issue, describe what looks wrong and recommend improvements`
  }

  const handleSend = async () => {
    if ((!input.trim() && !pendingImage) || loading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim() || (pendingImage ? '📸 [Imagem enviada para análise]' : ''),
      imageUrl: pendingImage?.dataUrl,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])

    const currentImage = pendingImage
    setInput('')
    setPendingImage(null)
    setLoading(true)

    try {
      const apiKey = state.profile.apiKey
      if (!apiKey) {
        setMessages(prev => [...prev, { id: Date.now().toString() + '-err', role: 'assistant', content: "Adoraria te ajudar, mas preciso de uma chave API do Gemini primeiro! Vá em **Configurações** e adicione sua chave em Configuração de IA. 🔑", timestamp: new Date() }])
        setLoading(false)
        return
      }

      const { GoogleGenAI } = await import('@google/genai')
      const client = new GoogleGenAI({ apiKey })
      const conversationHistory = messages.slice(-6).map(m => `${m.role === 'user' ? 'User' : 'Claire'}: ${m.content}`).join('\n')

      // Build the content parts
      const parts: any[] = []

      // Text part
      const textPrompt = `${buildContext()}\n\nConversation:\n${conversationHistory}\nUser: ${userMsg.content}${currentImage ? '\n[O usuário também enviou uma imagem/screenshot para análise. Analise a imagem cuidadosamente e forneça feedback detalhado em português-BR.]' : ''}\nClaire:`
      parts.push({ text: textPrompt })

      // Image part (if present)
      if (currentImage) {
        const base64Data = currentImage.dataUrl.split(',')[1]
        parts.push({
          inlineData: {
            mimeType: currentImage.mimeType,
            data: base64Data,
          }
        })
      }

      const response = await client.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: [{ role: 'user', parts }],
      })

      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-ai',
        role: 'assistant',
        content: response.text || "Estou com dificuldade para processar. Pode tentar novamente?",
        timestamp: new Date(),
      }])
    } catch (err: any) {
      const errorCode = err?.status || err?.code || 'UNKNOWN'
      const errorMsg = err?.message || 'Erro desconhecido'
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-err',
        role: 'assistant',
        content: `⚠️ **Erro ao processar** (Código: ${errorCode})\n\n${errorMsg}\n\nVerifique sua chave API em Configurações e tente novamente.`,
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* FAB */}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} style={{
          position: 'fixed', bottom: '24px', right: '24px', width: '56px', height: '56px',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 40, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #003E50, #00B0BD)',
          boxShadow: '0 8px 32px rgba(0,176,189,0.35)',
          transition: 'transform 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <MessageCircle size={24} style={{ color: '#FFFFFF' }} />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 50,
          width: '400px', height: '560px', display: 'flex', flexDirection: 'column',
          background: '#002B3A', border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
          animation: 'indra-slide-up 0.3s ease-out',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #003E50, #00B0BD)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.2)' }}>
                <Sparkles size={18} style={{ color: '#fff' }} />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#fff', margin: 0 }}>Claire</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>AI Career Coach · 📸 Aceita imagens</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}>
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', gap: '8px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: msg.role === 'user' ? 'rgba(0,176,189,0.15)' : '#003E50',
                }}>
                  {msg.role === 'user'
                    ? <User size={14} style={{ color: '#00B0BD' }} />
                    : <Bot size={14} style={{ color: '#00B0BD' }} />
                  }
                </div>
                <div style={{
                  maxWidth: '75%', padding: '10px 14px', fontSize: '13px', lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  background: msg.role === 'user' ? 'rgba(0,176,189,0.12)' : '#003E50',
                  color: '#FFFFFF',
                  borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                }}>
                  {/* Show image thumbnail if present */}
                  {msg.imageUrl && (
                    <div style={{ marginBottom: '8px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <img src={msg.imageUrl} alt="Screenshot" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', display: 'block' }} />
                    </div>
                  )}
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: '#003E50' }}>
                  <Bot size={14} style={{ color: '#00B0BD' }} />
                </div>
                <div style={{ background: '#003E50', padding: '12px 16px', borderRadius: '12px', display: 'flex', gap: '4px' }}>
                  {[0, 200, 400].map(d => (
                    <span key={d} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00B0BD', animation: `pulse 1.4s ${d}ms infinite ease-in-out` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pending image preview */}
          {pendingImage && (
            <div style={{
              padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,176,189,0.06)',
            }}>
              <img src={pendingImage.dataUrl} alt="Preview" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }} />
              <span style={{ fontSize: '12px', color: '#7A9CAE', flex: 1 }}>📸 Imagem pronta para envio</span>
              <button onClick={() => setPendingImage(null)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}>
                <X size={14} />
              </button>
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Image upload button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Enviar screenshot ou imagem"
                style={{
                  width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: pendingImage ? 'rgba(0,176,189,0.15)' : 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                  cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
                }}
              >
                <ImageIcon size={16} style={{ color: pendingImage ? '#00B0BD' : '#7A9CAE' }} />
              </button>
              <input
                ref={fileInputRef} type="file" accept="image/*"
                style={{ display: 'none' }} onChange={handleFileSelect}
              />

              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder={pendingImage ? "Descreva o problema na imagem..." : "Pergunte qualquer coisa para Claire..."}
                style={{
                  flex: 1, background: 'transparent', fontSize: '13px', outline: 'none',
                  padding: '10px 14px', color: '#FFFFFF', border: 'none',
                  borderBottom: '1px solid #B0B4BD',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'border-color 0.25s ease',
                }}
                onFocus={e => (e.currentTarget.style.borderBottomColor = '#00B0BD')}
                onBlur={e => (e.currentTarget.style.borderBottomColor = '#B0B4BD')}
              />
              <button
                onClick={handleSend}
                disabled={(!input.trim() && !pendingImage) || loading}
                style={{
                  width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#00B0BD', border: 'none', cursor: 'pointer',
                  opacity: ((!input.trim() && !pendingImage) || loading) ? 0.4 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <Send size={16} style={{ color: '#002B3A' }} />
              </button>
            </div>
            <p style={{ fontSize: '10px', color: '#7A9CAE', margin: '6px 0 0', textAlign: 'center' }}>
              💡 Cole screenshots com Ctrl+V ou clique no 📷
            </p>
          </div>
        </div>
      )}
    </>
  )
}
