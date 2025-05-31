"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ClientCookies } from "@/helpers/cookies";
import { ApiClient } from "@/helpers/api-client";
import ChildrenManager from "@/components/ChildrenManager";

interface Child {
  id?: string;
  name: string;
  age: number;
  grade: string;
  birthDate?: string;
}

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  children: Child[];
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load user profile on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setIsLoading(true);    try {
      // Implement your API call to get user profile
      const response = await ApiClient.getUserProfile();

      if (!response.ok) throw new Error('Failed to load profile');

      const profile = await response.json();
      setUserProfile(profile);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load user profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateChildren = async (children: Child[]) => {
    setIsLoading(true);
    try {
      // Update local state immediately for better UX
      if (userProfile) {
        setUserProfile({ ...userProfile, children });
      }      // Send update to server
      const response = await ApiClient.updateChildren(children);

      if (!response.ok) throw new Error('Failed to update children');

      toast({
        title: "Success!",
        description: "Children profiles updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update children profiles",
      });
      // Reload profile to reset local state if update failed
      loadUserProfile();
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">Unable to load profile. Please try again.</p>
            <Button onClick={loadUserProfile} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-lg">{userProfile.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Username</label>
                <p className="text-lg">{userProfile.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg">{userProfile.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Children</label>
                <p className="text-lg">{userProfile.children.length} child(ren)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Children Manager */}
        <ChildrenManager
          children={userProfile.children}
          onUpdate={handleUpdateChildren}
        />
      </div>
    </div>
  );
}
