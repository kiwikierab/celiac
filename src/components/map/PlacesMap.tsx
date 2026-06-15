"use client";

import { useEffect, useRef } from "react";
import type { Place } from "@/types";
import { getSafetyTags } from "@/lib/utils";

// Leaflet is loaded only on the client side
// See: https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading#skipping-ssr

interface MapProps {
  places: Place[];
  center?: [number, number];
  zoom?: number;
  selectedId?: string;
}

export default function PlacesMap({
  places,
  center = [-37.82, 144.98],
  zoom = 12,
  selectedId,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletMapRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    // Dynamic import to avoid SSR issues with Leaflet
    import("leaflet").then((L) => {
      // Fix default marker icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!).setView(center, zoom);
      leafletMapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      places.forEach((place) => {
        const tags = getSafetyTags(place);
        const safetyRating = place.avg_safety_rating ?? 0;
        const safetyClass = safetyRating >= 4 ? "🟢" : safetyRating >= 3 ? "🟡" : "🔴";

        const popupContent = `
          <div style="min-width:180px">
            <strong style="font-size:14px">${place.name}</strong>
            <div style="font-size:12px;color:#666;margin:2px 0">${place.city}</div>
            ${safetyClass} Safety: ${safetyRating > 0 ? safetyRating.toFixed(1) + "/5" : "No data"}
            <br/>
            ${tags.length > 0 ? tags.join(" · ") : ""}
            <br/>
            <a href="/places/${place.id}" style="color:#15803d;font-size:12px;font-weight:600">
              View details →
            </a>
          </div>
        `;

        const marker = L.marker([place.lat, place.lng])
          .bindPopup(popupContent)
          .addTo(map);

        if (selectedId === place.id) {
          marker.openPopup();
        }
      });
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-xl"
      aria-label="Map of coeliac-safe venues"
    />
  );
}
