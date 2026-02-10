import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Camera, MapPin } from 'lucide-react';

const Onboarding = () => {
    const navigate = useNavigate();

    const handleFinish = () => {
        // Save state so this doesn't show again
        localStorage.setItem('waonei_has_onboarded', 'true');
        navigate('/home');
    };

    return (
        <div className="min-h-screen bg-blue-600 flex flex-col items-center justify-center p-6 text-white text-center">
            <div className="space-y-8 max-w-md">

                {/* Logo / Icon Area */}
                <div className="bg-white/20 p-6 rounded-full inline-block mb-4">
                    <Shield size={64} className="text-white" />
                </div>

                <h1 className="text-4xl font-bold tracking-tight">Waonei</h1>
                <p className="text-lg text-blue-100">
                    Crowdsourced Traffic Enforcement. <br/> Safer roads start with you.
                </p>

                {/* Feature List */}
                <div className="grid gap-4 text-left bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <Camera className="shrink-0" />
                        <span>Snap photos or videos of traffic violations.</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Shield className="shrink-0" />
                        <span>AI validates reports automatically.</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <MapPin className="shrink-0" />
                        <span>Help authorities identify high-risk zones.</span>
                    </div>
                </div>

                <button
                    onClick={handleFinish}
                    className="w-full bg-white text-blue-600 font-bold py-4 px-8 rounded-full text-lg shadow-lg hover:bg-gray-100 transition-transform transform active:scale-95"
                >
                    Get Started
                </button>
            </div>
        </div>
    );
};

export default Onboarding;