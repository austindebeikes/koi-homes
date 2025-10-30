export interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  role: 'Agent' | 'Buyer';
  city: string;
  profilePhotoUrl: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  recentPosts: {
    imageUrl: string;
    caption: string;
    likes: number;
  }[];
}

export const mockUsers: Record<string, MockUser> = {
  '1': {
    id: '1',
    firstName: 'Kelly',
    lastName: 'Johnson',
    role: 'Agent',
    city: 'Los Angeles, CA',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    bio: 'Helping clients buy and sell homes in LA. Passionate about real estate and connecting people with their dream properties.',
    followers: 1250,
    following: 340,
    posts: 55,
    recentPosts: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
        caption: 'Just listed! Beautiful 3BR in downtown LA',
        likes: 124,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
        caption: 'Open house this weekend!',
        likes: 98,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
        caption: 'New listing in Venice Beach',
        likes: 156,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400',
        caption: 'Stunning views from this property',
        likes: 201,
      },
    ],
  },
  '2': {
    id: '2',
    firstName: 'Michael',
    lastName: 'Lee',
    role: 'Agent',
    city: 'Austin, TX',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    bio: 'Austin real estate expert. Specializing in modern homes and investment properties. Let me help you find your perfect place.',
    followers: 890,
    following: 256,
    posts: 42,
    recentPosts: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
        caption: 'Modern home in downtown Austin',
        likes: 87,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
        caption: 'Investment opportunity',
        likes: 65,
      },
    ],
  },
  '3': {
    id: '3',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    role: 'Agent',
    city: 'San Diego, CA',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    bio: 'San Diego native helping families find their dream homes by the beach. 15+ years experience in coastal properties.',
    followers: 2100,
    following: 412,
    posts: 78,
    recentPosts: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
        caption: 'Beachfront property in La Jolla',
        likes: 245,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400',
        caption: 'Sunset views from the deck',
        likes: 198,
      },
    ],
  },
};
