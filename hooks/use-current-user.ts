import { useState, useEffect } from 'react'
import { getCurrentUser, type User } from '@/lib/auth'

export function useCurrentUser(forceRefresh: boolean = false) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchUser = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const userData = await getCurrentUser(forceRefresh)
        
        if (mounted) {
          setUser(userData)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Error loading user')
          setUser(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchUser()

    return () => {
      mounted = false
    }
  }, [forceRefresh])

  const refetch = () => {
    setLoading(true)
    getCurrentUser(true).then(setUser).catch((err) => {
      setError(err instanceof Error ? err.message : 'Error loading user')
      setUser(null)
    }).finally(() => setLoading(false))
  }

  return { user, loading, error, refetch }
}
