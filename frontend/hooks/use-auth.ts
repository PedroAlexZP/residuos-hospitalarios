"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import type { User } from "@/lib/auth"

export function useAuth() {
  const { supabase, user: authUser, loading: authLoading } = useSupabase()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!authUser) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const { data: profile, error } = await supabase.from("users").select("*").eq("id", authUser.id).single()

        if (error) {
          console.error("Error fetching user profile:", error)
          setUser(null)
        } else {
          setUser(profile)
        }
      } catch (error) {
        console.error("Error loading user profile:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      loadUserProfile()
    }
  }, [authUser, authLoading, supabase])

  return {
    user,
    loading: authLoading || loading,
    signOut: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
  }
}
