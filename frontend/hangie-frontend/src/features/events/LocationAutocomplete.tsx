import React, { useState, useEffect } from "react";
import MapIcon from "@/assets/icons/MapIcon";

const LocationAutocomplete = ({ onLocationSelect, error }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.trim().length < 3) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await fetch(
          `https://api.locationiq.com/v1/autocomplete?key=${import.meta.env.VITE_LOCATIONIQ_API_KEY}&q=${encodeURIComponent(query)}&limit=5&accept-language=it`,
        );

        if (!res.ok) throw new Error(`Errore: ${res.status}`);

        const data = await res.json();

        // LocationIQ restituisce un array di luoghi
        if (data && Array.isArray(data)) {
          console.log("apoi data", data);
          const formattedPlaces = data.map((place) => {
            // Stampiamo il singolo elemento per verificare i nomi delle proprietà
            console.log("Analisi singolo luogo:", place);

            return {
              // LocationIQ usa stringhe per lat e lon, quindi usiamo parseFloat per sicurezza
              place_id: `${place.place_id}_${place.osm_id}`,
              formattedAddress: place.display_name || "",
              placeLabel:
                place.display_place ||
                place.name ||
                (place.display_name ? place.display_name.split(",")[0] : ""),
              indirizzo: place.address?.road
                ? `${place.address.road} ${place.address.house_number || ""}`.trim()
                : place.display_name
                  ? place.display_name.split(",")[0]
                  : "",
              citta:
                place.address?.city ||
                place.address?.town ||
                place.address?.village ||
                "",
              cap: place.address?.postcode || "00100",
              latitude: parseFloat(place.lat),
              longitude: parseFloat(place.lon),
            };
          });

          // Filtriamo via eventuali risultati malformati per sicurezza prima di aggiornare lo stato
          setSuggestions(formattedPlaces);
        }
      } catch (err) {
        console.error("Errore Autocomplete con LocationIQ:", err);
      }
    }, 400); // Rimane il debounce di 400ms per non sprecare le 5000 chiamate giornaliere
    return () => clearTimeout(delayDebounce);
  }, [query]);
  useEffect(() => {
    console.log(error);
  }, [error]);
  return (
    <div className="flex flex-col gap-1.5 w-full relative">
      <label className="font-body text-text-1 text-sm font-medium">
        Cerca Indirizzo / Luogo <span className="text-red-500">*</span>
      </label>
      <div
        className={`flex items-center bg-bg-2 rounded-xl transition-all duration-200 p-0.5 ${
          error
            ? "border-red-500 border-2"
            : "focus-within:border-primary ring-2 ring-gray-200"
        }`}
      >
        <div className="h-full flex items-center justify-center pl-2">
          <div className="w-6 h-6">
            <MapIcon color={"#64748b"} />
          </div>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Es: Via del Corso, Roma"
          className="w-full font-body text-sm py-2.5 px-2.5 bg-transparent outline-none text-text-1 placeholder-text-3"
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {/* Tendina dei suggerimenti */}
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute top-[76px] left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-[200] divide-y divide-gray-100">
          {suggestions.map((place) => (
            <li
              key={place.place_id}
              onClick={() => {
                setQuery(place?.formattedAddress || "");
                setIsOpen(false);
                onLocationSelect(place);
              }}
              className="px-4 py-3 text-sm font-body text-text-1 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors"
            >
              <p className="font-semibold">
                {place.placeLabel || place.formattedAddress}
              </p>
              <p className="text-xs text-text-3">{place.formattedAddress}</p>
            </li>
          ))}
        </ul>
      )}

      {error?.message && (
        <p className="text-[11px] font-body font-bold text-red-500 pl-1.5 mt-0.5">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default LocationAutocomplete;
