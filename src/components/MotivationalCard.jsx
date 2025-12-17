import React, { useState, useEffect } from 'react'

function MotivationalCard({ upcomingCount }) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)
  const [quote, setQuote] = useState('')

  useEffect(() => {
    const quotes = [
      "Yoo exams are cooked. 🍳",
      "We are so back. 📈",
      "Absolute cinema. ✋🤚",
      "Ez clap. 👏",
      "Mission Passed. Respect + 🕶️",
      "W in the chat. 💬",
      "Skill issue? Nah. 🎮",
      "Speedrun complete. ⏱️",
      "GG WP. 🤝",
      "Vibe check passed. ✅"
    ]
    setQuote(quotes[Math.floor(Math.random() * quotes.length)])

    const duration = 8000
    const interval = 100
    const steps = duration / interval
    const decrement = 100 / steps

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          setIsVisible(false)
          return 0
        }
        return prev - decrement
      })
    }, interval)

    return () => clearInterval(timer)
  }, [])

  if (!isVisible || upcomingCount > 3) return null

  let content = {
    title: '',
    message: '',
    icon: null,
    colorClass: ''
  }

  if (upcomingCount === 3) {
    content = {
      title: "Keep the Momentum!",
      message: "Three exams left. Stay focused, you're doing amazing!",
      colorClass: "text-indigo-600 bg-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-300",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  } else if (upcomingCount === 2) {
    content = {
      title: "Almost There!",
      message: "Just two more exams to go. Keep pushing, you're doing great!",
      colorClass: "text-blue-600 bg-blue-100 dark:bg-blue-500/20 dark:text-blue-300",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      )
    }
  } else if (upcomingCount === 1) {
    content = {
      title: "One Last Battle!",
      message: "Finish strong! The finish line is right in front of you.",
      colorClass: "text-purple-600 bg-purple-100 dark:bg-purple-500/20 dark:text-purple-300",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
      )
    }
  } else if (upcomingCount === 0) {
    content = {
      title: "Freedom!",
      message: "You've conquered them all. Time to relax and celebrate!",
      colorClass: "text-green-600 bg-green-100 dark:bg-green-500/20 dark:text-green-300",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-500" />
      
      {/* Card */}
      <div className="pointer-events-auto relative w-[90%] max-w-sm p-6 rounded-2xl bg-white/20 dark:bg-black/40 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-2xl transform transition-all duration-500 animate-fade-in-up">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`p-4 rounded-full mb-4 ${content.colorClass} shadow-inner`}>
            {content.icon}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {content.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
            {content.message}
          </p>

          {/* Random Quote */}
          <div className="mb-6 px-4 py-3 bg-white/30 dark:bg-black/30 rounded-lg border border-white/20 dark:border-white/5">
            <p className="text-xs italic text-gray-500 dark:text-gray-400">
              "{quote}"
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-1 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MotivationalCard
