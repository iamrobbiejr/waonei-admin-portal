import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Tag,
    AlertTriangle,
    FileText,
    User,
    HardDrive
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const ReportDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await api.get(`/report/${id}`);
                if (response.data.success) {
                    setReport(response.data.report);
                }
            } catch (err) {
                setError("Failed to load report details.");
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [id]);

    if (loading) return <div className="p-12 text-center">Loading...</div>;
    if (error) return <div className="p-12 text-center text-red-500">{error}</div>;
    if (!report) return <div className="p-12 text-center">Report not found</div>;

    const isVideo = report.file_type?.startsWith('video/');

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to reports
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Media & Map */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Media Viewer */}
                    <div className="bg-black rounded-xl overflow-hidden shadow-lg border border-gray-800 relative group aspect-video flex-center">
                        {isVideo ? (
                            <video
                                src={report.file_url}
                                controls
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <img
                                src={report.file_url}
                                alt="Evidence"
                                className="w-full h-full object-contain"
                            />
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                            <p className="text-white text-sm font-mono truncate">{report.file_name}</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-gray-400" />
                            Description
                        </h3>
                        <p className="text-gray-600">
                            {report.description || "No description provided."}
                        </p>
                    </div>

                    {/* Location (Mock Map) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                            Location
                        </h3>
                        {report.latitude && report.longitude ? (
                            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center text-gray-500">
                                {/* In a real app, embed Google Maps or Leaflet here */}
                                <div className="text-center">
                                    <MapPin className="h-8 w-8 mx-auto mb-2 text-red-500" />
                                    <p>{report.latitude}, {report.longitude}</p>
                                    <p className="text-sm mt-1">{report.location_description}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No GPS data available.</p>
                        )}
                    </div>
                </div>

                {/* Sidebar - Meta Data */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                    >
                        <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">Report Status</h3>
                        <div className="flex items-center justify-between mb-4">
                            <span className={cn(
                                "px-3 py-1 text-sm font-semibold rounded-full",
                                report.status === 'verified' ? "bg-green-100 text-green-800" :
                                    report.status === 'pending_analysis' ? "bg-yellow-100 text-yellow-800" :
                                        "bg-gray-100 text-gray-800"
                            )}>
                                {report.status.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-gray-500">
                                Score: {(report.confidence_score * 100).toFixed(0)}%
                            </span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Violation Type</span>
                                <span className="font-medium capitalize">{report.violation_type?.replace('_', ' ') || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Reported As</span>
                                <span className="font-medium capitalize">{report.reported_violation_type?.replace('_', ' ') || '-'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Date</span>
                                <span className="font-medium">{format(new Date(report.created_at), 'PPP')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Time</span>
                                <span className="font-medium">{format(new Date(report.created_at), 'p')}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Asset Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">Asset Details</h3>
                        <div className="space-y-3">
                            <div className="flex items-center text-sm text-gray-600">
                                <HardDrive className="h-4 w-4 mr-3" />
                                <span className="truncate">{report.file_name}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Tag className="h-4 w-4 mr-3" />
                                <span>{(report.file_size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                        </div>
                    </div>

                    {/* Reporter Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">Reporter Info</h3>
                        <div className="space-y-3">
                            <div className="flex items-center text-sm text-gray-600">
                                <User className="h-4 w-4 mr-3" />
                                <span className="truncate" title={report.reporter_user_agent}>{report.reporter_user_agent}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-3" />
                                <span>IP: {report.reporter_ip}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportDetail;
