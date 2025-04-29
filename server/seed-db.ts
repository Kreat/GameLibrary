import { db } from './db';
import { forumCategories } from '@shared/schema';
import { storage } from './storage';

// Seed the database with initial data
async function seedDatabase() {
  try {
    console.log('Seeding database...');
    
    // Check if we have any forum categories already
    const existingCategories = await db.select().from(forumCategories);
    
    if (existingCategories.length === 0) {
      console.log('Adding forum categories...');
      
      // Create forum categories
      const categories = [
        { 
          name: "General Discussion", 
          description: "Talk about anything game-related", 
          slug: "general", 
          iconName: "MessageSquare", 
          color: "bg-primary" 
        },
        { 
          name: "Board Games", 
          description: "Strategy, eurogames, family games and more", 
          slug: "board-games", 
          iconName: "GameController", 
          color: "bg-amber-500" 
        },
        { 
          name: "Card Games", 
          description: "Collectible, trading, and traditional card games", 
          slug: "card-games", 
          iconName: "FileText", 
          color: "bg-accent" 
        },
        { 
          name: "Tabletop RPGs", 
          description: "Role-playing games, campaigns, and GM resources", 
          slug: "rpg", 
          iconName: "Swords", 
          color: "bg-purple-800" 
        },
        { 
          name: "Looking For Group", 
          description: "Find players for your next gaming session", 
          slug: "lfg", 
          iconName: "Users", 
          color: "bg-green-600" 
        }
      ];
      
      for (const category of categories) {
        await storage.createForumCategory(category);
      }
      
      console.log('Added forum categories');
    } else {
      console.log('Forum categories already exist');
    }
    
    console.log('Database seeding complete');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

export { seedDatabase };