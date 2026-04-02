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
    HardDrive,
    Car,
    Activity,
    ShieldCheck,
    Clock,
    CloudSun,
    Info,
    ExternalLink,
    AlertCircle
} from 'lucide-react';
import LocationMap from '../../components/Map/LocationMap';
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
            setLoading(true);
            setReport(null);
            setError(null);
            console.log(`Fetching report details for ID: ${id}`);
            try {
                const response = await api.get(`/report/${id}`);
                if (response.data.success) {
                    setReport(response.data.report);
                } else {
                    setError(response.data.message || "Failed to load report details.");
                }
            } catch (err) {
                console.error("Error fetching report:", err);
                setError("Failed to load report details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchReport();
        }
    }, [id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-24 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 font-medium">Loading report details...</p>
        </div>
    );

    if (error) return (
        <div className="p-12 text-center max-w-md mx-auto">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Go Back
            </button>
        </div>
    );

    if (!report) return (
        <div className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Not Found</h2>
            <p className="text-gray-600 mb-6">The requested report could not be found.</p>
            <button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Go Back
            </button>
        </div>
    );

    const isVideo = report.file_type?.startsWith('video/');

    const SectionHeader = ({ icon: Icon, title, color = "text-gray-400" }) => (
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Icon className={cn("h-5 w-5 mr-2", color)} />
            {title}
        </h3>
    );

    const InfoRow = ({ label, value, className = "" }) => (
        <div className={cn("flex justify-between py-2 border-b border-gray-50 last:border-0", className)}>
            <span className="text-gray-500 text-sm">{label}</span>
            <span className="text-gray-900 text-sm font-medium">{value || '-'}</span>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            <div className="flex justify-between items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-500 hover:text-gray-900 transition-colors py-2"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to list
                </button>
                <div className="flex space-x-2">
                    <span className={cn(
                        "px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md",
                        report.priority === 'high' ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                    )}>
                        {report.priority || 'Normal'} Priority
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md">
                        ID: {report.id.substring(0, 8)}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Media & Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Media Viewer */}
                    <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800 relative group aspect-video flex items-center justify-center">
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
                                className="w-full h-full object-contain hover:scale-[1.02] transition-transform duration-500"
                            />
                        )}
                        <div className="absolute top-4 right-4 translate-y-[-10px] group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <a
                                href={report.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-full"
                                title="Open in new tab"
                            >
                                <ExternalLink className="h-5 w-5" />
                            </a>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                            <div className="flex justify-between items-end text-white">
                                <div>
                                    <p className="text-xs font-mono opacity-70 mb-1">{report.file_name}</p>
                                    <p className="text-lg font-bold">Evidence Media</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs opacity-70">Type: {report.file_type}</p>
                                    <p className="text-xs opacity-70">Size: {(report.file_size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Description & Notes */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <SectionHeader icon={FileText} title="Description" color="text-blue-500" />
                            <div className="prose prose-sm text-gray-600 mb-6">
                                {report.description || "No description provided by the reporter."}
                            </div>

                            <SectionHeader icon={ShieldCheck} title="Verification Notes" color="text-green-500" />
                            <div className="prose prose-sm italic text-gray-500">
                                {report.verification_notes || "No verification notes available."}
                            </div>
                        </div>

                        {/* Vehicle Details */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <SectionHeader icon={Car} title="Vehicle Details" color="text-purple-500" />
                            <div className="space-y-1">
                                <InfoRow label="Detected Plate" value={report.vehicle_plate_detected || report.vehicle_details?.plate_number} />
                                <InfoRow label="Plate Confidence" value={report.vehicle_plate_confidence ? `${(report.vehicle_plate_confidence * 100).toFixed(1)}%` : null} />
                                <InfoRow label="Estimated Color" value={report.vehicle_details?.color} />
                                <InfoRow label="Estimated Make" value={report.vehicle_details?.make} />
                                <InfoRow label="Severity Score" value={report.severity_score} />
                            </div>
                        </div>
                    </div>

                    {/* AI Analysis Details */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <SectionHeader icon={Activity} title="AI Analysis Workflow" color="text-orange-500" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Model Version</p>
                                <p className="text-sm font-medium">YOLOv8</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Processing Time</p>
                                <p className="text-sm font-medium">{report.processing_time_seconds ? `${report.processing_time_seconds}s` : 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Confidence Score</p>
                                <div className="flex items-center">
                                    <div className="w-16 h-2 bg-gray-100 rounded-full mr-2 overflow-hidden">
                                        <div
                                            className={cn("h-full", (report.confidence_score || 0) > 0.7 ? "bg-green-500" : (report.confidence_score || 0) > 0.4 ? "bg-yellow-500" : "bg-red-500")}
                                            style={{ width: `${(report.confidence_score || 0) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-sm font-bold">{(report.confidence_score ? (report.confidence_score * 100).toFixed(1) : '0.0')}%</p>
                                </div>
                            </div>
                            <div className="md:col-span-2 lg:col-span-3">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Analysis Result (JSON)</p>
                                <pre className="bg-gray-50 p-4 rounded-xl text-xs overflow-x-auto border border-gray-100 text-gray-700 max-h-48">
                                    {JSON.stringify(report.ai_analysis || {}, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <SectionHeader icon={MapPin} title="Location Details" color="text-red-500" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="col-span-1 space-y-3">
                                <InfoRow label="City" value={report.city} />
                                <InfoRow label="Country" value={report.country} />
                                <InfoRow label="Address" value={report.address} />
                                <div className="pt-2">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Coordinates</p>
                                    <p className="text-sm font-mono">{report.latitude}, {report.longitude}</p>
                                </div>
                                <div className="pt-2">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Description</p>
                                    <p className="text-sm text-gray-700 italic">{report.location_description || 'No specific description provided'}</p>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                {report.latitude && report.longitude ? (
                                    <div className="h-48 relative">
                                        <LocationMap
                                            lat={parseFloat(report.latitude)}
                                            lng={parseFloat(report.longitude)}
                                            description={report.location_description}
                                        />
                                        <div className="absolute bottom-2 left-2 right-2 bg-white/80 backdrop-blur-sm p-2 rounded text-[10px] text-center z-[1000]">
                                            {report.location_description}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-xl h-48 flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200">
                                        <MapPin className="h-6 w-6 mb-2 opacity-20" />
                                        <p className="text-sm italic">No GPS coordinates captured with this report.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden"
                    >
                        <div className={cn(
                            "absolute top-0 right-0 w-1 h-full",
                            report.status === 'verified' ? "bg-green-500" :
                                report.status === 'pending_analysis' ? "bg-yellow-500" :
                                    "bg-red-500"
                        )} />

                        <SectionHeader icon={Info} title="Current Status" color="text-gray-400" />

                        <div className="mb-6">
                            <span className={cn(
                                "px-4 py-2 text-sm font-bold rounded-xl inline-block",
                                report.status === 'verified' ? "bg-green-100 text-green-800" :
                                    report.status === 'no_violation' ? "bg-green-100 text-green-800 border border-green-200" :
                                        report.status === 'pending_analysis' ? "bg-yellow-100 text-yellow-800" :
                                            "bg-gray-100 text-gray-800"
                            )}>
                                {report.status.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <InfoRow label="Violation" value={<span className="capitalize">{report.violation_type?.replace(/_/g, ' ') || 'Detecting...'}</span>} />
                            <InfoRow label="Reported As" value={<span className="capitalize">{report.reported_violation_type?.replace(/_/g, ' ') || report.violation_type?.replace(/_/g, ' ') || '-'}</span>} />
                            <InfoRow label="Visibility" value={report.is_public ? 'Public' : 'Private'} />
                            <InfoRow label="Anonymized" value={report.anonymized ? 'Yes' : 'No'} />
                        </div>
                    </motion.div>

                    {/* Timestamps */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <SectionHeader icon={Clock} title="Timeline" color="text-blue-400" />
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 mr-3 shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Submitted</p>
                                    <p className="text-sm">{format(new Date(report.created_at), 'PPP')}</p>
                                    <p className="text-xs text-gray-400">{format(new Date(report.created_at), 'HH:mm:ss')}</p>
                                </div>
                            </div>
                            {report.processing_started_at && (
                                <div className="flex items-start">
                                    <div className="h-2 w-2 rounded-full bg-yellow-500 mt-1.5 mr-3 shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Processing Started</p>
                                        <p className="text-sm">{format(new Date(report.processing_started_at), 'p')}</p>
                                    </div>
                                </div>
                            )}
                            {report.processing_completed_at && (
                                <div className="flex items-start">
                                    <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5 mr-3 shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">AI Analysis Finished</p>
                                        <p className="text-sm">{format(new Date(report.processing_completed_at), 'p')}</p>
                                    </div>
                                </div>
                            )}
                            {report.updated_at && report.updated_at !== report.created_at && (
                                <div className="flex items-start opacity-50">
                                    <div className="h-2 w-2 rounded-full bg-gray-400 mt-1.5 mr-3 shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Last Updated</p>
                                        <p className="text-sm">{format(new Date(report.updated_at), 'p')}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Context/Environment */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <SectionHeader icon={CloudSun} title="Environment" color="text-yellow-500" />
                        <div className="space-y-2">
                            <InfoRow label="Time of Day" value={report.time_of_day} />
                            <InfoRow label="Weather" value={report.weather_conditions} />
                            <InfoRow label="Evidence Quality" value={report.evidence_quality} />
                        </div>
                    </div>

                    {/* Metadata & Technical */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <SectionHeader icon={Tag} title="Technical Data" color="text-gray-400" />
                        <div className="space-y-2">
                            <InfoRow label="Views" value={report.view_count || 0} />
                            <InfoRow label="Retry Count" value={report.retry_count || 0} />
                            <div className="pt-2">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Tags</p>
                                <div className="flex flex-wrap gap-1">
                                    {(report.tags || []).length > 0 ? report.tags.map(tag => (
                                        <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">{tag}</span>
                                    )) : <span className="text-xs text-gray-400 italic">No tags</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reporter Details */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <SectionHeader icon={User} title="Reporter Data" color="text-gray-400" />
                        <div className="space-y-3">
                            <div className="bg-gray-50 p-3 rounded-xl">
                                <p className="text-xs text-gray-500 font-bold uppercase mb-1">User Agent</p>
                                <p className="text-[10px] text-gray-600 font-mono break-all leading-relaxed">
                                    {report.reporter_user_agent}
                                </p>
                            </div>
                            <InfoRow label="IP Address" value={report.reporter_ip} />
                            <InfoRow label="Reporter ID" value={report.reporter_id ? report.reporter_id.substring(0, 13) + '...' : 'Anonymous'} />
                        </div>
                    </div>

                    {/* Failure / Error Log */}
                    {report.error_message && (
                        <div className="bg-red-50 p-6 rounded-2xl shadow-sm border border-red-100">
                            <SectionHeader icon={AlertTriangle} title="Execution Error" color="text-red-500" />
                            <p className="text-xs text-red-600 font-mono bg-white p-3 rounded-lg border border-red-100">
                                {report.error_message}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportDetail;
