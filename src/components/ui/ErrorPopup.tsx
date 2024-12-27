import { useEffect, useState } from 'react'

interface ErrorPopupProps {
  message: string
  duration?: number
  onClose: () => void
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({ message, duration = 2000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show the popup when there is an error
    setIsVisible(true)

    const fadeOutTimer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 500) // Close the popup after fading out (500ms delay)
    }, duration)

    return () => clearTimeout(fadeOutTimer)
  }, [duration, onClose])

  return (
    <div
      className={`fixed right-0 transform transition-all duration-300 ease-in-out p-4 bg-red-500 text-white rounded-l-md shadow-lg
        ${isVisible ? '-translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      {message}
    </div>
  )
}

export default ErrorPopup
