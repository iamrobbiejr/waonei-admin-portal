import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import HeatmapLayer from './HeatmapLayer';
import api from '../../lib/api';
import { Loader2 } from 'lucide-react';
import L from 'leaflet';

const AutoFit = ({ points }) => {
    const map = useMap();
    
    useEffect(() => {
        if (map && points.length > 0) {
            const bounds = L.latLngBounds(points.map(p => [p[0], p[1]]));
            map.fitBounds(bounds, { padding: [20, 20] });
        }
    }, [map, points]);
    return null;
}

const DashboardHeatmap = () => {
    const [points, setPoints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPoints = async () => {
            try {
                // Fetch first 100 verified reports for the dashboard preview
                const response = await api.get('/violations', {
                    params: {
                        status: 'verified',
                        limit: 100,
                        min_confidence: 0.3
                    }
                });

                if (response.data.success) {
                    const coords = response.data.violations
                        .filter(v => v.latitude && v.longitude)
                        .map(v => [parseFloat(v.latitude), parseFloat(v.longitude), 1.0]);
                    setPoints(coords);
                }
            } catch (err) {
                console.error("Dashboard heatmap fetch failed", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPoints();
    }, []);

    return (
        <div className="h-64 relative rounded-xl overflow-hidden border border-gray-100 bg-white">
            {loading ? (
                <div className="absolute inset-0 z-10 bg-gray-50 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                </div>
            ) : (
                <MapContainer
                    center={[0, 0]}
                    zoom={1}
                    scrollWheelZoom={false}
                    className="h-full w-full grayscale-[30%]"
                    zoomControl={false}
                    attributionControl={false}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {points.length > 0 && <HeatmapLayer points={points} options={{ radius: 15, blur: 10 }} />}
                    <AutoFit points={points} />
                </MapContainer>
            )}
            <div className="absolute top-2 right-2 z-[1000] bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-gray-500 border border-gray-200">
                Geographic Heatmap Preview
            </div>
        </div>
    );
};

export default DashboardHeatmap;
