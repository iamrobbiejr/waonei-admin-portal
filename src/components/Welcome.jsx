import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, TrendingUp, Shield } from 'lucide-react';

const Welcome = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-full p-6 space-y-8">

            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">Spot a Violation?</h2>
                <p className="text-gray-500">
                    Report reckless driving, illegal parking, or dangerous behavior instantly.
                </p>
            </div>

            {/* Primary Action Button */}
            <button
                onClick={() => navigate('/report')}
                className="group relative w-56 h-56 bg-red-600 rounded-full flex flex-col items-center justify-center shadow-2xl hover:bg-red-700 transition-all active:scale-95 ring-8 ring-red-100"
            >
                <AlertTriangle size={56} className="text-white mb-2" />
                <span className="text-xl font-bold text-white uppercase tracking-wider">Report Now</span>
            </button>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <div className="p-4 bg-blue-50 rounded-xl text-center">
                    <Shield className="mx-auto mb-2 text-blue-600" size={32} />
                    <div className="text-2xl font-bold text-blue-600">1,234</div>
                    <div className="text-xs text-gray-600">Reports Verified</div>
                </div>
                <div className="p-4 bg-green-50 rounded-xl text-center">
                    <TrendingUp className="mx-auto mb-2 text-green-600" size={32} />
                    <div className="text-2xl font-bold text-green-600">89%</div>
                    <div className="text-xs text-gray-600">Safety Improvement</div>
                </div>
            </div>

            <footer className="text-center text-xs text-gray-400 pt-4">
                &copy; 2025 Waonei Project. Making roads safer together.
            </footer>
        </div>
    );
};

export default Welcome;