'use client'

import { useEffect, useState } from 'react'

const AGE_VERIFICATION_KEY = 'guest_age_verified'

export function useGuestAgeVerification() {
  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(AGE_VERIFICATION_KEY)
    const verified = stored === 'true'

    setIsVerified(verified)

    // Show alert if not verified
    if (!verified) {
      setShowAlert(true)
    }
  }, [])

  const confirmAge = () => {
    localStorage.setItem(AGE_VERIFICATION_KEY, 'true')
    setIsVerified(true)
    setShowAlert(false)
  }

  const denyAge = () => {
    localStorage.setItem(AGE_VERIFICATION_KEY, 'false')
    setIsVerified(false)
    setShowAlert(false)
  }

  const resetVerification = () => {
    localStorage.removeItem(AGE_VERIFICATION_KEY)
    setIsVerified(null)
    setShowAlert(true)
  }

  return {
    isVerified,
    showAlert,
    confirmAge,
    denyAge,
    resetVerification,
    isLoading: isVerified === null,
  }
}
