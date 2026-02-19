import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import {
    Eye,
    MapPin,
    Filter,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Clock,
    User,
    Car
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const PendingReportList = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending_analysis');
    const [violationType, setViolationType] = useState('all');

    const limit = 10;

    useEffect(() => {
        fetchReports();
    }, [page, statusFilter, violationType]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const offset = page * limit;
            const response = await api.get('/pending-violations', {
                params: {
                    limit,
                    offset,
                    status: statusFilter,
                    violation_type: violationType === 'all' ? null : violationType
                }
            });

            if (response.data.success) {
                setReports(response.data.violations);
                setHasMore(response.data.pagination.has_more);
            }
        } catch (error) {
            console.error("Failed to fetch pending reports", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending_analysis': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'failed': return 'bg-orange-100 text-orange-800';
            case 'processed': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div className="flex items-center">
                    <Clock className="h-6 w-6 text-yellow-500 mr-2" />
                    <h1 className="text-2xl font-bold text-gray-800">Pending Reports</h1>
                </div>

                {/* Filters */}
                <div className="flex space-x-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                    >
                        <option value="pending_analysis">Pending Analysis</option>
                        <option value="rejected">Rejected</option>
                        <option value="failed">Failed</option>
                        <option value="processed">Processed (Not Verified)</option>
                    </select>

                    <select
                        value={violationType}
                        onChange={(e) => { setViolationType(e.target.value); setPage(0); }}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                    >
                        <option value="all">All Types</option>
                        <option value="no_helmet">No Helmet</option>
                        <option value="red_light">Red Light</option>
                        <option value="illegal_parking">Illegal Parking</option>
                        <option value="wrong_way">Wrong Way</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No pending reports found</h3>
                        <p className="mt-1 text-sm text-gray-500">Try adjusting your filters.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Report ID
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Violation
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Plate Number
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date Submitted
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reports.map((report) => (
                                    <motion.tr
                                        key={report.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                                            {report.id.substring(0, 8)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={cn("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", getStatusColor(report.status))}>
                                                {report.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 capitalize font-medium">
                                                {report.violation_type?.replace(/_/g, ' ') || report.reported_violation_type?.replace(/_/g, ' ') || 'Unknown'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Conf: {report.confidence_score ? `${(report.confidence_score * 100).toFixed(0)}%` : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Car className="h-4 w-4 mr-1 text-gray-400" />
                                                {report.vehicle_plate_detected || report.vehicle_details?.plate_number || 'Not detected'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center truncate max-w-xs" title={report.address || report.location_description}>
                                                <MapPin className="h-4 w-4 mr-1 text-gray-400 shrink-0" />
                                                {report.city || report.address || report.location_description || 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {format(new Date(report.created_at), 'MMM d, HH:mm')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => navigate(`/report/${report.id}`)}
                                                className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                                            >
                                                <Eye className="h-4 w-4 mr-1" /> View
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={!hasMore}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{page * limit + 1}</span> to <span className="font-medium">{page * limit + reports.length}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </button>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={!hasMore}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PendingReportList;
