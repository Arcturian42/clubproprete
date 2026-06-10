"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

interface CompanyMapProps {
  companies: Array<{
    id: string;
    name: string;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
  }>;
}

function MapContent({ companies }: CompanyMapProps) {
  const [MapContainer, setMapContainer] = useState<any>(null);
  const [TileLayer, setTileLayer] = useState<any>(null);
  const [Marker, setMarker] = useState<any>(null);
  const [Popup, setPopup] = useState<any>(null);

  useEffect(() => {
    import("react-leaflet").then((mod) => {
      setMapContainer(() => mod.MapContainer);
      setTileLayer(() => mod.TileLayer);
      setMarker(() => mod.Marker);
      setPopup(() => mod.Popup);
    });
  }, []);

  if (!MapContainer) {
    return (
      <div className="h-[500px] surface flex items-center justify-center">
        Chargement de la carte…
      </div>
    );
  }

  const companiesWithCoords = companies.filter(
    (c): c is typeof c & { latitude: number; longitude: number } =>
      c.latitude !== null && c.longitude !== null
  );

  return (
    <MapContainer
      center={[46.8, 2.3]}
      zoom={6}
      scrollWheelZoom={false}
      style={{ height: "500px", width: "100%", borderRadius: "20px" }}
      className="border-2 border-slate-900"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {companiesWithCoords.map((company) => (
        <Marker
          key={company.id}
          position={[company.latitude, company.longitude]}
        >
          <Popup>
            <div className="space-y-1">
              <p className="font-bold text-slate-900">{company.name}</p>
              {company.city && (
                <p className="text-sm text-slate-500">{company.city}</p>
              )}
              <Link
                href={`/annuaire/societes/${company.id}`}
                className="text-indigo-600 text-sm font-bold inline-block mt-1"
              >
                Voir la fiche →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default function CompanyMap({ companies }: CompanyMapProps) {
  return <MapContent companies={companies} />;
}
