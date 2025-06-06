
// Generate a CSV template for influencer download
export const generateInfluencerCSVTemplate = (): string => {
  // Headers in the format that will be recognized by the processor
  const headers = [
    "Name", "Email", "Phone", "Bio", "Niche", "Followers Count", "Engagement Rate",
    "Location", "City", "State", "Country", "Instagram Handle", "YouTube Handle",
    "TikTok Handle", "Facebook Handle", "Twitter Handle", "LinkedIn Handle",
    "Website", "Profile Image", "Rating", "Reviews", "Featured", "Priority",
    "Tags", "Previous Brands"
  ];
  
  // Sample data
  const rows = [
    [
      "Sarah Johnson", 
      "sarah@example.com", 
      "555-123-4567", 
      "Lifestyle and fashion influencer with a passion for sustainable living", 
      "Fashion & Lifestyle", 
      "50000", 
      "4.5", 
      "New York", 
      "New York", 
      "NY", 
      "USA", 
      "sarahjohnson", 
      "SarahJohnsonTV", 
      "sarahjohnson", 
      "sarah.johnson", 
      "sarahjohnson", 
      "sarah-johnson", 
      "https://sarahjohnson.com", 
      "https://example.com/sarah.jpg", 
      "4.8", 
      "125", 
      "true", 
      "10", 
      "fashion, lifestyle, sustainable", 
      "Nike, Zara, H&M"
    ],
    [
      "Mike Chen", 
      "mike@example.com", 
      "555-987-6543", 
      "Tech reviewer and gaming content creator", 
      "Technology", 
      "75000", 
      "6.2", 
      "San Francisco", 
      "San Francisco", 
      "CA", 
      "USA", 
      "mikechen_tech", 
      "MikeChenTech", 
      "mikechen", 
      "mike.chen.tech", 
      "mikechen", 
      "mike-chen-tech", 
      "https://mikechen.tech", 
      "", 
      "4.9", 
      "87", 
      "false", 
      "5", 
      "tech, gaming, reviews", 
      "Apple, Samsung, ASUS"
    ]
  ];
  
  // Combine headers and data
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");
  
  return csvContent;
};
