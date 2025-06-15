import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Users, TrendingUp, Heart, Share2, Eye, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const DashboardCommunity = () => {
  const forumStats = {
    totalPosts: 1250,
    activeUsers: 340,
    todaysPosts: 28,
    myPosts: 5
  };

  const recentPosts = [
    {
      id: 1,
      title: "Best insurance for new car - Honda City",
      author: "CarEnthusiast2024",
      category: "Car Insurance",
      replies: 12,
      views: 340,
      timeAgo: "2 hours ago",
      isHot: true
    },
    {
      id: 2,
      title: "Claim settlement experience with HDFC ERGO",
      author: "ExperiencedDriver",
      category: "Reviews",
      replies: 8,
      views: 156,
      timeAgo: "4 hours ago",
      isHot: false
    },
    {
      id: 3,
      title: "Tips for reducing insurance premium",
      author: "SmartSaver",
      category: "Tips & Tricks",
      replies: 25,
      views: 520,
      timeAgo: "1 day ago",
      isHot: true
    }
  ];

  const popularCategories = [
    { name: "Car Insurance", posts: 450, color: "bg-blue-100 text-blue-800" },
    { name: "Reviews", posts: 320, color: "bg-green-100 text-green-800" },
    { name: "Tips & Tricks", posts: 280, color: "bg-purple-100 text-purple-800" },
    { name: "Claims", posts: 200, color: "bg-orange-100 text-orange-800" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Community Forum</h1>
          <p className="text-gray-600">Connect with fellow drivers and share experiences</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
          <MessageCircle className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Posts</p>
                  <p className="text-3xl font-bold">{forumStats.totalPosts}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Active Users</p>
                  <p className="text-3xl font-bold">{forumStats.activeUsers}</p>
                </div>
                <Users className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Today's Posts</p>
                  <p className="text-3xl font-bold">{forumStats.todaysPosts}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">My Posts</p>
                  <p className="text-3xl font-bold">{forumStats.myPosts}</p>
                </div>
                <Heart className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <span>Recent Discussions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="p-4 rounded-xl hover:bg-white/50 transition-colors border border-gray-100"
                  >
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                          {post.author[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-800 hover:text-blue-600 cursor-pointer">
                            {post.title}
                          </h4>
                          {post.isHot && (
                            <Badge className="bg-red-100 text-red-800 text-xs">🔥 Hot</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>by {post.author}</span>
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>{post.replies}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{post.views}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{post.timeAgo}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Button variant="outline" className="w-full">
                  View All Discussions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories Sidebar */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Popular Categories</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {popularCategories.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/50 transition-colors cursor-pointer"
                  >
                    <span className="font-medium text-gray-800">{category.name}</span>
                    <Badge className={category.color}>
                      {category.posts}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                <MessageCircle className="h-4 w-4 mr-2" />
                Start New Discussion
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Share2 className="h-4 w-4 mr-2" />
                Share Experience
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Heart className="h-4 w-4 mr-2" />
                My Favorite Posts
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <CardContent className="p-8 text-center">
          <MessageCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Forum Integration Coming Soon!</h3>
          <p className="text-gray-600 mb-4">
            We're working on integrating a full-featured community forum powered by NodeBB. 
            Soon you'll be able to participate in discussions, share experiences, and get help from fellow drivers.
          </p>
          <Button variant="outline">
            Stay Updated
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCommunity;
