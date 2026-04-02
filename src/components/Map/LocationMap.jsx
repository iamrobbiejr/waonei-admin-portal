import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Vite/Webpack
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import markerRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconRetinaUrl: markerRetina,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationMap = ({ lat, lng, zoom = 15, scrollWheelZoom = false, description }) => {
    if (!lat || !lng) return null;

    return (
        <div className="h-full w-full rounded-xl overflow-hidden shadow-inner border border-gray-200">
            <MapContainer
                center={[lat, lng]}
                zoom={zoom}
                scrollWheelZoom={scrollWheelZoom}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]}>
                    {description && (
                        <Popup>
                            <div className="text-sm font-medium">{description}</div>
                        </Popup>
                    )}
                </Marker>
            </MapContainer>
        </div>
    );
};

export default LocationMap;
