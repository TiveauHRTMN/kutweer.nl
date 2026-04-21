
/**
 * B2B Lead Discovery Engine.
 * Gebruikt Google Places API om bedrijven te vinden in specifieke regio's.
 */
export async function findLeadsInCity(city: string, industry: string): Promise<any[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_MAPS_API_KEY missing");

  const query = `${industry} in ${city}`;
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}&language=nl`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.results) return [];

  return data.results.map((r: any) => ({
    businessName: r.name,
    address: r.formatted_address,
    placeId: r.place_id,
    city: city,
    industry: industry,
  }));
}

/**
 * Lead Enrichment: Haalt details op zoals website/telefoon.
 * Opmerking: Google geeft zelden direct e-mails, die moeten we 'raden' of scrapen.
 * Voor nu gebruiken we web-search-style heuristics.
 */
export async function getLeadDetails(placeId: string): Promise<any> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,website,formatted_phone_number&key=${apiKey}&language=nl`;
    
    const res = await fetch(url);
    const data = await res.json();
    return data.result;
}
