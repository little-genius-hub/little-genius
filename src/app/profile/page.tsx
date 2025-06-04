"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { ApiClient } from "@/helpers/api-client";
import ChildrenManager from "@/components/ChildrenManager";
import { CheckCircle2, Info } from "lucide-react";

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
  googleId?: string;
  profilePicture?: string;
  children: Child[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Client component to handle search params
function SearchParamsHandler({ onNewUser }: { onNewUser: (isNew: boolean) => void }) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Check if the user is coming from Google OAuth registration
    const newUserParam = searchParams.get('newUser');
    if (newUserParam === 'true') {
      onNewUser(true);
    }
  }, [searchParams, onNewUser]);
  
  return null;
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const { toast } = useToast();

  useEffect(() => {    
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setIsLoading(true);
    try {
      const response = await ApiClient.getUserProfile();

      if (!response.ok) throw new Error("Failed to load profile");

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
      if (userProfile) {
        setUserProfile({ ...userProfile, children });
      }

      const response = await ApiClient.updateChildren(children);

      if (!response.ok) throw new Error("Failed to update children");

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
            <p className="text-gray-600">
              Unable to load profile. Please try again.
            </p>
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
      {/* Wrap the SearchParamsHandler in a Suspense boundary */}
      <Suspense fallback={null}>
        <SearchParamsHandler onNewUser={setIsNewUser} />
      </Suspense>
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* New User Welcome Alert */}
        {isNewUser && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-800">Welcome to Little Genius!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your account has been successfully created with Google. 
              Please take a moment to add at least one child profile to get started with personalized learning.
            </AlertDescription>
          </Alert>
        )}
        
        {/* User Info Card */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </div>
            <div className="ml-auto">
              {userProfile?.googleId && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                  <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Google Account
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex mb-6">
              <Avatar className="h-20 w-20 mr-6">
                {userProfile?.profilePicture ? (
                  <AvatarImage src={userProfile.profilePicture} alt={userProfile.name} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xl">
                    {userProfile?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{userProfile?.name}</h2>
                <p className="text-gray-500">@{userProfile?.username}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="text-lg">{userProfile?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Children
                </label>
                <p className="text-lg">
                  {userProfile?.children.length} child(ren)
                </p>
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
