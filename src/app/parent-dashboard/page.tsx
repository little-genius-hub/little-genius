"use client";

import { useContext, useEffect, useState } from "react";
import {
  Bell,
  Clock,
  Settings,
  Star,
  TrendingUp,
  Trophy,
  User,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiClient } from "@/helpers/api-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/store/app-context";
import { LoadingScreen } from "@/components/common/loading-screen";

interface Child {
  id: string;
  name: string;
  age: number;
  grade: string;
  birthDate?: string;
  preferredLanguage?: "en" | "id";
  achievements: any[];
  progress?: {
    numbers: {
      level: number;
      subLevel: number;
      totalScore: number;
      completedLevels: any[];
    };
    letters: {
      level: number;
      subLevel: number;
      totalScore: number;
      completedLevels: any[];
    };
    stories: {
      readStories: any[];
      favoriteStories: any[];
    };
  };
}

interface ProgressData {
  childId: string;
  completedAt: string;
  gameType: string;
  level: number;
  mistakes: number;
  score: number;
  timeSpent: number;
  _id: string;
}

interface SkillAnalysis {
  subject: string;
  status: "Need Improvement" | "Improving" | "Great";
  recommendedGames: string[];
}

interface DashboardData {
  analysis: SkillAnalysis[];
  overallSummary: string;
}

const recentActivities = [
  {
    id: 1,
    childName: "Emma",
    game: "Math Adventure",
    score: 95,
    duration: "15 min",
    timestamp: "2 hours ago",
    skillsImproved: ["Addition", "Problem Solving"],
  },
  {
    id: 2,
    childName: "Liam",
    game: "Letter Hunt",
    score: 88,
    duration: "12 min",
    timestamp: "4 hours ago",
    skillsImproved: ["Reading", "Recognition"],
  },
  {
    id: 3,
    childName: "Emma",
    game: "Shape Sorter",
    score: 92,
    duration: "10 min",
    timestamp: "1 day ago",
    skillsImproved: ["Geometry", "Logic"],
  },
];

// Removed unused skillProgress variable because it was never read and caused type errors.

const formatTimePlayed = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export default function ParentDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const { state } = useApp();
  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [recentActivity, setRecentActivity] = useState<ProgressData[]>([]);

  useEffect(() => {
    // console.log(selectedChild, "<<<<< selected child")
    const fetchData = async () => {
      // const { childId } = await params
      try {
        // const progressData = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/parent-dashboard/${childId}`)
        // let res = await progressData.json()
        // setProgress(res)
        // console.log(progress)
        const response = await ApiClient.getChildren();
        if (!response.ok) {
          throw new Error("Failed to fetch children data");
        }
        const data = await response.json();
        // console.log(data.children, "<<<<<< data children")

        setChildren(data.children);
        if (data.children.length > 0) {
          setSelectedChild(data.children[0]);
          // Fetch dashboard data for the first child
          await fetchDashboardData(data.children[0].id);
          // console.log(data.children[0], "<<<<< selected child")
        }
      } catch (err) {
        // console.log(err, "<<<<<")
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add function to fetch dashboard data
  const fetchDashboardData = async (childId: string) => {
    // console.log(childId, "<<<<<")
    // console.log(state.language, "state disini")
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/parent-dashboard/${childId}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const data = await res.json();
      // console.log(data, "<<<<< datanya disini")
      setDashboardData(data);

      const responseProgress = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/progress?childId=${childId}`
      );
      if (!responseProgress.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const progressData = await responseProgress.json();
      setProgress(progressData[0]);
      setTimeSpent(progressData[1]);

      const activity = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/progress?childId=${childId}&recentActivity=true`
      );
      if (!activity.ok) {
        throw new Error("Failed to fetch recent activity");
      }
      const recentActivityData = await activity.json();
      setRecentActivity(recentActivityData);
    } catch (err) {
      console.error("Error fetching dashboard data: ", err);
    }
  };

  async function refreshProgress(childId: string) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/parent-dashboard/${childId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: state.language,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/progress?recentActivity=true`)
    } catch (error) {
      console.log(error, "<<<<< error");
    }
  }

  // Update child selector to fetch new dashboard data when child changes
  const handleChildChange = async (value: string) => {
    const child = children.find((c) => c.id === value);
    if (child) {
      setSelectedChild(child);
      await refreshProgress(child.id);
      await fetchDashboardData(child.id);
    }
  };

  if (loading) {
    return (
      <LoadingScreen/>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (!selectedChild) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No children found. Please add a child first.
      </div>
    );
  }

  // Calculate stats
  const totalPlayTime = selectedChild.progress
    ? Object.values(selectedChild.progress).reduce((acc, curr) => {
        if ("completedLevels" in curr) {
          return acc + curr.completedLevels.length * 15; // Assuming average 15 minutes per level
        }
        return acc;
      }, 0)
    : 0;

  const currentLevel = selectedChild.progress
    ? Math.max(
        selectedChild.progress.numbers.level,
        selectedChild.progress.letters.level
      )
    : 1;

  console.log(progress, "<<<<< progress data");
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  Little Genius Parent Dashboard
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src="/placeholder.svg?height=32&width=32"
                        alt="Parent"
                      />
                      <AvatarFallback>P</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Parent Account
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        parent@example.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Child Selector */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Dashboard Overview
            </h2>
            <Select value={selectedChild.id} onValueChange={handleChildChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select child" />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/placeholder.svg" alt={child.name} />
                        <AvatarFallback>{child.name[0]}</AvatarFallback>
                      </Avatar>
                      <span>
                        {child.name} (Grade {child.grade})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Play Time
              </CardTitle>
              <Clock className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatTimePlayed(Math.floor(timeSpent / 60))}
              </div>
              <p className="text-xs opacity-80">Total Play Time</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Games Completed
              </CardTitle>
              <Trophy className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progress.length}</div>
              <p className="text-xs opacity-80">Total games completed</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Achievements
              </CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedChild.achievements.length}
              </div>
              <p className="text-xs opacity-80">Total achievements</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Level
              </CardTitle>
              <Star className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Level {currentLevel}</div>
              <p className="text-xs opacity-80">Keep learning!</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skill Progress */}
              <Card className="bg-white shadow-lg rounded-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Skill Development
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    {selectedChild.name}'s learning progress analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Show skill progress bars */}

                  {/* Skill analysis section */}
                  {dashboardData?.analysis &&
                    dashboardData.analysis.length > 0 && (
                      <div className="mt-8">
                        <h4 className="text-base font-semibold text-purple-900 mb-3">
                          Skill Analysis
                        </h4>
                        <div className="space-y-4">
                          {dashboardData.analysis.map((skill) => (
                            <div
                              key={skill.subject}
                              className="p-3 rounded-lg border flex flex-col bg-purple-50"
                            >
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                              <div>
                                <span className="font-medium text-gray-800">
                                {skill.subject}
                                </span>
                                <span
                                className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${
                                  skill.status === "Great"
                                  ? "bg-green-100 text-green-700"
                                  : skill.status === "Improving"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                                }`}
                                >
                                {skill.status}
                                </span>
                              </div>
                              </div>
                              {skill.recommendedGames && skill.recommendedGames.length > 0 && (
                              <div className="mt-2">
                                <div className="text-sm font-semibold text-purple-700 mb-1">
                                Recommended Game{skill.recommendedGames.length > 1 ? "s" : ""}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                {skill.recommendedGames.map((game) => (
                                  <Badge
                                  key={game}
                                  variant="outline"
                                  className="bg-white border-purple-300 text-purple-700"
                                  >
                                  {game}
                                  </Badge>
                                ))}
                                </div>
                              </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Overall summary */}
                  {dashboardData?.overallSummary && (
                    <div className="mt-8 p-4 bg-purple-100 rounded-lg">
                      <h4 className="text-sm font-semibold text-purple-900 mb-2">
                        Overall Progress
                      </h4>
                      <p className="text-sm text-purple-800">
                        {dashboardData.overallSummary}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Progress Chart Per Game */}
              <Card>
                <CardHeader>
                  <CardTitle>Games played</CardTitle>
                  <CardDescription>
                    Games played and time spent each game
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {progress[0] ? (
                    <div className="space-y-6">
                      {progress.map((item) => (
                        <div key={item._id} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-800">
                              {item.gameType}
                            </span>
                            <span className="text-xs text-gray-500">
                              Level {item.level} • {formatTimePlayed(Math.floor(item.timeSpent / 60))}
                            </span>
                          </div>
                          <Progress value={item.score} className="h-3 bg-purple-100" />
                          <div className="text-xs text-right text-purple-700 font-semibold">
                            {item.score}%
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No activities this week.
                    </div>
                  )}
                  <div>
                    <Button
                      variant="outline"
                      className="mt-4 bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200 transition"
                      onClick={() => {
                        refreshProgress(selectedChild.id);
                        window.location.reload();
                      }}
                    >
                      Refresh
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest games and activities completed by your children
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity._id}
                      className="flex items-center space-x-4 p-4 border rounded-lg"
                    >
                      <Avatar>
                        <AvatarImage
                          src="/placeholder.svg?height=40&width=40"
                          alt={selectedChild?.name}
                        />
                        <AvatarFallback>{selectedChild?.name}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {selectedChild?.name}
                          </span>
                          <span className="text-muted-foreground">played</span>
                          <span className="font-medium text-purple-600">
                            {activity.gameType}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Score: {activity.score}%</span>
                          <span>Duration: {activity.timeSpent}</span>
                          <span>{new Date(activity.completedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
                <CardDescription>
                  Badges and milestones earned by your children
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedChild.achievements?.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="p-4 border rounded-lg text-center space-y-2"
                    >
                      <div className="text-4xl">{achievement.icon}</div>
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Earned by {achievement.earnedBy} •{" "}
                        {achievement.earnedDate}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Parental Controls</CardTitle>
                  <CardDescription>
                    Manage your child's gaming experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Daily Time Limit</div>
                      <div className="text-sm text-muted-foreground">
                        Maximum play time per day
                      </div>
                    </div>
                    <Select defaultValue="60">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Difficulty Level</div>
                      <div className="text-sm text-muted-foreground">
                        Adjust game difficulty
                      </div>
                    </div>
                    <Select defaultValue="auto">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                        <SelectItem value="auto">Auto-adjust</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Stay updated on your child's progress
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Daily Progress Reports</div>
                      <div className="text-sm text-muted-foreground">
                        Get daily summaries via email
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Achievement Alerts</div>
                      <div className="text-sm text-muted-foreground">
                        Notify when badges are earned
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Weekly Reports</div>
                      <div className="text-sm text-muted-foreground">
                        Comprehensive weekly analysis
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
