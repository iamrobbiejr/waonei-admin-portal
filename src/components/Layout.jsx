import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, AlertTriangle, Map } from 'lucide-react';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { path: '/home', icon: Home, label: 'Home' },
        { path: '/report', icon: AlertTriangle, label: 'Report' },
        { path: '/hotspots', icon: Map, label: 'Hotspots' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            {/* Responsive Container */}
            <div className="w-full h-screen lg:h-auto lg:max-w-md lg:my-8 lg:rounded-2xl lg:shadow-2xl bg-white flex flex-col relative overflow-hidden">

                {/* Header */}
                <header className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
                    <h1 className="text-xl font-bold text-blue-600">Waonei</h1>
                    <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Anonymous
                    </div>
                </header>

                {/* Main Content Area - Scrollable */}
                <main className="flex-1 overflow-y-auto pb-20">
                    {children}
                </main>

                {/* Bottom Navigation */}
                <nav className="fixed lg:absolute bottom-0 left-0 right-0 lg:left-auto lg:right-auto lg:w-full bg-white border-t border-gray-200 shadow-lg">
                    <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);

                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                                        active
                                            ? 'text-blue-600'
                                            : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                                    <span className={`text-xs mt-1 ${active ? 'font-semibold' : 'font-normal'}`}>
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </nav>
            </div>
        </div>
    );
};

export default Layout;