interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map()
  private maxAttempts: number
  private windowMs: number

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs

    // Clean up expired entries every 5 minutes
    setInterval(
      () => {
        this.cleanup()
      },
      5 * 60 * 1000
    )
  }

  /**
   * Check if an IP/identifier is rate limited
   */
  isRateLimited(identifier: string): boolean {
    const now = Date.now()
    const entry = this.attempts.get(identifier)

    if (!entry) {
      return false
    }

    // Check if window has expired
    if (now > entry.resetTime) {
      this.attempts.delete(identifier)
      return false
    }

    return entry.count >= this.maxAttempts
  }

  /**
   * Record an attempt for an identifier
   */
  recordAttempt(identifier: string): boolean {
    const now = Date.now()
    const entry = this.attempts.get(identifier)

    if (!entry || now > entry.resetTime) {
      // New entry or expired window
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      })
      return true
    }

    // Increment existing entry
    entry.count += 1
    this.attempts.set(identifier, entry)

    return entry.count <= this.maxAttempts
  }

  /**
   * Get remaining attempts for an identifier
   */
  getRemainingAttempts(identifier: string): number {
    const entry = this.attempts.get(identifier)

    if (!entry || Date.now() > entry.resetTime) {
      return this.maxAttempts
    }

    return Math.max(0, this.maxAttempts - entry.count)
  }

  /**
   * Get time until reset for an identifier
   */
  getTimeUntilReset(identifier: string): number {
    const entry = this.attempts.get(identifier)

    if (!entry) {
      return 0
    }

    return Math.max(0, entry.resetTime - Date.now())
  }

  /**
   * Clear attempts for an identifier (useful after successful action)
   */
  clearAttempts(identifier: string): void {
    this.attempts.delete(identifier)
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()

    for (const [identifier, entry] of this.attempts.entries()) {
      if (now > entry.resetTime) {
        this.attempts.delete(identifier)
      }
    }
  }

  /**
   * Get current stats (for monitoring)
   */
  getStats(): {
    totalIdentifiers: number
    activeRateLimits: number
  } {
    const now = Date.now()
    let activeRateLimits = 0

    for (const entry of this.attempts.values()) {
      if (now <= entry.resetTime && entry.count >= this.maxAttempts) {
        activeRateLimits++
      }
    }

    return {
      totalIdentifiers: this.attempts.size,
      activeRateLimits,
    }
  }
}

// Create singleton instances for different operations
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000) // 5 attempts per 15 minutes
export const passwordResetRateLimiter = new RateLimiter(3, 60 * 60 * 1000) // 3 attempts per hour
export const uploadRateLimiter = new RateLimiter(10, 60 * 1000) // 10 uploads per minute

/**
 * Get user identifier for rate limiting (IP-based for client-side)
 */
export function getUserIdentifier(): string {
  // In a real application, you might use IP address from headers
  // For client-side, we'll use a combination of user agent and timestamp-based session
  if (typeof window !== 'undefined') {
    let sessionId = localStorage.getItem('rate-limit-session')
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('rate-limit-session', sessionId)
    }
    return sessionId
  }

  return 'unknown-session'
}

/**
 * Format time remaining for user display
 */
export function formatTimeRemaining(ms: number): string {
  const minutes = Math.ceil(ms / (1000 * 60))

  if (minutes < 1) {
    return 'menos de 1 minuto'
  } else if (minutes === 1) {
    return '1 minuto'
  } else if (minutes < 60) {
    return `${minutes} minutos`
  } else {
    const hours = Math.ceil(minutes / 60)
    return hours === 1 ? '1 hora' : `${hours} horas`
  }
}
