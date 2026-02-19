import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    BarChart2,
    FileText,
    Users,
    LogOut,
    ShieldAlert,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: BarChart2 },
        { name: 'Verified Reports', href: '/reports', icon: FileText },
        { name: 'Pending Reports', href: '/pending-reports', icon: ShieldAlert },
        { name: 'Users', href: '/users', icon: Users, adminOnly: true },
    ];

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-gray-900 border-r border-gray-800">
                <div className="flex items-center justify-center h-16 border-b border-gray-800">
                    <ShieldAlert className="h-8 w-8 text-blue-500 mr-2" />
                    <span className="text-white text-xl font-bold">Waonei Admin</span>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navigation.map((item) => (
                        (!item.adminOnly || user?.role === 'admin') && (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                    isActive(item.href)
                                        ? "bg-blue-600 text-white shadow-lg"
                                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                )}
                            >
                                <item.icon className="h-5 w-5 mr-3" />
                                {item.name}
                            </Link>
                        )
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={logout}
                        className="flex w-full items-center px-4 py-3 text-sm font-medium text-red-400 rounded-lg hover:bg-gray-800 hover:text-red-300 transition-colors"
                    >
                        <LogOut className="h-5 w-5 mr-3" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Header & Sidebar */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="md:hidden bg-gray-900 shadow-sm z-20 flex justify-between items-center p-4">
                    <div className="flex items-center">
                        <ShieldAlert className="h-8 w-8 text-blue-500 mr-2" />
                        <span className="text-white text-lg font-bold">Waonei Admin</span>
                    </div>
                    <button onClick={toggleMobileMenu} className="text-gray-400 hover:text-white">
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </header>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            className="md:hidden absolute top-16 left-0 w-full bg-gray-900 z-10 border-b border-gray-800 shadow-xl"
                        >
                            <nav className="px-4 py-4 space-y-2">
                                {navigation.map((item) => (
                                    (!item.adminOnly || user?.role === 'admin') && (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={cn(
                                                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                                isActive(item.href)
                                                    ? "bg-blue-600 text-white"
                                                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                            )}
                                        >
                                            <item.icon className="h-5 w-5 mr-3" />
                                            {item.name}
                                        </Link>
                                    )
                                ))}
                                <button
                                    onClick={logout}
                                    className="flex w-full items-center px-4 py-3 text-sm font-medium text-red-400 rounded-lg hover:bg-gray-800 hover:text-red-300 transition-colors"
                                >
                                    <LogOut className="h-5 w-5 mr-3" />
                                    Sign Out
                                </button>
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-100">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
