import { useEffect, useState } from 'react'

export function useReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const calculateProgress = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY || document.documentElement.scrollTop

      const totalHeight = documentHeight - windowHeight
      const currentProgress = (scrollTop / totalHeight) * 100

      setProgress(Math.min(Math.max(currentProgress, 0), 100))
    }

    // Calculate on mount
    calculateProgress()

    // Update on scroll
    window.addEventListener('scroll', calculateProgress)
    window.addEventListener('resize', calculateProgress)

    return () => {
      window.removeEventListener('scroll', calculateProgress)
      window.removeEventListener('resize', calculateProgress)
    }
  }, [])

  return progress
}
