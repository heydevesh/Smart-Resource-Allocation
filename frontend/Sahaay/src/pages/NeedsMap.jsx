import React, { useEffect, useState } from "react";
import axios from "axios";
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";

export default function NeedsMap() {
  const [needs, setNeeds] = useState([]);
  const [selected, setSelected] = useState(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY",
  });

  useEffect(() => {
    fetchNeeds();
  }, []);

  const fetchNeeds = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/needs");

      const needsArray = Object.entries(res.data.needs).map(([id, n]) => ({
        id,
        ...n,
      }));

      setNeeds(needsArray);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (urgency) => {
    if (urgency === "critical") return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
    if (urgency === "medium") return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
    return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
  };

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div>
      <h2>Needs Map</h2>

      <GoogleMap
        zoom={12}
        center={{ lat: 19.076, lng: 72.8777 }}
        mapContainerClassName="map"
      >
        {needs.map((need) => (
          <Marker
            key={need.id}
            position={{ lat: need.lat, lng: need.lng }}
            icon={getIcon(need.urgency)}
            onClick={() => setSelected(need)}
          />
        ))}

        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelected(null)}
          >
            <div>
              <h4>{selected.title}</h4>
              <p>Urgency: {selected.urgency}</p>
              <p>Status: {selected.status}</p>
              <button onClick={() => alert("Assign logic here")}>
                Assign Volunteer
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}