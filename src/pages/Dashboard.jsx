import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import {
    BarChart2,
    AlertTriangle,
    CheckCircle,
    Clock,
    XCircle,
    TrendingUp,
    MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
            </div>
            <div className={`p-3 rounded-full ${color}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
        </div>
    </motion.div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/statistics');
                if (response.data.success) {
                    setStats(response.data.statistics);
                }
            } catch (err) {
                console.error("Failed to fetch statistics", err);
                setError("Could not load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full text-red-500">
                <AlertTriangle className="h-6 w-6 mr-2" />
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.email}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Reports"
                    value={stats?.total_reports || 0}
                    icon={FileText}
                    color="bg-blue-500"
                    subtext="All time submissions"
                />
                <StatCard
                    title="Verified Violations"
                    value={stats?.by_status?.verified || 0}
                    icon={CheckCircle}
                    color="bg-green-500"
                    subtext="Confirmed by AI/Admin"
                />
                <StatCard
                    title="Pending Review"
                    value={stats?.by_status?.pending_analysis || 0}
                    icon={Clock}
                    color="bg-yellow-500"
                    subtext="Awaiting analysis"
                />
                <StatCard
                    title="Yesterday's Activity"
                    value={stats?.recent_24h || 0}
                    icon={TrendingUp}
                    color="bg-purple-500"
                    subtext="Reports in last 24h"
                />
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Violation Types */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Violation Types</h3>
                    {stats?.by_violation_type && Object.keys(stats.by_violation_type).length > 0 ? (
                        <div className="space-y-4">
                            {Object.entries(stats.by_violation_type).map(([type, count]) => (
                                <div key={type} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                                        <span className="text-sm font-medium text-gray-700 capitalize">{type.replace('_', ' ')}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{count}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No data available</p>
                    )}
                </motion.div>

                {/* System Health */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span className="text-sm font-medium text-green-700">Database Connection</span>
                            <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full">Active</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-blue-700">Avg. Confidence Score</span>
                                <span className="text-xs text-blue-500">AI Accuracy Indicator</span>
                            </div>
                            <span className="text-lg font-bold text-blue-800">{(stats?.average_confidence * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// Start Icon is needed for the first card, importing here to fix reference error
import { FileText } from 'lucide-react';

export default Dashboard;
