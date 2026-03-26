/**
 * Geocoding Utility
 * Provides reverse geocoding using OpenStreetMap Nominatim API (free, no API key)
 */

export interface GeocodeResult {
  city: string
  state: string
  country: string
  latitude: number
  longitude: number
}

/**
 * Reverse geocode latitude/longitude to city/state
 * Uses OpenStreetMap Nominatim API (free tier)
 * 
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Promise with city, state, country
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<GeocodeResult> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=hi`
    )

    if (!response.ok) {
      throw new Error('Geocoding failed')
    }

    const data = await response.json()

    // Extract location components from Nominatim response
    const address = data.address || {}
    
    // Try multiple fields for city name
    const city = 
      address.city || 
      address.town || 
      address.village || 
      address.municipality || 
      address.county ||
      'Varanasi'

    // Try multiple fields for state
    const state = 
      address.state || 
      address.region ||
      'Uttar Pradesh'

    const country = address.country || 'India'

    return {
      city,
      state,
      country,
      latitude: lat,
      longitude: lng,
    }
  } catch (error) {
    console.error('[Geocode] Reverse geocoding failed:', error)
    
    // Fallback to default location
    return {
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      country: 'India',
      latitude: lat,
      longitude: lng,
    }
  }
}

/**
 * Get current location with timeout
 * 
 * @param timeoutMs - Timeout in milliseconds (default 10000)
 * @returns Promise with latitude and longitude
 */
export function getCurrentLocation(timeoutMs = 10000): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      },
      {
        timeout: timeoutMs,
        enableHighAccuracy: true,
        maximumAge: 60000, // Use cached location up to 1 minute old
      }
    )
  })
}

/**
 * Get full location info (coordinates + city/state)
 * 
 * @param timeoutMs - Timeout in milliseconds
 * @returns Promise with full location details
 */
export async function getFullLocation(timeoutMs = 10000): Promise<GeocodeResult> {
  const coords = await getCurrentLocation(timeoutMs)
  return reverseGeocode(coords.latitude, coords.longitude)
}
