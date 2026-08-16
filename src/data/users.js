// Mock user data for TripAI.
// Passwords are plain text here only because this is a frontend-only mock.
// A real backend would hash these and never store them client-side.

export const users = [
  {
    id: 'u_traveler1',
    role: 'traveler',
    fullName: 'Aarav Koirala',
    email: 'aarav@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=12',
    joinedDate: '2025-03-14',
  },
  {
    id: 'u_owner1',
    role: 'owner',
    fullName: 'Sita Gurung',
    email: 'sita@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=45',
    joinedDate: '2024-11-02',
  },
]

export const currentTravelerId = 'u_traveler1'
export const currentOwnerId = 'u_owner1'
