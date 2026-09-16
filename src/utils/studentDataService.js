// Singleton cache for the parsed and indexed dataset
let datasetPromise = null
let cachedSearchIndex = null

/**
 * Asynchronously loads and indexes the 22k+ student dataset.
 * Using dynamic import keeps the primary JS bundle tiny and prevents main-thread
 * blocking / GC pauses during initial render and user typing.
 */
export const getStudentsSearchIndex = async () => {
  if (cachedSearchIndex) return cachedSearchIndex

  if (!datasetPromise) {
    datasetPromise = import('../data/students_combined.json')
      .then((module) => {
        const data = module.default || module
        const index = new Map()

        for (let i = 0; i < data.length; i++) {
          const student = data[i]
          const reg = student['Register Number'] || student.registerNumber
          if (reg !== undefined && reg !== null) {
            const regStr = String(reg).trim().toLowerCase()
            if (regStr) {
              if (!index.has(regStr)) {
                index.set(regStr, [])
              }
              index.get(regStr).push(student)
            }
          }

          const ref = student['Reference Number'] || student.referenceNumber
          if (ref !== undefined && ref !== null) {
            const refStr = String(ref).trim().toLowerCase()
            if (refStr && (!reg || String(reg).trim().toLowerCase() !== refStr)) {
              if (!index.has(refStr)) {
                index.set(refStr, [])
              }
              index.get(refStr).push(student)
            }
          }
        }

        cachedSearchIndex = index
        return cachedSearchIndex
      })
      .catch((err) => {
        console.error('Failed to load students dataset:', err)
        datasetPromise = null
        throw err
      })
  }

  return datasetPromise
}

// Prefetch dataset during idle time after landing page has fully rendered
export const prefetchStudentsDataset = () => {
  if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        getStudentsSearchIndex()
      }, { timeout: 3000 })
    } else {
      setTimeout(() => {
        getStudentsSearchIndex()
      }, 1000)
    }
  }
}

// Start prefetch after initial paint
if (typeof window !== 'undefined') {
  if (document.readyState === 'complete') {
    prefetchStudentsDataset()
  } else {
    window.addEventListener('load', () => {
      prefetchStudentsDataset()
    }, { once: true })
  }
}
