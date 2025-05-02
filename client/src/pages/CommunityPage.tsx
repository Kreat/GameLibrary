import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Users, Search, Filter, MessageCircle, Share2, ThumbsUp, Plus, Gamepad, FileText, Swords } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PostDiscussionDialog } from "@/components/community/PostDiscussionDialog";
import { ThreadViewDialog } from "@/components/community/ThreadViewDialog";

const categories = [
  {
    id: "general",
    name: "General Discussion",
    description: "Talk about anything game-related",
    icon: <MessageSquare className="h-6 w-6" />,
    color: "bg-primary text-white"
  },
  {
    id: "board-games",
    name: "Board Games",
    description: "Strategy, eurogames, family games and more",
    icon: <Gamepad className="h-6 w-6" />,
    color: "bg-amber-500 text-white"
  },
  {
    id: "card-games",
    name: "Card Games",
    description: "Collectible, trading, and traditional card games",
    icon: <FileText className="h-6 w-6" />,
    color: "bg-accent text-white"
  },
  {
    id: "rpg",
    name: "Tabletop RPGs",
    description: "Role-playing games, campaigns, and GM resources",
    icon: <Swords className="h-6 w-6" />,
    color: "bg-purple-800 text-white"
  },
  {
    id: "lfg",
    name: "Looking For Group",
    description: "Find players for your next gaming session",
    icon: <Users className="h-6 w-6" />,
    color: "bg-green-600 text-white"
  }
];

// Sample forum threads
const forumThreads = [
  {
    id: 1,
    title: "Best gateway board games for new players?",
    category: "board-games",
    author: {
      name: "Sarah",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    replies: 24,
    views: 156,
    lastReply: "2 hours ago",
    tags: ["beginner-friendly", "recommendations"]
  },
  {
    id: 2,
    title: "Seeking DM for D&D 5e campaign in Portland area",
    category: "lfg",
    author: {
      name: "Mike",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    replies: 8,
    views: 74,
    lastReply: "1 day ago",
    tags: ["d&d", "local", "portland"]
  },
  {
    id: 3,
    title: "First time GM advice for running Call of Cthulhu?",
    category: "rpg",
    author: {
      name: "Elena",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    replies: 17,
    views: 202,
    lastReply: "5 hours ago",
    tags: ["call-of-cthulhu", "tips", "GM"]
  },
  {
    id: 4,
    title: "Magic: The Gathering draft strategies for beginners",
    category: "card-games",
    author: {
      name: "Carlos",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    replies: 31,
    views: 418,
    lastReply: "3 hours ago",
    tags: ["mtg", "draft", "beginner"]
  },
  {
    id: 5,
    title: "Best tabletop games that work well over video chat?",
    category: "general",
    author: {
      name: "Jordan",
      avatar: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    replies: 42,
    views: 531,
    lastReply: "12 hours ago",
    tags: ["remote-play", "recommendations"]
  }
];

// Featured community members
const communityMembers = [
  {
    id: 1,
    name: "Kevin K.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    role: "BoardGame Master",
    gamesHosted: 15
  },
  {
    id: 2,
    name: "Chloe J.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    role: "MTG Champion",
    gamesHosted: 12
  },
  {
    id: 3,
    name: "Gustavo M.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    role: "Dungeon Master",
    gamesHosted: 21
  }
];

// Recent discussion posts
const discussionPosts = [
  {
    id: 1,
    content: "Just had an amazing session of Pandemic with my group. We finally beat the legendary difficulty!",
    author: {
      name: "Chloe J.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    likes: 24,
    comments: 8,
    time: "2 hours ago"
  },
  {
    id: 2,
    content: "Looking for recommendations for a good 2-player card game that's easy to learn but has strategic depth.",
    author: {
      name: "Mike",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    likes: 7,
    comments: 15,
    time: "5 hours ago"
  },
  {
    id: 3,
    content: "My weekly D&D group is looking for one more player. We play Thursday evenings, 7-10pm EST. Message if interested!",
    author: {
      name: "Gustavo M.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    likes: 12,
    comments: 6,
    time: "1 day ago"
  }
];

const CommunityPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("forums");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThread, setSelectedThread] = useState<number | null>(null);
  const [threadDialogOpen, setThreadDialogOpen] = useState(false);
  
  // Filter threads based on active category and search query
  const filteredThreads = forumThreads.filter(thread => {
    const categoryMatch = activeCategory === "all" || thread.category === activeCategory;
    const searchMatch = searchQuery === "" || 
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatch && searchMatch;
  });
  
  // Get the selected thread details
  const selectedThreadDetails = forumThreads.find(thread => thread.id === selectedThread);
  
  // View thread handler
  const handleViewThread = (threadId: number) => {
    setSelectedThread(threadId);
    setThreadDialogOpen(true);
  };

  // SEO - Set document title
  useEffect(() => {
    document.title = "Community - GameHub";
  }, []);

  return (
    <div>
      {/* Community Banner */}
      <div className="bg-gradient-to-r from-primary to-purple-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Gaming Community</h1>
            <p className="text-lg mb-6 text-primary-foreground/80">
              Connect with fellow gamers, share experiences, and become part of our tabletop community.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="outline"
                className="border-primary-foreground/40 text-white hover:bg-primary-foreground/10"
                size="lg"
                asChild
              >
                <Link href="#forums">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Browse Forums
                </Link>
              </Button>
              <PostDiscussionDialog
                buttonVariant="outline"
                buttonClassNames="border-primary-foreground/40 text-white hover:bg-primary-foreground/10"
                buttonSize="lg"
                refreshThreads={() => {
                  // In a real app, this would fetch the latest threads
                  toast({
                    title: "Discussion posted",
                    description: "Your thread is now visible to the community",
                  });
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Community Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="forums" className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              Forums
            </TabsTrigger>
            <TabsTrigger value="discussions" className="flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4" />
              Discussions
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              Members
            </TabsTrigger>
          </TabsList>
          
          {/* Forums Tab Content */}
          <TabsContent value="forums" id="forums">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Sidebar with categories */}
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-1">
                      <button
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          activeCategory === "all" ? "bg-primary-50 dark:bg-primary-900/30 text-primary" : ""
                        }`}
                        onClick={() => setActiveCategory("all")}
                      >
                        All Categories
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                            activeCategory === category.id ? "bg-primary-50 dark:bg-primary-900/30 text-primary" : ""
                          }`}
                          onClick={() => setActiveCategory(category.id)}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${category.color}`}>
                              {category.icon}
                            </div>
                            <span>{category.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Forum threads list */}
              <div className="md:col-span-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-display font-bold">
                      {activeCategory === "all" 
                        ? "All Discussions" 
                        : categories.find(c => c.id === activeCategory)?.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {activeCategory === "all" 
                        ? "Browse all forum discussions" 
                        : categories.find(c => c.id === activeCategory)?.description}
                    </p>
                  </div>
                  
                  <div className="w-full md:w-auto flex gap-2">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <Input 
                        placeholder="Search discussions..." 
                        className="pl-8" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                    <Button asChild>
                      <Link href={user ? "/community/new-thread" : "/profile"}>
                        <Plus className="h-4 w-4 mr-1" />
                        New Thread
                      </Link>
                    </Button>
                  </div>
                </div>
                
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-200 dark:divide-gray-800">
                      {filteredThreads.length > 0 ? (
                        filteredThreads.map((thread) => (
                          <div key={thread.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={thread.author.avatar} alt={thread.author.name} />
                                <AvatarFallback>{thread.author.name[0]}</AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge 
                                    className={`${
                                      categories.find(c => c.id === thread.category)?.color || "bg-gray-500"
                                    }`}
                                  >
                                    {categories.find(c => c.id === thread.category)?.name}
                                  </Badge>
                                </div>
                                
                                <h3 className="text-lg font-medium">
                                  <Link href={`/community/thread/${thread.id}`} className="hover:text-primary">
                                    {thread.title}
                                  </Link>
                                </h3>
                                
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {thread.tags.map((tag, i) => (
                                    <Badge key={i} variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                
                                <div className="mt-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  <span>By {thread.author.name}</span>
                                  <span className="mx-2">•</span>
                                  <span>{thread.replies} replies</span>
                                  <span className="mx-2">•</span>
                                  <span>{thread.views} views</span>
                                  <span className="mx-2">•</span>
                                  <span>Last reply {thread.lastReply}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center">
                          <p className="text-gray-500 dark:text-gray-400 mb-4">
                            No discussions found matching your criteria.
                          </p>
                          <Button asChild>
                            <Link href={user ? "/community/new-thread" : "/profile"}>
                              <Plus className="h-4 w-4 mr-1" />
                              Start a New Discussion
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  {filteredThreads.length > 0 && (
                    <CardFooter className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-800">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing {filteredThreads.length} of {forumThreads.length} discussions
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>
                          Previous
                        </Button>
                        <Button variant="outline" size="sm" disabled>
                          Next
                        </Button>
                      </div>
                    </CardFooter>
                  )}
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Discussions Tab Content */}
          <TabsContent value="discussions">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-display font-bold">Recent Discussions</h2>
                  <Button asChild>
                    <Link href={user ? "/community/new-post" : "/profile"}>
                      <Plus className="h-4 w-4 mr-1" />
                      New Post
                    </Link>
                  </Button>
                </div>
                
                {/* Post input for logged in users */}
                {user && (
                  <Card className="mb-6">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                          <AvatarFallback>{user.displayName?.[0] || user.email?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <textarea 
                            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800"
                            placeholder="Share something with the community..."
                            rows={3}
                          ></textarea>
                          <div className="mt-2 flex justify-end">
                            <Button>Post</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Discussion posts */}
                <div className="space-y-6">
                  {discussionPosts.map((post) => (
                    <Card key={post.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={post.author.avatar} alt={post.author.name} />
                            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{post.author.name}</h3>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                • {post.time}
                              </span>
                            </div>
                            
                            <p className="mt-2">{post.content}</p>
                            
                            <div className="mt-4 flex items-center gap-4">
                              <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-primary">
                                <ThumbsUp className="h-4 w-4" />
                                <span>{post.likes}</span>
                              </button>
                              <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-primary">
                                <MessageCircle className="h-4 w-4" />
                                <span>{post.comments}</span>
                              </button>
                              <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-primary">
                                <Share2 className="h-4 w-4" />
                                <span>Share</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Button variant="outline">Load More</Button>
                </div>
              </div>
              
              <div className="md:col-span-1 space-y-6">
                {/* Community stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Community Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">1,243</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Members</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">3,872</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Discussions</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">215</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Active Today</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">67</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">New Members</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Active categories */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-200 dark:divide-gray-800">
                      {categories.slice(0, 3).map((category) => (
                        <div key={category.id} className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${category.color} mr-3`}>
                            {category.icon}
                          </div>
                          <div>
                            <h4 className="font-medium">{category.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{category.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="#forums" onClick={() => {
                        setActiveTab("forums");
                        setActiveCategory("all");
                      }}>
                        View All Categories
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Community guidelines */}
                <Card>
                  <CardHeader>
                    <CardTitle>Community Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="rounded-full bg-primary-100 dark:bg-primary-900/30 p-1 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        </div>
                        <span>Be respectful and inclusive to all members</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="rounded-full bg-primary-100 dark:bg-primary-900/30 p-1 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        </div>
                        <span>Keep discussions on-topic and constructive</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="rounded-full bg-primary-100 dark:bg-primary-900/30 p-1 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        </div>
                        <span>No spamming or excessive self-promotion</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="rounded-full bg-primary-100 dark:bg-primary-900/30 p-1 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        </div>
                        <span>Use appropriate language and content</span>
                      </li>
                    </ul>
                    <Button variant="link" className="p-0 h-auto mt-2" asChild>
                      <a href="#">Read Full Guidelines</a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Members Tab Content */}
          <TabsContent value="members">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-display font-bold">Community Members</h2>
                    <p className="text-gray-600 dark:text-gray-400">Connect with fellow tabletop gamers</p>
                  </div>
                  
                  <div className="w-full md:w-auto flex gap-2">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <Input placeholder="Search members..." className="pl-8" />
                    </div>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Featured members section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Featured Members</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {communityMembers.map((member) => (
                      <Card key={member.id}>
                        <CardContent className="p-4 flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>{member.name[0]}</AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <h4 className="font-medium text-lg">{member.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                            <p className="text-sm font-medium text-primary mt-1">
                              {member.gamesHosted} games hosted
                            </p>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                          <Button variant="outline" className="w-full" asChild>
                            <Link href={`/profile/${member.id}`}>View Profile</Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <Separator className="my-8" />
                
                {/* Member directory */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Member Directory</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-4 flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <h4 className="font-medium">User {i + 1}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Member</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="mt-6 text-center">
                    <Button variant="outline">Load More Members</Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CommunityPage;
