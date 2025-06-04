import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, BookOpen, MessageCircle, Target, Clock, CheckCircle } from "lucide-react";

interface ProgressData {
  overall: number;
  grammar: number;
  vocabulary: number;
  conversation: number;
  exercisesCompleted: number;
  totalExercises: number;
  timeSpent: number; // in minutes
  streak: number; // consecutive days
}

interface Activity {
  id: string;
  type: 'grammar' | 'vocabulary' | 'conversation' | 'exercise';
  description: string;
  timestamp: Date;
  score?: number;
}

interface ProgressTrackerProps {
  progress: ProgressData;
  recentActivities: Activity[];
}

export function ProgressTracker({ progress, recentActivities }: ProgressTrackerProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'grammar':
        return <BookOpen className="h-4 w-4 text-blue-600" />;
      case 'vocabulary':
        return <Target className="h-4 w-4 text-emerald-600" />;
      case 'conversation':
        return <MessageCircle className="h-4 w-4 text-amber-600" />;
      case 'exercise':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Trophy className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  return (
    <section id="progress" className="mb-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Learning Progress</h3>
      
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Overall Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="transform -rotate-90 w-24 h-24">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress.overall / 100)}`}
                    className="text-blue-600"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">{progress.overall}%</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm">Module 1 Completion</p>
            </div>
          </CardContent>
        </Card>

        {/* Skills Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Skills Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Grammar</span>
                <span className="text-blue-600 font-medium">{progress.grammar}%</span>
              </div>
              <Progress value={progress.grammar} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Vocabulary</span>
                <span className="text-emerald-600 font-medium">{progress.vocabulary}%</span>
              </div>
              <Progress value={progress.vocabulary} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Conversation</span>
                <span className="text-amber-600 font-medium">{progress.conversation}%</span>
              </div>
              <Progress value={progress.conversation} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-green-600" />
              Learning Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Exercises Completed</span>
              <Badge variant="outline" className="text-green-600">
                {progress.exercisesCompleted}/{progress.totalExercises}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Time Spent</span>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-blue-600 font-medium">{progress.timeSpent}m</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Study Streak</span>
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4 text-yellow-600" />
                <span className="text-yellow-600 font-medium">{progress.streak} days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent activities. Start learning to see your progress!</p>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-medium">{activity.description}</p>
                    <p className="text-gray-500 text-sm">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                  {activity.score && (
                    <Badge 
                      variant="outline" 
                      className={activity.score >= 80 ? 'text-green-600' : activity.score >= 60 ? 'text-yellow-600' : 'text-red-600'}
                    >
                      {activity.score}%
                    </Badge>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
