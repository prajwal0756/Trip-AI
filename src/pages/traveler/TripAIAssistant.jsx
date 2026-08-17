import { useState, useRef, useEffect } from 'react'
import { FaPaperPlane, FaMagic, FaUser, FaCompass } from 'react-icons/fa'

const EXAMPLE_PROMPTS = [
  'I want a peaceful 3-day trip near Pokhara with mountain views and local food.',
  'Suggest a budget-friendly destination for a family trip in Nepal.',
  'I want somewhere for hiking and nature photography.',
]

export default function TripAIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content:
        "Namaste! I'm TripAI Assistant. Tell me what kind of trip you're looking for, and I'll help you discover destinations in Nepal.",
    },
  ])

  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages, isTyping])

  const sendMessage = (text = input) => {
    const query = text.trim()

    if (!query || isTyping) return

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: 'user',
        content: query,
      },
    ])

    setInput('')
    setIsTyping(true)

    // Temporary response.
    // Step 3 will replace this with the real FastAPI AI endpoint.
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content:
            "I understand your request. I'm preparing the AI-powered destination search. In the next step, this response will come from TripAI's NLP, embeddings, and recommendation system.",
        },
      ])

      setIsTyping(false)
    }, 900)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage()
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-sand-50 dark:bg-navy-950 transition-colors duration-200">
      <div className="mx-auto flex max-w-5xl flex-col px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-terracotta-500 text-white shadow-sm">
            <FaMagic size={22} />
          </div>

          <h1 className="font-display text-3xl font-semibold text-[#10263A] dark:text-[#F5F3EE] sm:text-4xl">
            TripAI Assistant
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-ink-500 dark:text-[#AAB5C0] sm:text-base">
            Describe your ideal trip in your own words and let TripAI help
            you discover destinations across Nepal.
          </p>
        </div>

        {/* Chat container */}
        <div className="flex min-h-[560px] flex-col overflow-hidden rounded-3xl border border-[#10263A]/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#121C27]">

          {/* Chat header */}
          <div className="flex items-center gap-3 border-b border-[#10263A]/10 px-5 py-4 dark:border-white/10">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-900 text-white">
              <FaCompass size={15} />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#10263A] dark:text-[#F5F3EE]">
                TripAI
              </p>

              <p className="text-xs text-ink-500 dark:text-[#AAB5C0]">
                Nepal travel assistant
              </p>
            </div>

            <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Ready
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">

            {messages.map((message) => {
              const isUser = message.role === 'user'

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isUser && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-terracotta-500 text-white">
                      <FaMagic size={12} />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[70%] ${
                      isUser
                        ? 'rounded-br-md bg-teal-900 text-white'
                        : 'rounded-bl-md bg-sand-100 text-[#10263A] dark:bg-white/10 dark:text-[#F5F3EE]'
                    }`}
                  >
                    {message.content}
                  </div>

                  {isUser && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#10263A] text-white dark:bg-white dark:text-[#10263A]">
                      <FaUser size={12} />
                    </div>
                  )}
                </div>
              )
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-terracotta-500 text-white">
                  <FaMagic size={12} />
                </div>

                <div className="rounded-2xl rounded-bl-md bg-sand-100 px-4 py-3 dark:bg-white/10">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-ink-500/60 [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-ink-500/60 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-ink-500/60" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Example prompts */}
          {messages.length === 1 && (
            <div className="border-t border-[#10263A]/10 px-4 py-4 dark:border-white/10 sm:px-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-500 dark:text-[#AAB5C0]">
                Try asking
              </p>

              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="rounded-xl border border-[#10263A]/10 bg-sand-50 px-3 py-2 text-left text-xs text-[#10263A] transition-colors hover:border-terracotta-500 hover:text-terracotta-500 dark:border-white/10 dark:bg-white/5 dark:text-[#F5F3EE] dark:hover:border-terracotta-500"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-[#10263A]/10 p-4 dark:border-white/10 sm:p-5"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-[#10263A]/10 bg-sand-50 p-2 transition-colors focus-within:border-terracotta-500 dark:border-white/10 dark:bg-[#0B1117]">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                rows={1}
                placeholder="Ask TripAI about your ideal trip..."
                className="max-h-32 min-h-[42px] flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm text-[#10263A] outline-none placeholder:text-ink-500/60 dark:text-[#F5F3EE] dark:placeholder:text-[#AAB5C0]/60"
              />

              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-terracotta-500 text-white transition-all hover:bg-terracotta-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FaPaperPlane size={14} />
              </button>
            </div>

            <p className="mt-2 text-center text-[11px] text-ink-500/70 dark:text-[#AAB5C0]/60">
              TripAI will use your request to find relevant travel options.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
