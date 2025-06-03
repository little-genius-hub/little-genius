"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/store/app-context"
import { ClientCookies } from "@/helpers/cookies"
import { LoadingScreen } from "@/components/common/loading-screen"
import { ChildSelector } from "@/components/home/child-selector"
import { MainMenu } from "@/components/home/main-menu"

export default function HomePage() {
  const { state, dispatch } = useApp()
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
  useEffect(() => { 
    if (state.user && !state.isLoading) {
      const shouldResetChild = !ClientCookies.getCurrentChildId()
      if (shouldResetChild && state.currentChild) {
        dispatch({ type: "SET_CURRENT_CHILD", payload: null })
      }
    }
  }, [state.user, state.isLoading])

  if (state.isLoading) {
    return <LoadingScreen />
  }
  if (!state.user) {
    return <LoadingScreen />
  }
  
  const userChildren = state.user.children || []

  if (!state.currentChild) {
    return <ChildSelector />
  }

  return <MainMenu />
}
