import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency with proper symbol
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Convert price level number to $ symbols
export function getPriceLevelSymbol(priceLevel: number): string {
  switch (priceLevel) {
    case 1:
      return '$';
    case 2:
      return '$$';
    case 3:
      return '$$$';
    case 4:
      return '$$$$';
    default:
      return '';
  }
}

// Get emoji for category icon
export function getCategoryIcon(iconName: string): string {
  const iconMap: Record<string, string> = {
    bed: "🏨", // Accommodation
    utensils: "🍽️", // Dining
    camera: "🏛️", // Attractions
    "shopping-bag": "🛍️", // Shopping
    car: "🚌", // Transportation
    map: "🧭", // Tours
  };
  
  return iconMap[iconName] || "📍";
}

// Track whether the Google Maps script is loaded
let googleMapsLoaded = false;
let googleMapsLoadPromise: Promise<void> | null = null;

// Function to load Google Maps script dynamically following best practices
export async function loadGoogleMapsScript(): Promise<void> {
  // Return existing promise if already loading
  if (googleMapsLoadPromise) {
    return googleMapsLoadPromise;
  }
  
  // Return immediately if already loaded
  if (googleMapsLoaded) {
    return Promise.resolve();
  }
  
  // Create a new loading promise
  googleMapsLoadPromise = (async () => {
    try {
      // Fetch the Google Maps API key from the server endpoint
      const response = await fetch('/api/config/maps');
      const data = await response.json();
      const apiKey = data.apiKey;
      
      return new Promise<void>((resolve, reject) => {
        // Create a callback function name
        const callbackName = `googleMapsInitialize_${Date.now()}`;
        
        // Add the callback to window object
        (window as any)[callbackName] = () => {
          googleMapsLoaded = true;
          delete (window as any)[callbackName];
          resolve();
        };
        
        // Create script element with callback
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
        script.async = true;
        script.defer = true;
        
        // Set up error listener
        script.addEventListener('error', (error) => {
          delete (window as any)[callbackName];
          googleMapsLoadPromise = null;
          reject(new Error(`Failed to load Google Maps script: ${error.message}`));
        });
        
        // Append script to document
        document.head.appendChild(script);
      });
    } catch (error) {
      console.error('Error loading Google Maps script:', error);
      googleMapsLoadPromise = null;
      throw error;
    }
  })();
  
  return googleMapsLoadPromise;
}
