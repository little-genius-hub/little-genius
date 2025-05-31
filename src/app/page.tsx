"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/store/app-context"
import { LoadingScreen } from "@/components/common/loading-screen"
import { ChildSelector } from "@/components/home/child-selector"
import { MainMenu } from "@/components/home/main-menu"

export default function HomePage() {
  const { state } = useApp()
  const router = useRouter()

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration)
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError)
        })
    }
  }, [])

  useEffect(() => {
    if (!state.isLoading && !state.user) {
      router.replace("/login")
    }
  }, [state.isLoading, state.user, router])

  if (state.isLoading) {
    return <LoadingScreen />
  }
  if (!state.user) {
    return <LoadingScreen />
  }

  const userChildren = state.user.children || []

  if (!state.currentChild && userChildren.length > 0) {
    return <ChildSelector />
  }

  if (!state.currentChild && userChildren.length === 0) {
    return <ChildSelector />
  }

  return <MainMenu />
}
