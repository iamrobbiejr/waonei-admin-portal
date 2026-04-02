import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import HeatmapLayer from '../../components/Map/HeatmapLayer';
import api from '../../lib/api';
import { Map as MapIcon, Filter, AlertCircle, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ViolationHeatmap = () => {
    const [points, setPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [violationType, setViolationType] = useState('all');
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAllVerifiedReports();
    }, [violationType]);

    const fetchAllVerifiedReports = async () => {
        setLoading(true);
        setError(null);
        try {
            let allPoints = [];
            let offset = 0;
            let hasMore = true;
            const limit = 100;

            // Fetch in pages to get all coordinates
            while (hasMore && allPoints.length < 1000) { // Safety limit for now
                const response = await api.get('/violations', {
                    params: {
                        status: 'verified',
                        violation_type: violationType === 'all' ? null : violationType,
                        limit,
                        offset,
                        min_confidence: 0.1 // Lowered for mapping purposes
                    }
                });

                if (response.data.success) {
                    const newPoints = response.data.violations
                        .filter(v => v.latitude && v.longitude)
                        .map(v => [parseFloat(v.latitude), parseFloat(v.longitude), 1.0]); // [lat, lng, intensity]
                    
                    allPoints = [...allPoints, ...newPoints];
                    hasMore = response.data.pagination.has_more;
                    offset += limit;
                } else {
                    hasMore = false;
                }
            }

            setPoints(allPoints);
        } catch (err) {
            console.error("Failed to fetch heatmap data", err);
            setError("Unable to load geographic data for the heatmap.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-12rem)] flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div className="flex items-center">
                    <MapIcon className="h-6 w-6 text-red-500 mr-2" />
                    <h1 className="text-2xl font-bold text-gray-800">Violation Heatmap</h1>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="flex items-center text-xs text-gray-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                        <Info className="h-3 w-3 mr-1" />
                        Showing {points.length} verified coordinate points
                    </div>
                    <div className="relative">
                        <select
                            value={violationType}
                            onChange={(e) => setViolationType(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm appearance-none bg-white font-medium"
                        >
                            <option value="all">All Violations</option>
                            <option value="no_helmet">No Helmet</option>
                            <option value="red_light">Red Light</option>
                            <option value="illegal_parking">Illegal Parking</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                            <Filter className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 z-[2000] bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                        <p className="text-gray-600 font-medium animate-pulse">Generating heatmap data...</p>
                    </div>
                )}

                {error && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[2000] bg-red-50 text-red-700 px-6 py-3 rounded-full border border-red-100 shadow-xl flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        {error}
                    </div>
                )}

                <MapContainer
                    center={[0, 0]} // Will be adjusted by points or set a sensible default
                    zoom={2}
                    scrollWheelZoom={true}
                    className="h-full w-full grayscale-[20%]"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    <AnimatePresence>
                        {points.length > 0 && <HeatmapLayer points={points} />}
                    </AnimatePresence>

                    {/* Auto-center map on points if available */}
                    <MapBounds points={points} />
                </MapContainer>

                {/* Legend */}
                <div className="absolute bottom-6 right-6 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-white/20 max-w-xs transition-all hover:scale-105">
                    <h4 className="text-sm font-bold text-gray-800 mb-2">Activity Density</h4>
                    <div className="h-3 w-full rounded-full bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500 mb-2" />
                    <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                        <span>Low</span>
                        <span>Medium</span>
                        <span>High</span>
                    </div>
                    <p className="mt-3 text-[10px] text-gray-400 leading-tight">
                        Visualizing areas with high concentrations of verified traffic violations based on GPS metadata.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Helper component to fit map bounds to points
const MapBounds = ({ points }) => {
    const map = useMap();
    
    useEffect(() => {
        if (points.length > 0) {
            const bounds = L.latLngBounds(points.map(p => [p[0], p[1]]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [map, points]);
    
    return null;
};

export default ViolationHeatmap;
