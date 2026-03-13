'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, Loader2, Bot, User, ExternalLink, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PlusMenu } from '@/components/chat/PlusMenu'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const suggestions = [
  { label: 'Gift ideas for...', prefix: 'Give me gift ideas for ' },
  { label: "What's coming up?", prefix: "What occasions are coming up soon?" },
  { label: 'Save a gift idea', prefix: 'I want to save a gift idea: ' },
]

export function DashboardChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, includeContext: true }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') break

              try {
                const parsed = JSON.parse(data)
                if (parsed.text) {
                  assistantMessage += parsed.text
                  setMessages([...newMessages, { role: 'assistant', content: assistantMessage }])
                }
              } catch {
                // Skip invalid JSON (metadata chunks like agentPath)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Dashboard chat error:', error)
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Sorry, something went wrong. Try again or use the full chat.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-blue-500 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white" />
          <h2 className="text-sm font-semibold text-white">Gift Assistant</h2>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => { setMessages([]); inputRef.current?.focus() }}
            className="text-white/70 hover:text-white transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 max-h-[400px] min-h-[200px]">
        {messages.length === 0 ? (
          <div className="text-center py-4">
            <div className="h-10 w-10 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center mb-2">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <p className="text-xs text-gray-500 mb-3">Ask about gift ideas or manage your stash</p>
            <div className="space-y-1.5">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => { setInput(s.prefix); inputRef.current?.focus() }}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg border border-gray-150 hover:border-orange-300 hover:bg-orange-50 transition-colors text-gray-600"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex gap-2',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    'rounded-xl px-3 py-2 text-xs leading-relaxed max-w-[85%]',
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-orange-500 to-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  )}
                >
                  <p className="whitespace-pre-wrap m-0">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="h-3 w-3 text-gray-500" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3 w-3 text-white" />
                </div>
                <div className="bg-gray-100 rounded-xl px-3 py-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <PlusMenu onInjectPrefix={(prefix) => { setInput(prefix); inputRef.current?.focus() }} />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about gifts..."
            disabled={loading}
            className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="h-8 w-8 rounded-lg bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Footer link */}
      <Link
        href="/chat"
        className="flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-orange-500 py-2 border-t border-gray-50 transition-colors"
      >
        Open full chat <ExternalLink className="w-3 h-3" />
      </Link>
    </div>
  )
}
