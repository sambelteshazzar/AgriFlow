import { db } from './persistence';
import { MarketplaceListing, ForumPost, ForumReply, CommunityChatMessage, Story, SocialTrend, SuggestedUser } from '../types';
import { INITIAL_STORIES, INITIAL_TRENDS, INITIAL_SUGGESTED_USERS } from '../constants';

export class CommunityService {
  // --- Marketplace ---
  static async getListings(): Promise<MarketplaceListing[]> {
    const listings = await db.getListings();
    // Sort Active First, then by Date Descending
    return listings.sort((a, b) => {
      if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
      if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  static async addListing(listing: Omit<MarketplaceListing, 'id' | 'verified' | 'status' | 'date'>): Promise<MarketplaceListing[]> {
    // Integrity Check
    if (!listing.item || listing.item.length < 3) throw new Error("Invalid Item Name");
    if (!listing.price) throw new Error("Price is required");

    const current = await db.getListings(); 
    const newListing: MarketplaceListing = {
      ...listing,
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Robust ID
      verified: false,
      status: 'ACTIVE',
      date: new Date().toISOString()
    };
    const updated = [newListing, ...current];
    await db.saveListings(updated);
    return this.getListings(); // Return sorted
  }

  static async markListingAsSold(id: string): Promise<MarketplaceListing[]> {
    const current = await db.getListings();
    const updated = current.map(l => l.id === id ? { ...l, status: 'SOLD' as const } : l);
    await db.saveListings(updated);
    return this.getListings(); // Return sorted
  }

  // --- Forum ---
  static async getPosts(): Promise<ForumPost[]> {
    const posts = await db.getPosts();
    // Sort by Date Descending
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async getPostReplies(postId: string): Promise<ForumReply[]> {
    return await db.getReplies(postId);
  }

  static async addPost(post: Omit<ForumPost, 'id' | 'replies' | 'likes' | 'date'>): Promise<ForumPost[]> {
    if (!post.content) throw new Error("Post content cannot be empty");

    const current = await db.getPosts();
    const newPost: ForumPost = { 
      ...post, 
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`, 
      replies: 0,
      likes: 0,
      date: new Date().toISOString()
    };
    const updated = [newPost, ...current];
    await db.savePosts(updated);
    return this.getPosts(); // Return sorted
  }

  static async addReply(postId: string, content: string, author: string): Promise<ForumReply[]> {
    if (!content.trim()) throw new Error("Reply cannot be empty");

    const newReply: ForumReply = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      postId,
      author,
      content,
      date: new Date().toISOString()
    };
    
    // Save reply
    await db.addReply(newReply);
    
    // Increment post reply count transactionally
    const posts = await db.getPosts();
    const updatedPosts = posts.map(p => 
      p.id === postId ? { ...p, replies: p.replies + 1 } : p
    );
    await db.savePosts(updatedPosts);

    return await db.getReplies(postId);
  }

  static async getLikedPostIds(): Promise<string[]> {
    return await db.getLikedPostIds();
  }

  static async toggleLike(postId: string): Promise<{ posts: ForumPost[], likedIds: string[] }> {
    const posts = await db.getPosts();
    const likedIds = await db.getLikedPostIds();
    const isLiked = likedIds.includes(postId);
    
    let newLikedIds: string[];
    let likeModifier: number;

    if (isLiked) {
      // Unlike
      newLikedIds = likedIds.filter(id => id !== postId);
      likeModifier = -1;
    } else {
      // Like
      newLikedIds = [...likedIds, postId];
      likeModifier = 1;
    }

    const updatedPosts = posts.map(p => 
      p.id === postId ? { ...p, likes: Math.max(0, p.likes + likeModifier) } : p
    );

    await db.savePosts(updatedPosts);
    await db.saveLikedPostIds(newLikedIds);

    // Return sorted posts and updated ids
    return { 
      posts: updatedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
      likedIds: newLikedIds 
    };
  }

  // --- Chat ---
  static async getChatMessages(channelId?: string): Promise<CommunityChatMessage[]> {
    const allMessages = await db.getChatMessages();
    const sorted = allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    if (channelId) {
      return sorted.filter(msg => msg.channelId === channelId);
    }
    return sorted;
  }

  static async sendMessage(message: Omit<CommunityChatMessage, 'id' | 'timestamp'>): Promise<CommunityChatMessage[]> {
    if (!message.text.trim()) throw new Error("Message text required");

    const current = await db.getChatMessages();
    const newMessage: CommunityChatMessage = {
      ...message,
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    const updated = [...current, newMessage];
    await db.saveChatMessages(updated);
    return updated;
  }

  // --- Social / Feed Features ---
  static async getStories(): Promise<Story[]> {
    return Promise.resolve(INITIAL_STORIES);
  }

  static async getTrends(): Promise<SocialTrend[]> {
    return Promise.resolve(INITIAL_TRENDS);
  }

  static async getSuggestedUsers(): Promise<SuggestedUser[]> {
    return Promise.resolve(INITIAL_SUGGESTED_USERS);
  }

  static async getFollowedUserIds(): Promise<string[]> {
    return await db.getFollowedUserIds();
  }

  static async toggleFollowUser(userId: string): Promise<string[]> {
    const current = await db.getFollowedUserIds();
    const exists = current.includes(userId);
    let updated: string[];
    
    if (exists) {
      updated = current.filter(id => id !== userId);
    } else {
      updated = [...current, userId];
    }
    
    await db.saveFollowedUserIds(updated);
    return updated;
  }
}