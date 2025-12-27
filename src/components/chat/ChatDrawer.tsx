'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Send, User, MoreVertical } from 'lucide-react'
import Button from '@/components/ui/button'
import { gsap } from 'gsap'

interface ChatDrawerProps {
  isOpen: boolean
  onClose: () => void
  recipient: {
    id: string
    name: string
    status: 'online' | 'offline' | 'away'
    image?: string
  } | null
}

interface Message {
  id: string
  text: string
  sender: 'me' | 'them'
  timestamp: Date
}

export default function ChatDrawer({ isOpen, onClose, recipient }: ChatDrawerProps) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const drawerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let poller: NodeJS.Timeout

    if (isOpen && recipient) {
      const fetchMessages = async () => {
        try {
          const res = await fetch(`/api/chat/history?peerId=${recipient.id}`)
          if (res.ok) {
            const data = await res.json()
            if (data.messages) {
              setMessages(data.messages.map((m: any) => ({
                id: m.id,
                text: m.content,
                sender: m.sender_id === recipient.id ? 'them' : 'me',
                timestamp: new Date(m.created_at)
              })))
            }
          }
        } catch (error) {
          console.error('Failed to fetch messages:', error)
        }
      }

      fetchMessages()
      // Poll every 5 seconds for new messages
      poller = setInterval(fetchMessages, 5000)
      
      const tl = gsap.timeline()
      tl.to(overlayRef.current, { 
        display: 'block', 
        opacity: 1, 
        duration: 0.3 
      })
      .to(drawerRef.current, { 
        x: '0%', 
        duration: 0.4, 
        ease: 'power3.out' 
      }, '-=0.3')
    } else {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(overlayRef.current, { display: 'none' })
        }
      })
      tl.to(drawerRef.current, { 
        x: '100%', 
        duration: 0.3, 
        ease: 'power3.in' 
      })
      .to(overlayRef.current, { 
        opacity: 0, 
        duration: 0.3 
      }, '-=0.1')
    }

    return () => {
      if (poller) clearInterval(poller)
    }
  }, [isOpen, recipient])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!message.trim() || !recipient) return

    const msgContent = message
    setMessage('') // Clear immediately for better UX

    // Optimistic Update
    const optimisticId = Date.now().toString()
    const newMessage: Message = {
      id: optimisticId,
      text: msgContent,
      sender: 'me',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: recipient.id,
          content: msgContent
        })
      })

      if (!res.ok) {
        throw new Error('Failed to send')
      }
      
      // Refresh to get server timestamp/ID
      // fetchMessages() passed from Effect would be better, but we rely on poller or next fetch
    } catch (error) {
      console.error('Send failed:', error)
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimisticId))
      alert('Failed to send message. Please try again.')
    }
  }

  if (!recipient) return null

  return (
    <>
      {/* Overlay */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 hidden opacity-0"
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-2xl transform translate-x-full flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                {recipient.name.charAt(0)}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{recipient.name}</h3>
            </div>
          </div>
          <div className="flex items-center gap-1">
             <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-gray-400 hover:text-red-500" onClick={onClose}>
                <X className="w-5 h-5" />
             </Button>
          </div>
        </div>

        {/* Messages Field */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                  msg.sender === 'me' 
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-200' 
                    : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none shadow-sm'
                }`}
              >
                {msg.text}
                <p className={`text-[10px] mt-1 ${msg.sender === 'me' ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSend} className="flex items-end gap-2">
            <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-transparent border-none focus:ring-0 p-3 max-h-32 min-h-[44px] text-sm resize-none"
                  rows={1}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSend()
                      }
                  }}
                />
            </div>
            <Button 
              type="submit" 
              className={`rounded-full w-11 h-11 flex items-center justify-center flex-shrink-0 transition-all ${message.trim() ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              disabled={!message.trim()}
            >
              <Send className="w-5 h-5 ml-0.5" />
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
