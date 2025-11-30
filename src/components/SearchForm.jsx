import { useState } from 'react'

function SearchForm({ onSearch, darkMode, toggleDarkMode }) {
  const [registerNumber, setRegisterNumber] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!registerNumber.trim()) {
      alert('Please enter your register number.')
      return
    }

    onSearch(registerNumber)
  }

  return (
    <div className="flex items-center justify-center min-h-screen py-8 sm:py-12 px-4 bg-white dark:bg-black transition-colors duration-300">
      {/* Dark Mode Toggle - Top Right */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 p-2.5 sm:p-3 rounded-full bg-gray-200 dark:bg-zinc-800 
                   hover:bg-gray-300 dark:hover:bg-zinc-700 transition-all duration-300 shadow-lg z-50"
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          // Sun icon for light mode
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          // Moon icon for dark mode
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>

      <div className="w-full max-w-lg">
        <div className="bg-white dark:bg-black rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 p-6 sm:p-10 transition-colors duration-300">
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center justify-center mb-4 sm:mb-6">
              <img src="/logo.svg" alt="ExamTrack Pro Logo" className="w-20 h-20 sm:w-24 sm:h-24" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-black dark:text-white mb-2 sm:mb-3">
              ExamTrack Pro
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base font-medium">Smart Exam Scheduler</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm mt-2">Enter your register number to view your schedule</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label htmlFor="registerNumber" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                Register Number
              </label>
              <input
                id="registerNumber"
                type="text"
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value)}
                className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-700 rounded-xl 
                         text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 
                         focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all duration-200 text-base"
                placeholder="e.g., 212222020001"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 
                       text-white dark:text-black font-bold py-3 sm:py-4 px-6 rounded-xl transition-all duration-200 
                       shadow-lg hover:shadow-xl 
                       hover:-translate-y-1 active:translate-y-0 text-base"
            >
              View Schedule
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SearchForm

