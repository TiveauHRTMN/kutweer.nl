
interface BolProduct {
  id: string;
  title: string;
  link: string;
  price: number;
  image: string;
  rating?: number;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getBolAccessToken() {
  const clientId = process.env.BOL_CLIENT_ID;
  const clientSecret = process.env.BOL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("BOL_CLIENT_ID or BOL_CLIENT_SECRET missing in .env.local");
  }

  // Gebruik cache als de token nog geldig is (met 30s marge)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30000) {
    return cachedToken.token;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://login.bol.com/token?grant_type=client_credentials', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Accept': 'application/json',
      'Content-Length': '0'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Bol Auth Error:", error);
    throw new Error(`Bol.com authentication failed: ${response.statusText}`);
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000)
  };

  return data.access_token;
}

export async function searchBolProducts(query: string, limit: number = 3): Promise<BolProduct[]> {
  try {
    const token = await getBolAccessToken();
    
    const response = await fetch(`https://api.bol.com/marketing/catalog/v1/products/search?q=${encodeURIComponent(query)}&limit=${limit}&country-code=NL`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Accept-Language': 'nl'
      }
    });

    if (!response.ok) {
      console.error("Bol Search Error:", await response.text());
      return [];
    }

    const data = await response.json();
    
    return (data.products || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      link: p.url, // De affiliate link
      price: p.offers?.bestOffer?.price || 0,
      image: p.media?.[0]?.url || '',
      rating: p.rating?.rating
    }));
  } catch (error) {
    console.error("Bol.com search failed:", error);
    return [];
  }
}

export async function getWeatherRecommendedProducts(weatherCode: number, temp: number): Promise<BolProduct[]> {
  let query = "handige gadgets";
  
  if (temp > 25) query = "ventilator";
  else if (temp > 20) query = "zonnebrand";
  else if (weatherCode >= 60 && weatherCode <= 67) query = "regenpak";
  else if (weatherCode >= 71 && weatherCode <= 77) query = "sneeuwschuiver";
  else if (temp < 5) query = "winterjas";
  
  return searchBolProducts(query, 3);
}
