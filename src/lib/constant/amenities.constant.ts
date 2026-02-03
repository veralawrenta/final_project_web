export const AMENITIES = [
    { id: "wifi", label: "WiFi" },
    { id: "parking", label: "Free Parking" },
    { id: "pool", label: "Swimming Pool" },
    { id: "gym", label: "Fitness Center" },
    { id: "spa", label: "Spa & Wellness" },
    { id: "restaurant", label: "Restaurant" },
    { id: "airConditioning", label: "Air Conditioning" },
    { id: "kitchen", label: "Kitchen" },
    { id: "balcony", label: "Balcony/Terrace" },
    { id: "oceanView", label: "Ocean View" },
    { id: "petFriendly", label: "Pet Friendly" },
    { id: "security", label: "24/7 Security" },
  ] as const;
  
  export type AmenityId = typeof AMENITIES[number]["id"];
  export type AmenityLabel = typeof AMENITIES[number]["label"];
  