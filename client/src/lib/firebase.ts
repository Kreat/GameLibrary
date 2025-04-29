// This is a mock Firebase implementation for development without actual Firebase

// Mock user type that mimics Firebase User object
export interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Mock database for storing user data and other app data
class MockDatabase {
  private users: MockUser[] = [];
  private sessions: any[] = [];
  private games: any[] = [];
  private threads: any[] = [];
  private posts: any[] = [];

  constructor() {
    // Add demo user
    this.users.push({
      uid: "demo-user-1",
      email: "demo@example.com",
      displayName: "Demo User",
      photoURL: "https://source.unsplash.com/random/100x100/?avatar"
    });
    
    // We'll add sample data for the app
    this.initSampleData();
  }

  private initSampleData() {
    // Add some sample games
    this.games = [
      {
        id: "game-1",
        title: "Catan",
        type: "board",
        description: "Build settlements, cities, and roads as you compete for resources in this classic strategy game.",
        minPlayers: 3,
        maxPlayers: 4,
        complexity: "Medium",
        playTime: "60-120 min",
        imageUrl: "https://images.unsplash.com/photo-1606503153255-59d8b2e4739e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "game-2",
        title: "Magic: The Gathering",
        type: "card",
        description: "Collect cards, build decks, and battle opponents in this strategic trading card game.",
        minPlayers: 2,
        maxPlayers: 8,
        complexity: "High",
        playTime: "20-60 min",
        imageUrl: "https://images.unsplash.com/photo-1595306407462-283c7898c3f0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "game-3",
        title: "Dungeons & Dragons",
        type: "rpg",
        description: "Create characters, embark on adventures, and tell collaborative stories in this iconic role-playing game.",
        minPlayers: 3,
        maxPlayers: 7,
        complexity: "High",
        playTime: "2-4 hours",
        imageUrl: "https://images.unsplash.com/photo-1605870445919-838d190e8e1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      }
    ];

    // Add some sample sessions
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    this.sessions = [
      {
        id: "session-1",
        title: "Catan Tournament Night",
        description: "Join us for a fun night of strategic gameplay with Catan and expansions!",
        gameType: "Board Game",
        gameName: "Catan",
        duration: "2.5 hours",
        startTime: tomorrow,
        endTime: new Date(tomorrow.getTime() + 2.5 * 60 * 60 * 1000),
        location: "Stanford Game Room, Building 42",
        host: {
          id: "demo-user-1",
          name: "Demo User",
          avatar: "https://source.unsplash.com/random/100x100/?avatar"
        },
        participants: [
          { id: "demo-user-1", name: "Demo User" },
          { id: "p1", name: "Alice" },
          { id: "p2", name: "Bob" }
        ],
        maxParticipants: 5,
        currentPlayers: 3
      },
      {
        id: "session-2",
        title: "D&D Campaign - Session 1",
        description: "Starting a new D&D campaign for beginners. All welcome!",
        gameType: "Tabletop RPG",
        gameName: "Dungeons & Dragons 5e",
        duration: "3 hours",
        startTime: nextWeek,
        endTime: new Date(nextWeek.getTime() + 3 * 60 * 60 * 1000),
        location: "The Gaming Dungeon, Downtown",
        host: {
          id: "demo-user-1",
          name: "Demo User",
          avatar: "https://source.unsplash.com/random/100x100/?avatar"
        },
        participants: [
          { id: "demo-user-1", name: "Demo User" }
        ],
        maxParticipants: 6,
        currentPlayers: 1
      }
    ];

    // Add some sample forum threads and categories
    this.threads = [
      {
        id: "thread-1",
        title: "Best gateway board games for new players?",
        categoryId: "cat-board-games",
        authorId: "demo-user-1",
        views: 156,
        isPinned: false,
        isLocked: false,
        tags: ["beginner-friendly", "recommendations"],
        createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
        lastPostAt: new Date(Date.now() - 7200000) // 2 hours ago
      },
      {
        id: "thread-2",
        title: "First time GM advice for running Call of Cthulhu?",
        categoryId: "cat-rpg",
        authorId: "demo-user-1",
        views: 89,
        isPinned: false,
        isLocked: false,
        tags: ["call-of-cthulhu", "tips", "GM"],
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        lastPostAt: new Date(Date.now() - 18000000) // 5 hours ago
      }
    ];
  }
  
  // Method to get all data of a specific collection
  getCollection(collectionName: string): any[] {
    switch(collectionName) {
      case 'users': return this.users;
      case 'sessions': return this.sessions;
      case 'games': return this.games;
      case 'threads': return this.threads;
      case 'posts': return this.posts;
      default: return [];
    }
  }
  
  // Mock method to "add" a document
  addDocument(collectionName: string, data: any): any {
    const id = `mock-${collectionName}-${Date.now()}`;
    const documentData = { id, ...data };
    
    switch(collectionName) {
      case 'users': this.users.push(documentData as MockUser); break;
      case 'sessions': this.sessions.push(documentData); break;
      case 'games': this.games.push(documentData); break;
      case 'threads': this.threads.push(documentData); break;
      case 'posts': this.posts.push(documentData); break;
    }
    
    return { id, data };
  }
  
  // Mock firestore methods
  collection(name: string) {
    return {
      doc: (id: string) => ({
        get: async () => {
          const collection = this.getCollection(name);
          const doc = collection.find(item => item.id === id);
          return {
            exists: !!doc,
            data: () => doc || null,
            id
          };
        },
        set: async (data: any, options: any = {}) => {
          const collection = this.getCollection(name);
          const index = collection.findIndex(item => item.id === id);
          if (index >= 0) {
            // Update existing
            if (options.merge) {
              collection[index] = { ...collection[index], ...data };
            } else {
              collection[index] = { id, ...data };
            }
          } else {
            // Add new
            this.addDocument(name, { id, ...data });
          }
          return { id };
        }
      }),
      add: async (data: any) => {
        return this.addDocument(name, data);
      },
      where: (field: string, operator: string, value: any) => ({
        get: async () => {
          const collection = this.getCollection(name);
          let filteredDocs;
          
          if (operator === "==") {
            filteredDocs = collection.filter(doc => doc[field] === value);
          } else if (operator === ">") {
            filteredDocs = collection.filter(doc => doc[field] > value);
          } else if (operator === "<") {
            filteredDocs = collection.filter(doc => doc[field] < value);
          } else {
            filteredDocs = collection;
          }
          
          return {
            docs: filteredDocs.map(doc => ({
              id: doc.id,
              data: () => doc,
              exists: true
            })),
            empty: filteredDocs.length === 0
          };
        }
      }),
      get: async () => {
        const collection = this.getCollection(name);
        return {
          docs: collection.map(doc => ({
            id: doc.id,
            data: () => doc,
            exists: true
          })),
          empty: collection.length === 0
        };
      }
    };
  }
}

// Initialize mock database
const db = new MockDatabase();

// Mock auth state
let currentUser: MockUser | null = null;
const authObservers: ((user: MockUser | null) => void)[] = [];

// Mock auth object with minimal functionality
const auth = {
  currentUser,
  onAuthStateChanged: (callback: (user: MockUser | null) => void) => {
    authObservers.push(callback);
    callback(currentUser);
    return () => {
      const index = authObservers.indexOf(callback);
      if (index > -1) {
        authObservers.splice(index, 1);
      }
    };
  }
};

// Mock sign in method
const signInWithGoogle = async () => {
  try {
    currentUser = {
      uid: "demo-user-1",
      email: "demo@example.com",
      displayName: "Demo User",
      photoURL: "https://source.unsplash.com/random/100x100/?avatar"
    };
    
    // Notify all observers
    authObservers.forEach(callback => callback(currentUser));
    
    return currentUser;
  } catch (error) {
    console.error("Error with mock sign in:", error);
    throw error;
  }
};

// Mock sign out method
const logOut = async () => {
  try {
    currentUser = null;
    // Notify all observers
    authObservers.forEach(callback => callback(null));
  } catch (error) {
    console.error("Error with mock sign out:", error);
    throw error;
  }
};

export { auth, db, signInWithGoogle, logOut };
