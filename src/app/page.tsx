"use client"

import { useEffect } from "react"
import { useApp } from "@/store/app-context"
import { LoadingScreen } from "@/components/common/loading-screen"
import { WelcomeScreen } from "@/components/home/welcome-screen"
import { ChildSelector } from "@/components/home/child-selector"
import { MainMenu } from "@/components/home/main-menu"

export default function HomePage() {
  const { state } = useApp()

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

  if (state.isLoading) {
    return <LoadingScreen />
  }
  if (!state.user) {
    return <WelcomeScreen />
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
