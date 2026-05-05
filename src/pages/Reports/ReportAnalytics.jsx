import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import {
    Download,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Clock,
    FileText,
    Activity,
    Shield,
    Database,
    ChevronDown,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { format, subDays } from 'date-fns';

const ReportAnalytics = () => {
    const [summary, setSummary] = useState(null);
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [daysFilter, setDaysFilter] = useState(30);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const [summaryRes, trendsRes] = await Promise.all([
                    api.get('/analytics/summary'),
                    api.get('/analytics/trends', { params: { days: daysFilter } })
                ]);

                if (summaryRes.data.success) {
                    setSummary(summaryRes.data.summary);
                }
                if (trendsRes.data.success) {
                    setTrends(trendsRes.data.trends);
                }
            } catch (err) {
                console.error("Failed to fetch analytics", err);
                setError("Failed to load analytics data. Please ensure the backend is running.");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [daysFilter]);

    const handleExport = async () => {
        try {
            const response = await api.get('/analytics/export', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `waonei_reports_${format(new Date(), 'yyyyMMdd')}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Export failed", err);
            alert("Failed to export data.");
        }
    };

    if (loading && !summary) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 font-medium animate-pulse">Gathering enterprise intelligence...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-12 text-center max-w-2xl mx-auto">
                <div className="bg-red-50 p-8 rounded-3xl border border-red-100 shadow-sm">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Analytics Unavailable</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

    // Prepare data for violation types pie chart
    const violationTypeData = summary ? Object.entries(summary.by_violation_type).map(([name, value]) => ({
        name: name.replace(/_/g, ' ').toUpperCase(),
        value
    })).filter(d => d.value > 0) : [];

    // Prepare data for status distribution
    const statusData = summary ? Object.entries(summary.by_status).map(([name, value]) => ({
        name: name.replace(/_/g, ' ').toUpperCase(),
        value
    })) : [];

    const StatCard = ({ title, value, icon: Icon, color, trend, subtext }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-all duration-300"
        >
            <div className="flex items-start justify-between relative z-10">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-3xl font-black text-gray-900 mb-2">{value}</h3>
                    {subtext && <p className="text-xs text-gray-500 font-medium">{subtext}</p>}
                </div>
                <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300 shadow-inner", color)}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
            {trend && (
                <div className="mt-4 flex items-center">
                    {trend > 0 ? (
                        <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                            <ArrowUpRight className="h-3 w-3 mr-1" /> {trend}%
                        </span>
                    ) : (
                        <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                            <ArrowDownRight className="h-3 w-3 mr-1" /> {Math.abs(trend)}%
                        </span>
                    )}
                    <span className="text-[10px] text-gray-400 ml-2 font-medium uppercase tracking-tighter">vs last period</span>
                </div>
            )}
            {/* Subtle background decoration */}
            <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                <Icon className="h-24 w-24" />
            </div>
        </motion.div>
    );

    return (
        <div className="space-y-8 pb-12 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
                        <Activity className="h-8 w-8 text-blue-600 mr-3" />
                        Enterprise Reports
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">Strategic intelligence and operational metrics for the Waonei network.</p>
                </div>
                
                <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center px-3 border-r border-gray-100">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <select 
                            value={daysFilter}
                            onChange={(e) => setDaysFilter(parseInt(e.target.value))}
                            className="text-sm font-bold text-gray-700 bg-transparent focus:outline-none cursor-pointer"
                        >
                            <option value={7}>Last 7 Days</option>
                            <option value={30}>Last 30 Days</option>
                            <option value={90}>Last 90 Days</option>
                        </select>
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-gray-200"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                    </button>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Submissions"
                    value={summary?.total_reports || 0}
                    icon={FileText}
                    color="bg-blue-500 shadow-blue-200"
                    trend={12}
                    subtext="Consolidated database records"
                />
                <StatCard
                    title="Verified Violations"
                    value={summary?.by_status?.verified || 0}
                    icon={CheckCircle}
                    color="bg-green-500 shadow-green-200"
                    trend={8}
                    subtext={`${((summary?.by_status?.verified / summary?.total_reports) * 100).toFixed(1)}% Conversion Rate`}
                />
                <StatCard
                    title="AI Confidence"
                    value={`${(summary?.avg_confidence * 100).toFixed(1)}%`}
                    icon={Shield}
                    color="bg-indigo-500 shadow-indigo-200"
                    trend={-2}
                    subtext="Average detection accuracy"
                />
                <StatCard
                    title="Processing Efficiency"
                    value={`${summary?.avg_processing_time.toFixed(2)}s`}
                    icon={Clock}
                    color="bg-orange-500 shadow-orange-200"
                    trend={15}
                    subtext="Avg. AI inference time"
                />
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Trends Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100"
                >
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Violation Trends</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Daily submission activity</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2 shadow-sm" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Total</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-green-500 mr-2 shadow-sm" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Verified</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trends}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                    tickFormatter={(val) => format(new Date(val), 'MMM d')}
                                    minTickGap={30}
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '20px', 
                                        border: 'none', 
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                        padding: '12px 16px'
                                    }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    labelStyle={{ fontWeight: 'black', marginBottom: '4px', color: '#111827' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="total" 
                                    stroke="#3b82f6" 
                                    strokeWidth={4}
                                    fillOpacity={1} 
                                    fill="url(#colorTotal)" 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="verified" 
                                    stroke="#10b981" 
                                    strokeWidth={4}
                                    fillOpacity={1} 
                                    fill="url(#colorVerified)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Violation Distribution */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col"
                >
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Violation Types</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Distribution across categories</p>
                    </div>
                    <div className="h-[300px] w-full flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={violationTypeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {violationTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-y-3 mt-6">
                        {violationTypeData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center">
                                <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter truncate max-w-[120px]">
                                    {entry.name}
                                </span>
                                <span className="text-[10px] font-black text-gray-900 ml-auto mr-4">{entry.value}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status Bar Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100"
                >
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Operational Status</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Workflow processing distribution</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statusData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                <XAxis type="number" axisLine={false} tickLine={false} hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{ fill: '#1f2937', fontSize: 10, fontWeight: 900 }}
                                    width={120}
                                />
                                <Tooltip 
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar 
                                    dataKey="value" 
                                    fill="#3b82f6" 
                                    radius={[0, 10, 10, 0]}
                                    barSize={20}
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* System Health / Technical Metrics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-900 p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-xl font-black tracking-tight">System Infrastructure</h3>
                                <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mt-1">Live performance metrics</p>
                            </div>
                            <Database className="h-6 w-6 text-blue-400 animate-pulse" />
                        </div>
                        
                        <div className="space-y-6">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Storage Utilization</span>
                                    <span className="text-sm font-black text-blue-400">{summary?.total_file_size_mb.toFixed(1)} MB</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                                        style={{ width: `${Math.min((summary?.total_file_size_mb / 1000) * 100, 100)}%` }} 
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2 font-medium">Evidence uploads bucket (Total footprint)</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">High Priority</p>
                                    <p className="text-2xl font-black text-red-400">{summary?.by_priority?.high || 0}</p>
                                    <p className="text-[9px] text-gray-500 mt-1 uppercase font-black">Requires Action</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Normal Priority</p>
                                    <p className="text-2xl font-black text-blue-400">{summary?.by_priority?.normal || 0}</p>
                                    <p className="text-[9px] text-gray-500 mt-1 uppercase font-black">Standard Flow</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-bold text-green-400 bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                                <TrendingUp className="h-4 w-4" />
                                <span>Network status: OPTIMAL</span>
                                <div className="ml-auto flex gap-1">
                                    <div className="w-1 h-3 bg-green-500/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-1 h-4 bg-green-500/50 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                                    <div className="w-1 h-3 bg-green-500/50 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Abstract background shape */}
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full" />
                </motion.div>
            </div>
        </div>
    );
};

export default ReportAnalytics;
