import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapPin, Camera, AlertCircle, CheckCircle, Video, X, RotateCw, Loader2 } from 'lucide-react';

const ReportUpload = () => {
    // Form state
    const [vrn, setVrn] = useState('');
    const [vrnError, setVrnError] = useState('');
    const [violationType, setViolationType] = useState('');
    const [description, setDescription] = useState('');
    const [vehicleColor, setVehicleColor] = useState('');
    const [vehicleMake, setVehicleMake] = useState('');

    // Location state
    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState('');

    // Camera state
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [capturedMedia, setCapturedMedia] = useState(null);
    const [mediaType, setMediaType] = useState('photo'); // 'photo' or 'video'
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    // Status
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error
    const [message, setMessage] = useState('');
    const [reportId, setReportId] = useState(null);

    // Refs
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const recordingIntervalRef = useRef(null);
    const recordedChunksRef = useRef([]);

    // Violation types matching backend
    const violationTypes = [
        { value: 'no_helmet', label: '🏍️ No Helmet' },
        { value: 'red_light', label: '🚦 Red Light Violation' },
        { value: 'wrong_way', label: '↩️ Wrong Way Driving' },
        { value: 'illegal_parking', label: '🅿️ Illegal Parking' },
        { value: 'speeding', label: '⚡ Speeding' },
        { value: 'phone_usage', label: '📱 Phone Usage While Driving' },
        { value: 'seatbelt_violation', label: '🔒 Seatbelt Violation' },
    ];

    // Get location on component mount
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Location error:", error);
                    setLocationError("Unable to get location. Please enable location services.");
                }
            );
        } else {
            setLocationError("Geolocation is not supported by your browser.");
        }
    }, []);

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    // Recording timer and auto-stop at 30 seconds
    useEffect(() => {
        if (isRecording) {
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    const newTime = prev + 1;
                    // Auto-stop at 30 seconds
                    if (newTime >= 30) {
                        stopRecording();
                    }
                    return newTime;
                });
            }, 1000);
        } else {
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
            setRecordingTime(0);
        }
        return () => {
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        };
    }, [isRecording]);

    // Validate VRN format: ABC1234 (3 letters + 4 digits)
    const validateVRN = (value) => {
        const vrnPattern = /^[A-Z]{3}\d{4}$/;
        const upperValue = value.toUpperCase();

        if (!value) {
            setVrnError('VRN is required');
            return false;
        }

        if (!vrnPattern.test(upperValue)) {
            setVrnError('VRN must be 3 letters followed by 4 digits (e.g., ABC1234)');
            return false;
        }

        setVrnError('');
        return true;
    };

    const handleVrnChange = (e) => {
        const value = e.target.value.toUpperCase();
        setVrn(value);
        if (value) {
            validateVRN(value);
        } else {
            setVrnError('');
        }
    };

    // Camera functions
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use back camera on mobile
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: mediaType === 'video'
            });

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Wait for video to load
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play().catch(err => {
                        console.error('Error playing video:', err);
                    });
                };
            }
            setIsCameraActive(true);
        } catch (err) {
            console.error("Error accessing camera:", err);
            if (err.name === 'NotAllowedError') {
                alert("Camera access denied. Please grant camera permissions and try again.");
            } else if (err.name === 'NotFoundError') {
                alert("No camera found on this device.");
            } else {
                alert("Unable to access camera. Please check your device settings.");
            }
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraActive(false);
        setIsRecording(false);
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) {
            console.error('Video or canvas ref not available');
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Ensure video is ready
        if (video.readyState !== video.HAVE_ENOUGH_DATA) {
            alert('Camera not ready. Please wait a moment and try again.');
            return;
        }

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        if (canvas.width === 0 || canvas.height === 0) {
            console.error('Invalid video dimensions');
            alert('Camera not ready. Please try again.');
            return;
        }

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to blob
        canvas.toBlob((blob) => {
            if (blob) {
                console.log('Photo captured successfully:', blob.size, 'bytes');
                setCapturedMedia(blob);
                stopCamera();
            } else {
                console.error('Failed to create blob from canvas');
                alert('Failed to capture photo. Please try again.');
            }
        }, 'image/jpeg', 0.95);
    };

    const startRecording = () => {
        if (!streamRef.current) {
            console.error('No stream available for recording');
            alert('Camera stream not available. Please try again.');
            return;
        }

        recordedChunksRef.current = [];

        // Try different codecs for better compatibility
        let options = { mimeType: 'video/webm;codecs=vp9,opus' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = { mimeType: 'video/webm;codecs=vp8,opus' };
        }
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = { mimeType: 'video/webm' };
        }

        console.log('Recording with:', options.mimeType);

        try {
            mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
        } catch (err) {
            console.error('Failed to create MediaRecorder:', err);
            alert('Video recording not supported on this device.');
            return;
        }

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                recordedChunksRef.current.push(event.data);
                console.log('Recorded chunk:', event.data.size, 'bytes');
            }
        };

        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            console.log('Recording stopped. Total size:', blob.size, 'bytes');
            if (blob.size > 0) {
                setCapturedMedia(blob);
                stopCamera();
            } else {
                console.error('Recording failed - empty blob');
                alert('Recording failed. Please try again.');
            }
        };

        mediaRecorderRef.current.onerror = (event) => {
            console.error('MediaRecorder error:', event);
            alert('Recording error occurred. Please try again.');
        };

        mediaRecorderRef.current.start(100); // Capture data every 100ms
        setIsRecording(true);
        console.log('Recording started');
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const deleteCapture = () => {
        setCapturedMedia(null);
        URL.revokeObjectURL(capturedMedia);
    };

    const retakeMedia = () => {
        deleteCapture();
        startCamera();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields
        if (!capturedMedia) {
            alert('Please capture a photo or video');
            return;
        }

        // Verify blob size
        if (capturedMedia.size === 0) {
            alert('Captured media is empty. Please try capturing again.');
            return;
        }

        console.log('Submitting media:', {
            type: capturedMedia.type,
            size: capturedMedia.size,
            mediaType: mediaType
        });

        if (!validateVRN(vrn)) {
            return;
        }

        if (!violationType) {
            alert('Please select a violation type');
            return;
        }

        if (!location) {
            alert('Location is required. Please enable location services and try again.');
            return;
        }

        setStatus('uploading');
        const formData = new FormData();

        // Convert blob to file with proper extension and type
        let filename, fileType;
        if (mediaType === 'photo') {
            filename = `evidence_${Date.now()}.jpg`;
            fileType = 'image/jpeg';
        } else {
            filename = `evidence_${Date.now()}.webm`;
            fileType = 'video/webm';
        }

        const file = new File([capturedMedia], filename, {
            type: fileType,
            lastModified: Date.now()
        });

        console.log('Created file:', {
            name: file.name,
            type: file.type,
            size: file.size
        });

        formData.append('file', file);
        formData.append('latitude', location.latitude);
        formData.append('longitude', location.longitude);
        formData.append('violation_type', violationType);
        formData.append('vehicle_plate', vrn);

        if (description) formData.append('description', description);
        if (vehicleColor) formData.append('vehicle_color', vehicleColor);
        if (vehicleMake) formData.append('vehicle_make', vehicleMake);

        try {
            console.log('Sending request to server...');
            const response = await axios.post('http://localhost:8000/report', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log('Upload progress:', percentCompleted + '%');
                }
            });

            console.log('Upload successful:', response.data);
            setStatus('success');
            setMessage('Report submitted successfully! AI analysis in progress...');
            setReportId(response.data.report_id);

        } catch (error) {
            console.error('Upload error:', error);
            console.error('Error response:', error.response?.data);
            setStatus('error');
            setMessage(error.response?.data?.detail || 'Failed to submit report. Please try again.');
        }
    };

    const handleReset = () => {
        setStatus('idle');
        setCapturedMedia(null);
        setVrn('');
        setViolationType('');
        setDescription('');
        setVehicleColor('');
        setVehicleMake('');
        setVrnError('');
        setReportId(null);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
                    <h2 className="text-3xl font-bold">Report Traffic Violation</h2>
                    <p className="text-red-100 mt-1">Capture evidence in real-time</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Location Status */}
                    <div className={`flex items-center gap-3 p-4 rounded-xl ${
                        location ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    }`}>
                        <MapPin size={20} />
                        <div className="flex-1">
                            <div className="font-semibold text-sm">
                                {location ? 'Location Detected' : 'Detecting Location...'}
                            </div>
                            <div className="text-xs opacity-80">
                                {location
                                    ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
                                    : locationError || 'Please enable location services'
                                }
                            </div>
                        </div>
                    </div>

                    {status === 'success' ? (
                        <div className="space-y-4">
                            <div className="p-8 bg-green-50 text-green-700 rounded-xl text-center space-y-4 border border-green-200">
                                <CheckCircle size={64} className="mx-auto" />
                                <div>
                                    <p className="font-bold text-lg">{message}</p>
                                    <p className="text-sm mt-2">Report ID: <span className="font-mono">{reportId}</span></p>
                                </div>
                            </div>
                            <button
                                onClick={handleReset}
                                className="w-full bg-blue-600 text-white py-4 px-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg"
                            >
                                Submit Another Report
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Camera Capture Section */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Capture Evidence *
                                </label>

                                {!capturedMedia && !isCameraActive && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMediaType('photo');
                                                startCamera();
                                            }}
                                            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
                                        >
                                            <Camera size={40} className="text-blue-600 mb-2" />
                                            <span className="font-semibold text-gray-700">Take Photo</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMediaType('video');
                                                startCamera();
                                            }}
                                            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all"
                                        >
                                            <Video size={40} className="text-red-600 mb-2" />
                                            <span className="font-semibold text-gray-700">Record Video</span>
                                        </button>
                                    </div>
                                )}

                                {isCameraActive && (
                                    <div className="relative bg-black rounded-xl overflow-hidden">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full aspect-video object-cover"
                                            onLoadedMetadata={() => console.log('Camera loaded successfully')}
                                        />
                                        <canvas ref={canvasRef} className="hidden" />

                                        {/* Camera loading indicator */}
                                        {!videoRef.current?.readyState && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                                <div className="text-white text-center">
                                                    <Loader2 size={48} className="animate-spin mx-auto mb-2" />
                                                    <p>Initializing camera...</p>
                                                </div>
                                            </div>
                                        )}

                                        {isRecording && (
                                            <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
                                                <div className="w-3 h-3 bg-white rounded-full" />
                                                <span className="font-mono font-bold">{formatTime(recordingTime)}</span>
                                            </div>
                                        )}

                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                                            <button
                                                type="button"
                                                onClick={stopCamera}
                                                className="bg-gray-800 bg-opacity-80 text-white p-4 rounded-full hover:bg-opacity-100 transition-all"
                                            >
                                                <X size={24} />
                                            </button>

                                            {mediaType === 'photo' ? (
                                                <button
                                                    type="button"
                                                    onClick={capturePhoto}
                                                    className="bg-white p-6 rounded-full shadow-lg hover:scale-110 transition-transform"
                                                >
                                                    <Camera size={32} className="text-gray-800" />
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={isRecording ? stopRecording : startRecording}
                                                    className={`p-6 rounded-full shadow-lg hover:scale-110 transition-transform ${
                                                        isRecording ? 'bg-red-600' : 'bg-white'
                                                    }`}
                                                >
                                                    {isRecording ? (
                                                        <div className="w-8 h-8 bg-white rounded-sm" />
                                                    ) : (
                                                        <div className="w-8 h-8 bg-red-600 rounded-full" />
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        {mediaType === 'video' && recordingTime >= 30 && (
                                            <div className="absolute top-4 right-4 bg-yellow-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                                                Max 30s reached
                                            </div>
                                        )}
                                    </div>
                                )}

                                {capturedMedia && (
                                    <div className="relative border-2 border-gray-300 rounded-xl overflow-hidden">
                                        {mediaType === 'photo' ? (
                                            <img
                                                src={URL.createObjectURL(capturedMedia)}
                                                alt="Captured"
                                                className="w-full aspect-video object-cover"
                                            />
                                        ) : (
                                            <video
                                                src={URL.createObjectURL(capturedMedia)}
                                                className="w-full aspect-video"
                                                controls
                                            />
                                        )}
                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                                            <button
                                                type="button"
                                                onClick={deleteCapture}
                                                className="bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700 transition-colors shadow-lg flex items-center gap-2"
                                            >
                                                <X size={20} />
                                                Delete
                                            </button>
                                            <button
                                                type="button"
                                                onClick={retakeMedia}
                                                className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2"
                                            >
                                                <RotateCw size={20} />
                                                Retake
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Violation Type */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Violation Type *
                                </label>
                                <select
                                    value={violationType}
                                    onChange={(e) => setViolationType(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                >
                                    <option value="">Select violation type</option>
                                    {violationTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* VRN Input */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Vehicle Registration Number (VRN) *
                                </label>
                                <input
                                    type="text"
                                    value={vrn}
                                    onChange={handleVrnChange}
                                    placeholder="ABC1234"
                                    maxLength={7}
                                    className={`w-full px-4 py-3 border-2 rounded-xl text-lg font-mono uppercase focus:outline-none focus:ring-2 transition-all ${
                                        vrnError
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                    }`}
                                />
                                {vrnError && (
                                    <div className="flex items-center gap-2 text-red-600 text-sm">
                                        <AlertCircle size={16} />
                                        <span>{vrnError}</span>
                                    </div>
                                )}
                            </div>

                            {/* Vehicle Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Vehicle Color
                                    </label>
                                    <input
                                        type="text"
                                        value={vehicleColor}
                                        onChange={(e) => setVehicleColor(e.target.value)}
                                        placeholder="Red, Blue, etc."
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Vehicle Make
                                    </label>
                                    <input
                                        type="text"
                                        value={vehicleMake}
                                        onChange={(e) => setVehicleMake(e.target.value)}
                                        placeholder="Toyota, Honda, etc."
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Additional Details (Optional)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the violation..."
                                    rows={3}
                                    maxLength={500}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                                />
                                <div className="text-xs text-gray-500 text-right">
                                    {description.length}/500
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={!capturedMedia || !vrn || !violationType || !location || status === 'uploading' || vrnError}
                                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-4 rounded-xl font-bold text-lg hover:from-red-700 hover:to-red-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {status === 'uploading' ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <Loader2 size={24} className="animate-spin" />
                                        Uploading & Analyzing...
                                    </span>
                                ) : (
                                    'Submit Report'
                                )}
                            </button>

                            {status === 'error' && (
                                <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-200">
                                    <AlertCircle size={24} />
                                    <span className="text-sm font-medium">{message}</span>
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportUpload;