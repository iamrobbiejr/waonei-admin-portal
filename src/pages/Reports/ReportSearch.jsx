import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import {
    Search,
    Filter,
    Download,
    Eye,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Calendar,
    Database,
    X,
    RefreshCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const ReportSearch = () => {
    const navigate = useNavigate();
    
    // Filter State
    const [filters, setFilters] = useState({
        status: 'all',
        violation_type: 'all',
        start_date: '',
        end_date: ''
    });
    
    // Data State
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    
    const limit = 15;

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const fetchReports = async (pageNumber = 0) => {
        setLoading(true);
        setHasSearched(true);
        try {
            const offset = pageNumber * limit;
            const params = {
                limit,
                offset,
                status: filters.status === 'all' ? null : filters.status,
                violation_type: filters.violation_type === 'all' ? null : filters.violation_type,
                start_date: filters.start_date || null,
                end_date: filters.end_date || null
            };

            const response = await api.get('/reports/search', { params });

            if (response.data.success) {
                setReports(response.data.violations);
                setTotalCount(response.data.total_count);
                setHasMore(response.data.pagination.has_more);
                setPage(pageNumber);
            }
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchReports(0);
    };

    const handleExport = async () => {
        try {
            const params = {
                status: filters.status === 'all' ? null : filters.status,
                violation_type: filters.violation_type === 'all' ? null : filters.violation_type,
                start_date: filters.start_date || null,
                end_date: filters.end_date || null
            };
            
            const response = await api.get('/analytics/export', {
                params,
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `waonei_export_${format(new Date(), 'yyyyMMdd')}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Export failed", err);
            alert("Failed to export reports.");
        }
    };

    const resetFilters = () => {
        setFilters({
            status: 'all',
            violation_type: 'all',
            start_date: '',
            end_date: ''
        });
        setReports([]);
        setHasSearched(false);
    };

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Report Search</h1>
                    <p className="text-gray-500 mt-1 font-medium">Query the central violation database with multi-parameter filters.</p>
                </div>
                {hasSearched && (
                    <button 
                        onClick={resetFilters}
                        className="flex items-center text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-widest"
                    >
                        <X className="h-4 w-4 mr-1" /> Clear Results
                    </button>
                )}
            </div>

            {/* Filter Panel */}
            <motion.div 
                layout
                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100"
            >
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Violation Status</label>
                        <div className="relative">
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 appearance-none"
                            >
                                <option value="all">All Statuses</option>
                                <option value="verified">Verified</option>
                                <option value="pending_analysis">Pending Analysis</option>
                                <option value="no_violation">No Violation</option>
                                <option value="rejected">Rejected</option>
                                <option value="failed">Failed</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Violation Type</label>
                        <div className="relative">
                            <select
                                name="violation_type"
                                value={filters.violation_type}
                                onChange={handleFilterChange}
                                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 appearance-none"
                            >
                                <option value="all">All Types</option>
                                <option value="no_helmet">No Helmet</option>
                                <option value="red_light">Red Light</option>
                                <option value="illegal_parking">Illegal Parking</option>
                                <option value="wrong_way">Wrong Way</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date From</label>
                        <div className="relative">
                            <input
                                type="date"
                                name="start_date"
                                value={filters.start_date}
                                onChange={handleFilterChange}
                                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date To</label>
                        <div className="relative">
                            <input
                                type="date"
                                name="end_date"
                                value={filters.end_date}
                                onChange={handleFilterChange}
                                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-4 flex justify-end gap-3 pt-4 border-t border-gray-50">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
                        >
                            {loading ? <RefreshCcw className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                            Apply Filters
                        </button>
                    </div>
                </form>
            </motion.div>

            {/* Results Section */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    {!hasSearched ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-24 text-center space-y-4"
                        >
                            <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                                <Database className="h-12 w-12 text-gray-300 mx-auto" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-800 tracking-tight">Ready for Queries</h3>
                                <p className="text-gray-400 font-medium max-w-xs mx-auto">Select your parameters above and click "Apply Filters" to retrieve violation records.</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-center px-4">
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                                    Found <span className="text-blue-600 font-black">{totalCount}</span> records matching criteria
                                </p>
                                <button
                                    onClick={handleExport}
                                    className="flex items-center text-sm font-black text-gray-900 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
                                >
                                    <Download className="h-4 w-4 mr-2 text-blue-600" />
                                    Export Excel
                                </button>
                            </div>

                            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                                {loading && (
                                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                        <RefreshCcw className="h-8 w-8 text-blue-600 animate-spin" />
                                    </div>
                                )}
                                
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-100">
                                        <thead className="bg-gray-50/50">
                                            <tr>
                                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Violation Type</th>
                                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Confidence</th>
                                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Reported</th>
                                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {reports.map((report) => (
                                                <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-8 py-5 text-sm font-mono text-gray-400">
                                                        {report.id.substring(0, 8)}...
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className={cn(
                                                            "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg inline-block",
                                                            report.status === 'verified' ? "bg-green-100 text-green-700" :
                                                            report.status === 'pending_analysis' ? "bg-yellow-100 text-yellow-700" :
                                                            "bg-gray-100 text-gray-600"
                                                        )}>
                                                            {report.status.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-sm font-black text-gray-900 capitalize">
                                                            {report.violation_type?.replace(/_/g, ' ') || 'Unknown'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                <div 
                                                                    className={cn("h-full", (report.confidence_score || 0) > 0.7 ? "bg-green-500" : "bg-yellow-500")}
                                                                    style={{ width: `${(report.confidence_score || 0) * 100}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-black text-gray-500">
                                                                {(report.confidence_score ? (report.confidence_score * 100).toFixed(0) : '0')}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-sm font-bold text-gray-500">
                                                        {format(new Date(report.created_at), 'MMM d, yyyy HH:mm')}
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <button
                                                            onClick={() => navigate(`/report/${report.id}`)}
                                                            className="p-2.5 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                        >
                                                            <Eye className="h-5 w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="px-8 py-6 bg-gray-50/50 flex items-center justify-between">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Showing <span className="text-gray-900">{page * limit + 1}</span> - <span className="text-gray-900">{Math.min((page + 1) * limit, totalCount)}</span> of <span className="text-gray-900">{totalCount}</span>
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => fetchReports(page - 1)}
                                            disabled={page === 0 || loading}
                                            className="p-2.5 bg-white border border-gray-100 rounded-xl disabled:opacity-30 hover:shadow-sm transition-all"
                                        >
                                            <ChevronLeft className="h-5 w-5 text-gray-600" />
                                        </button>
                                        <button
                                            onClick={() => fetchReports(page + 1)}
                                            disabled={!hasMore || loading}
                                            className="p-2.5 bg-white border border-gray-100 rounded-xl disabled:opacity-30 hover:shadow-sm transition-all"
                                        >
                                            <ChevronRight className="h-5 w-5 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const ChevronDown = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
    </svg>
);

export default ReportSearch;
