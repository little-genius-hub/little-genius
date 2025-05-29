"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, User, ArrowRight } from "lucide-react"
import { useApp } from "@/store/app-context"
import { useTranslation } from "@/lib/i18n"
import type { Child } from "@/types"

export function ChildSelector() {
  const { state, dispatch } = useApp()
  const { t } = useTranslation(state.language)
  const [showAddChild, setShowAddChild] = useState(false)
  const [newChildName, setNewChildName] = useState("")
  const [newChildAge, setNewChildAge] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  
  // Demo child profiles for testing
    const demoChildProfiles: Child[] = [
    {
      id: "demo1",
      name: "Maya",
      age: 5,
      preferredLanguage: "en",
      progress: {
        numbers: { level: 2, subLevel: 3, totalScore: 250, completedLevels: [] },
        letters: { level: 1, subLevel: 5, totalScore: 150, completedLevels: [] },
        stories: { readStories: ["story1", "story2"], favoriteStories: ["story1"] }
      },
      achievements: [],
      createdAt: new Date(),
    },
    {
      id: "demo2",
      name: "Budi",
      age: 7, 
      preferredLanguage: "id",
      progress: {
        numbers: { level: 3, subLevel: 1, totalScore: 320, completedLevels: [] },
        letters: { level: 2, subLevel: 4, totalScore: 280, completedLevels: [] },
        stories: { readStories: ["story1", "story3", "story4"], favoriteStories: ["story3"] }
      },
      achievements: [],
      createdAt: new Date(),
    }
  ]

  const handleSelectChild = (child: Child) => {
    dispatch({ type: "SET_CURRENT_CHILD", payload: child })
  }

  const handleCreateChild = async () => {
    if (!newChildName.trim() || !newChildAge) return

    setIsCreating(true)
    try {
      const response = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newChildName.trim(),
          age: Number.parseInt(newChildAge),
          preferredLanguage: state.language,
        }),
      })

      if (response.ok) {
        const newChild = await response.json()
        // Update user with new child
        const updatedUser = {
          ...state.user!,
          children: [...(state.user!.children || []), newChild],
        }
        dispatch({ type: "SET_USER", payload: updatedUser })
        dispatch({ type: "SET_CURRENT_CHILD", payload: newChild })
      } else {
        console.error("Failed to create child profile")
      }
    } catch (error) {
      console.error("Create child failed:", error)
    } finally {
      setIsCreating(false)
    }
  }

  // Select a demo child profile
  const handleSelectDemoChild = (child: Child) => {
    dispatch({ type: "SET_CURRENT_CHILD", payload: child })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {showAddChild
                ? state.language === "en"
                  ? "Add a Child Profile"
                  : "Tambahkan Profil Anak"
                : state.language === "en"
                ? "Choose a Child Profile"
                : "Pilih Profil Anak"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showAddChild ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="name">{state.language === "en" ? "Child's Name" : "Nama Anak"}</Label>
                  <Input
                    id="name"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    placeholder={
                      state.language === "en" ? "Enter name..." : "Masukkan nama..."
                    }
                    className="bg-white/70"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="age">{state.language === "en" ? "Child's Age" : "Usia Anak"}</Label>
                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="12"
                    value={newChildAge}
                    onChange={(e) => setNewChildAge(e.target.value)}
                    placeholder={state.language === "en" ? "2-10 years" : "2-10 tahun"}
                    className="bg-white/70"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddChild(false)}
                    className="flex-1"
                  >
                    {state.language === "en" ? "Cancel" : "Batal"}
                  </Button>
                  <Button
                    onClick={handleCreateChild}
                    disabled={isCreating || !newChildName.trim() || !newChildAge}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {isCreating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>{state.language === "en" ? "Creating..." : "Membuat..."}</span>
                      </div>
                    ) : (
                      <span>{state.language === "en" ? "Create Profile" : "Buat Profil"}</span>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3">
                  {state.user?.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => handleSelectChild(child)}
                      className="w-full bg-gradient-to-r from-white/60 to-white/80 hover:from-white/80 hover:to-white p-3 rounded-lg flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="border-2 border-indigo-500 animate-float">
                          {child.avatar ? (
                            <AvatarImage src={child.avatar} alt={child.name} />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                              {child.name[0]}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{child.name}</p>
                          <p className="text-xs text-gray-500">
                            {state.language === "en" ? `Age ${child.age}` : `Usia ${child.age}`}
                            {child.preferredLanguage === "en" ? " • English" : " • Bahasa"}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>

                {state.user?.children.length === 0 && (
                  <div className="text-center py-8">
                    <User className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">
                      {state.language === "en"
                        ? "No child profiles yet"
                        : "Belum ada profil anak"}
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => setShowAddChild(true)}
                  variant="outline"
                  className="w-full flex gap-2 items-center justify-center border-dashed border-gray-300"
                >
                  <Plus className="h-4 w-4" />
                  {state.language === "en" ? "Add New Child" : "Tambah Anak Baru"}
                </Button>

                {demoChildProfiles.length > 0 && (
                  <>
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-2 text-gray-500">
                          {state.language === "en" ? "Demo Profiles" : "Profil Demo"}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {demoChildProfiles.map((profile) => (
                        <button
                          key={profile.id}
                          onClick={() => handleSelectDemoChild(profile)}
                          className="w-full bg-gradient-to-r from-white/60 to-white/80 hover:from-white/80 hover:to-white p-3 rounded-lg flex items-center justify-between group transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="border-2 border-purple-500">
                              {profile.avatar ? (
                                <AvatarImage src={profile.avatar} alt={profile.name} />
                              ) : (
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                  {profile.name[0]}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="text-left">
                              <p className="font-medium text-gray-900">{profile.name}</p>
                              <p className="text-xs text-gray-500">
                                {state.language === "en" ? `Age ${profile.age}` : `Usia ${profile.age}`}
                                {" • "}
                                <span className="text-purple-500">{state.language === "en" ? "Demo" : "Demo"}</span>
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
