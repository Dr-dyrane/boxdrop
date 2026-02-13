/* ─────────────────────────────────────────────────────
   GEOCODING SERVICE
   Uses Mapbox Search API to convert text to coordinates.
   High-precision, premium data for logistics.
   ───────────────────────────────────────────────────── */

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export interface GeocodeResult {
    id: string;
    text: string;
    place_name: string;
    center: [number, number]; // [lng, lat]
}

export const geocodingService = {
    /**
     * Search for addresses/places matching a query.
     */
    async search(query: string, limit: number = 5): Promise<GeocodeResult[]> {
        if (!query || query.length < 3) return [];

        try {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=${limit}`; // Global search

            const response = await fetch(url);
            if (!response.ok) throw new Error("Mapbox search failed");

            const data = await response.json();
            return data.features.map((f: any) => ({
                id: f.id,
                text: f.text,
                place_name: f.place_name,
                center: f.center
            }));
        } catch (error) {
            console.error("Geocoding error:", error);
            return [];
        }
    },

    /**
     * Reverse geocoding: coordinates to address.
     */
    async reverse(lng: number, lat: number): Promise<string | null> {
        try {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&limit=1`;

            const response = await fetch(url);
            if (!response.ok) throw new Error("Mapbox reverse geocoding failed");

            const data = await response.json();
            return data.features[0]?.place_name || null;
        } catch (error) {
            console.error("Reverse geocoding error:", error);
            return null;
        }
    }
};
