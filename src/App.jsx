import { useState, useEffect, useCallback } from 'react'
import { Analytics } from '@vercel/analytics/react'
import SearchForm from './components/SearchForm'
import Timetable from './components/Timetable'
import CalendarView from './components/CalendarView'
import { getStudentsSearchIndex } from './utils/studentDataService'
import { rescheduledUpdates } from './data/rescheduled'
import Admin from './pages/Admin'
import { db } from './firebase'
import { collection, getDocs } from 'firebase/firestore'

// Helper for date conversion: DD.MM.YYYY to YYYY-MM-DD
const convertDate = (dateStr) => {
  if (!dateStr) return null
  const parts = String(dateStr).trim().split('.')
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0')
    const month = parts[1].padStart(2, '0')
    const year = parts[2]
    return `${year}-${month}-${day}`
  }
  return dateStr
}

// Helper for session normalization: "F.N." -> "FN", "A.N." -> "AN"
const normalizeSession = (slot) => {
  if (!slot) return ''
  const upper = String(slot).toUpperCase().replace(/\./g, '').trim()
  if (upper === 'FN' || upper === 'F N' || upper === 'FORENOON') return 'FN'
  if (upper === 'AN' || upper === 'A N' || upper === 'AFTERNOON') return 'AN'
  return upper
}

function App() {
  const [studentSchedule, setStudentSchedule] = useState(null)
  const [studentInfo, setStudentInfo] = useState(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [venueOverrides, setVenueOverrides] = useState({})
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved preference, default to light mode (false)
    const savedMode = localStorage.getItem('darkMode')
    return savedMode === 'true' ? true : false
  })

  // Fetch Live Venue Overrides from Firebase
  useEffect(() => {
    const fetchOverrides = async () => {
      if (!db) return;
      try {
        const querySnapshot = await getDocs(collection(db, "theoryVenueOverrides"));
        const overrides = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          overrides[doc.id] = { hall: data.hall, seatNo: data.seatNo };
        });
        setVenueOverrides(overrides);
      } catch (err) {
        console.error("Failed to fetch venue overrides from Firebase", err);
      }
    };
    fetchOverrides();
  }, [])

  // Update document class and localStorage when dark mode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev)
  }, [])

  const handleSearch = useCallback(async (registerNumber) => {
    const searchValue = String(registerNumber || '').trim().toLowerCase()
    
    // Retrieve pre-built O(1) search index
    const searchIndex = await getStudentsSearchIndex()
    const filtered = searchIndex.get(searchValue) || []

    if (filtered.length === 0) {
      alert('Student not found! Please check your register number.')
      return
    }

    // Map to standardized format and sort
    const mapped = filtered.map(student => {
      const studentRegNumber = String(student['Register Number'] || student.registerNumber || '').trim()
      const slot = student['Slot'] || student.session || ''
      const dateStr = student['Date'] || student.date || ''
      
      const sessionNormalized = normalizeSession(slot)
      const docId = `${studentRegNumber}_${dateStr}_${sessionNormalized}`
      const overridenVenue = venueOverrides[docId]

      const formattedDate = convertDate(dateStr)
      let isRescheduled = false
      let finalDate = formattedDate

      if (rescheduledUpdates[formattedDate]) {
        finalDate = rescheduledUpdates[formattedDate]
        isRescheduled = true
      }
      
      let finalRoom = overridenVenue?.hall || student['Room / Hall'] || student['Updated Location'] || student['Location'] || student['Venue'] || student.roomHall || ''
      let finalSeatNo = overridenVenue?.seatNo || null

      return {
        studentName: student['Student Name'] || student.studentName || '',
        registerNumber: studentRegNumber,
        date: finalDate,
        originalDate: formattedDate,
        isRescheduled: isRescheduled,
        session: sessionNormalized,
        category: student['Category'] || student.category || '',
        subjectCode: student['Subject Code'] || student.subjectCode || '',
        subjectName: student['Subject Name'] || student.subjectName || '',
        roomHall: finalRoom,
        seatNo: finalSeatNo
      }
    })

    // Sort by date, then by session (FN before AN)
    const sorted = mapped.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0
      const dateB = b.date ? new Date(b.date).getTime() : 0

      if (dateA !== dateB) {
        return dateA - dateB
      }

      // Same date: FN comes before AN
      if (a.session === 'FN' && b.session === 'AN') return -1
      if (a.session === 'AN' && b.session === 'FN') return 1
      return 0
    })

    setStudentSchedule(sorted)
    setStudentInfo({
      name: sorted[0].studentName,
      registerNumber: sorted[0].registerNumber
    })
  }, [venueOverrides])

  const handleBack = useCallback(() => {
    setStudentSchedule(null)
    setStudentInfo(null)
    setShowCalendar(false)
  }, [])

  const handleCalendarView = useCallback(() => {
    setShowCalendar(true)
  }, [])

  const handleBackToTimetable = useCallback(() => {
    setShowCalendar(false)
  }, [])

  if (window.location.pathname === '/admin') {
    return <Admin />
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {!studentSchedule ? (
          <SearchForm onSearch={handleSearch} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        ) : showCalendar ? (
          <CalendarView
            schedule={studentSchedule}
            studentInfo={studentInfo}
            onBack={handleBackToTimetable}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        ) : (
          <Timetable
            schedule={studentSchedule}
            studentInfo={studentInfo}
            onBack={handleBack}
            onCalendarView={handleCalendarView}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        )}
      </div>
      <Analytics />
    </div>
  )
}

export default App

