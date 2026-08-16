// Mock destination data for TripAI.
// In a real backend this would come from a /destinations API endpoint.

export const destinations = [
  {
    id: 'd1',
    name: 'Pokhara',
    region: 'Western Nepal',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80',
      'https://images.unsplash.com/photo-1554366347-897a5113f6ab?w=1200&q=80',
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80',
    ],
    rating: 4.8,
    reviewCount: 312,
    travelType: ['Nature', 'Adventure'],
    bestSeason: 'Oct – Mar',
    estimatedBudget: 350,
    description:
      'A lakeside city framed by the Annapurna range, known for paragliding, boating on Phewa Lake, and relaxed mountain views.',
    thingsToDo: ['Paragliding over Phewa Lake', 'Sunrise at Sarangkot', 'World Peace Pagoda hike', 'Boating to Tal Barahi Temple'],
  },
  {
    id: 'd2',
    name: 'Bandipur',
    region: 'Central Nepal',
    image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=1200&q=80',
      'https://images.unsplash.com/photo-1571406384350-2313af2d4396?w=1200&q=80',
    ],
    rating: 4.6,
    reviewCount: 178,
    travelType: ['Cultural', 'Nature'],
    bestSeason: 'Sep – Apr',
    estimatedBudget: 220,
    description:
      'A preserved Newar hill town with cobbled streets, traditional homestays, and panoramic Himalayan views.',
    thingsToDo: ['Walk the old bazaar street', 'Visit Thani Mai temple', 'Tundikhel viewpoint at sunrise', 'Try local Newari cuisine'],
  },
  {
    id: 'd3',
    name: 'Lumbini',
    region: 'Southern Nepal',
    image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=1200&q=80',
      'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1200&q=80',
    ],
    rating: 4.5,
    reviewCount: 204,
    travelType: ['Religious', 'Cultural'],
    bestSeason: 'Nov – Feb',
    estimatedBudget: 180,
    description:
      'The birthplace of Lord Buddha, home to the Maya Devi Temple and monasteries built by countries across the world.',
    thingsToDo: ['Maya Devi Temple', 'Monastic Zone walk', 'Lumbini Museum', 'Sacred Garden meditation'],
  },
  {
    id: 'd4',
    name: 'Ilam',
    region: 'Eastern Nepal',
    image: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=1200&q=80',
      'https://images.unsplash.com/photo-1563911892437-1feda0179e1b?w=1200&q=80',
    ],
    rating: 4.7,
    reviewCount: 96,
    travelType: ['Nature', 'Family'],
    bestSeason: 'Mar – Jun',
    estimatedBudget: 200,
    description:
      'Rolling tea gardens, misty hills, and slow mornings — one of the quietest, greenest corners of Nepal.',
    thingsToDo: ['Tea garden walk', 'Antu Danda sunrise viewpoint', 'Mai Pokhari lake', 'Local tea factory tour'],
  },
  {
    id: 'd5',
    name: 'Bhaktapur',
    region: 'Kathmandu Valley',
    image: 'https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?w=1200&q=80',
      'https://images.unsplash.com/photo-1605548230624-c1ea3a3c1f3a?w=1200&q=80',
    ],
    rating: 4.6,
    reviewCount: 421,
    travelType: ['Cultural', 'Luxury'],
    bestSeason: 'Year-round',
    estimatedBudget: 260,
    description:
      'A living museum of Newar architecture — courtyards, pagoda temples, and centuries-old pottery squares.',
    thingsToDo: ['Durbar Square', 'Pottery Square', 'Nyatapola Temple', 'Rooftop cafe hopping'],
  },
  {
    id: 'd6',
    name: 'Chitwan',
    region: 'Inner Terai',
    image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=1200&q=80',
      'https://images.unsplash.com/photo-1605538032404-d7f7a4f8a3f5?w=1200&q=80',
    ],
    rating: 4.7,
    reviewCount: 265,
    travelType: ['Adventure', 'Family', 'Nature'],
    bestSeason: 'Oct – Mar',
    estimatedBudget: 300,
    description:
      'A national park famous for rhino and tiger sightings, jungle safaris, and Tharu cultural villages.',
    thingsToDo: ['Jeep safari', 'Canoe ride on Rapti River', 'Tharu cultural show', 'Elephant breeding center visit'],
  },
]

export const travelTypes = ['Adventure', 'Religious', 'Nature', 'Cultural', 'Luxury', 'Family']
export const regions = ['Western Nepal', 'Central Nepal', 'Southern Nepal', 'Eastern Nepal', 'Kathmandu Valley', 'Inner Terai']
