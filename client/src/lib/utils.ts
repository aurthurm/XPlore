import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Track whether the Google Maps script is loaded
let googleMapsLoaded = false;

// Function to load Google Maps script dynamically
export async function loadGoogleMapsScript(): Promise<void> {
  if (googleMapsLoaded) {
    return Promise.resolve();
  }
  
  try {
    // Fetch the Google Maps API key from the server endpoint
    const response = await fetch('/api/config/maps');
    const data = await response.json();
    const apiKey = data.apiKey;
    
    return new Promise((resolve, reject) => {
      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      // Set up event listeners for script loading
      script.addEventListener('load', () => {
        googleMapsLoaded = true;
        resolve();
      });
      
      script.addEventListener('error', (error) => {
        reject(new Error(`Failed to load Google Maps script: ${error.message}`));
      });
      
      // Append script to document
      document.head.appendChild(script);
    });
  } catch (error) {
    console.error('Error loading Google Maps script:', error);
    throw error;
  }
}
