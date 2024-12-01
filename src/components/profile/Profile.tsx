import { Card } from "@/components/ui/card";
import { Clock, Trophy, Calendar, TrendingUp } from "lucide-react";
import HomeButton from "../ui/HomeButton";

const Profile = () => {
  // Placeholder data - would normally come from a backend
  const stats = {
    totalTime: "12h 30m",
    highScore: 2500,
    streak: 5,
    lastSession: "2h 15m",
  };

  return (
    <div className="w-screen h-screen bg-background p-8 overflow-auto">
      {/* Home Button */}
      <HomeButton />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Your Profile</h1>
            <p className="text-muted-foreground">
              Track your progress and achievements
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Time */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold">{stats.totalTime}</p>
              </div>
            </div>
          </Card>

          {/* High Score */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Score</p>
                <p className="text-2xl font-bold">{stats.highScore}</p>
              </div>
            </div>
          </Card>

          {/* Current Streak */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{stats.streak} days</p>
              </div>
            </div>
          </Card>

          {/* Last Session */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Session</p>
                <p className="text-2xl font-bold">{stats.lastSession}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity - Placeholder */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="text-muted-foreground text-center py-8">
            Activity history coming soon...
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
