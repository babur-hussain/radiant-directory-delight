
import { getInverseHeaderMapping } from '@/models/Business';

// Generate a CSV template for download
export const generateCSVTemplate = (): string => {
  const headerMapping = getInverseHeaderMapping();
  
  // Headers in the format that Supabase will recognize
  const headers = ["name", "category", "address", "phone", "rating", "reviews", "description", "email", "website", "tags", "featured", "image"];
  
  // Create a user-friendly header row using the inverse mapping
  const userFriendlyHeaders = headers.map(dbField => headerMapping[dbField] || dbField);
  
  // Sample data
  const rows = [
    [
      "Acme Coffee Shop", 
      "Cafe", 
      "123 Main St", 
      "555-123-4567", 
      "4.5", 
      "120", 
      "Best coffee in town", 
      "info@acmecoffee.com", 
      "https://acmecoffee.com", 
      "coffee, pastries", 
      "true", 
      "https://example.com/coffee.jpg"
    ],
    [
      "Tech Solutions", 
      "Technology", 
      "456 Tech Blvd", 
      "555-987-6543", 
      "5", 
      "87", 
      "Professional IT services", 
      "contact@techsolutions.com", 
      "https://techsolutions.com", 
      "it, services, computer repair", 
      "false", 
      ""
    ]
  ];
  
  // Combine headers and data
  const csvContent = [
    userFriendlyHeaders.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");
  
  return csvContent;
};
