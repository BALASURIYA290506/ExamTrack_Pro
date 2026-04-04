import { useState, useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import SearchForm from './components/SearchForm'
import Timetable from './components/Timetable'
import CalendarView from './components/CalendarView'
import studentsPracticalData from './data/students_practical.json'
import studentsTheoryData from './data/students_theory.json'
import { rescheduledUpdates } from './data/rescheduled'
import Admin from './pages/Admin'
import { db } from './firebase'
import { collection, getDocs } from 'firebase/firestore'

const studentsData = [...studentsPracticalData, ...studentsTheoryData]

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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const handleSearch = (registerNumber) => {

    // Convert date from DD.MM.YYYY to YYYY-MM-DD
    const convertDate = (dateStr) => {
      if (!dateStr) return null
      // Handle DD.MM.YYYY format
      const parts = dateStr.split('.')
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
      }
      return dateStr
    }

    // Normalize session: "F.N." -> "FN", "A.N." -> "AN"
    const normalizeSession = (slot) => {
      if (!slot) return ''
      const upper = slot.toUpperCase().replace(/\./g, '').trim()
      if (upper === 'FN' || upper === 'F N') return 'FN'
      if (upper === 'AN' || upper === 'A N') return 'AN'
      return upper
    }

    // Filter students matching register number OR reference number
    const searchValue = registerNumber.trim().toString()

    const filtered = studentsData.filter(student => {
      const regNumber = student['Register Number'] || student.registerNumber || ''
      const refNumber = student['Reference Number'] || ''
      const studentRegNumber = regNumber.toString().trim()
      const studentRefNumber = refNumber.toString().trim()

      // Match by either Register Number or Reference Number
      return studentRegNumber === searchValue || studentRefNumber === searchValue
    })

    if (filtered.length === 0) {
      alert('Student not found! Please check your register number.')
      return
    }

    // Map to standardized format and sort
    const mapped = filtered.map(student => {
      const studentRegNumber = (student['Register Number'] || student.registerNumber).toString()
      const slot = student['Slot'] || student.session || ''
      const dateStr = student['Date'] || student.date || ''
      
      const normalizedSession = normalizeSession(slot)
      const docId = `${studentRegNumber}_${dateStr}_${normalizedSession}`
      const overridenVenue = venueOverrides[docId];

      const formattedDate = convertDate(dateStr)
      let isRescheduled = false
      let finalDate = formattedDate

      if (rescheduledUpdates[formattedDate]) {
        finalDate = rescheduledUpdates[formattedDate]
        isRescheduled = true
      }
      
      let finalRoom = overridenVenue?.hall || student['Updated Location'] || student['Location'] || student['Venue'] || student.roomHall || student['Room / Hall'] || '';
      let finalSeatNo = overridenVenue?.seatNo || null;

      return {
        studentName: student['Student Name'] || student.studentName,
        registerNumber: studentRegNumber,
        date: finalDate,
        originalDate: formattedDate,
        isRescheduled: isRescheduled,
        session: normalizedSession,
        category: student['Category'] || student.category || '',
        subjectCode: student['Subject Code'] || student.subjectCode || '',
        subjectName: student['Subject Name'] || student.subjectName || '',
        roomHall: finalRoom,
        seatNo: finalSeatNo
      }
    })

    // Sort by date, then by session (FN before AN)
    const sorted = mapped.sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0)
      const dateB = b.date ? new Date(b.date) : new Date(0)

      if (dateA.getTime() !== dateB.getTime()) {
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
  }

  const handleBack = () => {
    setStudentSchedule(null)
    setStudentInfo(null)
    setShowCalendar(false)
  }

  const handleCalendarView = () => {
    setShowCalendar(true)
  }

  const handleBackToTimetable = () => {
    setShowCalendar(false)
  }

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

