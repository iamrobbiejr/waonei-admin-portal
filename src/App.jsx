import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReportList from './pages/Reports/ReportList';
import PendingReportList from './pages/Reports/PendingReportList';
import NoViolationReportList from './pages/Reports/NoViolationReportList';
import ViolationHeatmap from './pages/Reports/ViolationHeatmap';
import ReportDetail from './pages/Reports/ReportDetail';
import CreateUser from './pages/Users/CreateUser';
import AdminLayout from './components/admin/AdminLayout';

// Legacy Components (Optional - kept for reference or if needed later)
// import Onboarding from './components/Onboarding';
// import Welcome from './components/Welcome';
// import ReportUpload from './components/ReportUpload';
// import Layout from './components/Layout';

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminRoute = () => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user?.role === 'admin' ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />

                    {/* Redirect root to dashboard (will trigger login if not auth) */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />

                    {/* Protected Admin Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<AdminLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />

                            <Route path="/reports" element={<ReportList />} />
                            <Route path="/pending-reports" element={<PendingReportList />} />
                            <Route path="/no-violations" element={<NoViolationReportList />} />
                            <Route path="/heatmap" element={<ViolationHeatmap />} />
                            <Route path="/report/:id" element={<ReportDetail />} />

                            {/* Admin Only Route */}
                            <Route element={<AdminRoute />}>
                                <Route path="/users" element={<CreateUser />} />
                            </Route>
                        </Route>
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;