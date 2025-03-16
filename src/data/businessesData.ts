
// This array serves as fallback data when Firebase or MongoDB access fails
export const businessesData = [
  {
    id: 1,
    name: "Tech Solutions India",
    category: "Technology",
    location: "Madhya Pradesh",
    rating: 4.7,
    reviews: 152,
    image: "/placeholder.svg",
    description: "Providing innovative tech solutions for businesses across India",
    tags: ["technology", "it services", "consulting"],
    featured: true
  },
  {
    id: 2,
    name: "Spice Delight Restaurant",
    category: "Food & Dining",
    location: "Maharashtra",
    rating: 4.5,
    reviews: 203,
    image: "/placeholder.svg",
    description: "Authentic Indian cuisine with a modern twist",
    tags: ["food", "restaurant", "dining"],
    featured: true
  },
  {
    id: 3,
    name: "Green Earth Handicrafts",
    category: "Handicrafts",
    location: "Rajasthan",
    rating: 4.9,
    reviews: 98,
    image: "/placeholder.svg",
    description: "Eco-friendly handicrafts made by local artisans",
    tags: ["handicrafts", "eco-friendly", "artisan"],
    featured: true
  },
  {
    id: 4,
    name: "Bharat Tours & Travels",
    category: "Travel",
    location: "Gujarat",
    rating: 4.6,
    reviews: 175,
    image: "/placeholder.svg",
    description: "Customized travel experiences across India",
    tags: ["travel", "tourism", "adventure"],
    featured: false
  },
  {
    id: 5,
    name: "Digital Marketing Pros",
    category: "Marketing",
    location: "Karnataka",
    rating: 4.3,
    reviews: 87,
    image: "/placeholder.svg",
    description: "Full-service digital marketing agency for Indian businesses",
    tags: ["marketing", "digital", "seo"],
    featured: false
  }
];

// Note: We also use DEFAULT_BUSINESSES_DATA from csv-utils.ts when needed
