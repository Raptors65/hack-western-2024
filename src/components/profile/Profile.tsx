"use client";

import { Card } from "@/components/ui/card";
import { Clock, Trophy, Calendar, TrendingUp } from "lucide-react";
import HomeButton from "../ui/HomeButton";
import { Bar, BarChart, CartesianGrid, Legend, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Placeholder data - would normally come from a backend
const data = [
  {
    day: 'Sun',
    Time: 0.5,
    Score: 120023,
    amt: 2400,
  },
  {
    day: 'Mon',
    Time: 2,
    Score: 360120,
    amt: 2210,
  },
  {
    day: 'Tues',
    Time: 1,
    Score: 252345,
    amt: 2290,
  },
  {
    day: 'Wed',
    Time: 0.7,
    Score: 200000,
    amt: 2000,
  },
  {
    day: 'Thurs',
    Time: 1.9,
    Score: 500000,
    amt: 2181,
  },
  {
    day: 'Fri',
    Time: 1.4,
    Score: 340000,
    amt: 2500,
  },
  {
    day: 'Sat',
    Time: 2.5,
    Score: 432000,
    amt: 2100,
  },
];

const Profile = () => {
  // Placeholder data - would normally come from a backend
  const stats = {
    totalTime: "12h 30m",
    highScore: 500000,
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
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold">{stats.totalTime}</p>
              </div>
            </div>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart width={150} height={40} data={data}>
                  <XAxis dataKey="day" />
                  <Tooltip content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border p-2">
                          <p>{label}</p>
                          <p className="text-blue-500">{`${payload[0].name}: ${payload[0].value} h`}</p>
                        </div>
                      );
                    }

                    return null;
                  }} />
                  {/* <YAxis /> */}
                  <Bar dataKey="Time" fill="#3b82f6" animationDuration={800} animationBegin={0} activeBar={<Rectangle fill="#3b82f6" stroke="black" />} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* High Score */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">High Score</p>
                <p className="text-2xl font-bold">{stats.highScore.toLocaleString()}</p>
              </div>
            </div>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart width={150} height={40} data={data}>
                  <XAxis dataKey="day" />
                  <Tooltip content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border p-2">
                          <p>{label}</p>
                          <p className="text-green-500">{`${payload[0].name}: ${payload[0].value.toLocaleString()}`}</p>
                        </div>
                      );
                    }

                    return null;
                  }} />
                  {/* <YAxis /> */}
                  <Bar dataKey="Score" fill="#22c55e" animationDuration={800} animationBegin={0} activeBar={<Rectangle fill="#22c55e" stroke="black" />} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Current Streak */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{stats.streak} days</p>
                {/* <div className="w-full h-48 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart width={150} height={40} data={data}>
                      <Bar dataKey="uv" fill="#f97316" />
                      <XAxis dataKey="day" />
                      <YAxis />
                    </BarChart>
                  </ResponsiveContainer>
                </div> */}
              </div>
            </div>
          </Card>

          {/* Last Session */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Last Session</p>
                <p className="text-2xl font-bold">{stats.lastSession}</p>
                {/* <div className="w-full h-48 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart width={150} height={40} data={data}>
                      <Bar dataKey="uv" fill="#a855f7" />
                      <XAxis dataKey="day" />
                    </BarChart>
                  </ResponsiveContainer>
                </div> */}
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
