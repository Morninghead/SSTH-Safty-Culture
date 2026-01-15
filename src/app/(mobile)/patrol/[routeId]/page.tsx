'use client';

import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';
import { useEffect, useState, use } from 'react';
import Scanner from '@/components/Scanner';
import { isLocationValid, calculateDistance } from '@/lib/geofence';
import { ShieldCheck, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';

type Checkpoint = Database['public']['Tables']['checkpoints']['Row'];
type Route = Database['public']['Tables']['routes']['Row'];

export default function PatrolPage({ params }: { params: Promise<{ routeId: string }> }) {
    const { routeId } = use(params);
    const supabase = createClient();
    const [route, setRoute] = useState<Route | null>(null);
    const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
    const [loading, setLoading] = useState(true);

    // Scan State
    const [activeCheckpoint, setActiveCheckpoint] = useState<Checkpoint | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [scanSuccess, setScanSuccess] = useState(false);

    useEffect(() => {
        if (!routeId) return;
        const fetchData = async () => {
            const { data: routeData } = await supabase.from('routes').select('*').eq('id', routeId).single();
            const { data: cpData } = await supabase.from('checkpoints').select('*').eq('route_id', routeId).order('sequence_order');

            setRoute(routeData);
            setCheckpoints(cpData || []);
            setLoading(false);
        };
        fetchData();
    }, [routeId]);

    const handleStartScan = (cp: Checkpoint) => {
        setActiveCheckpoint(cp);
        setValidationError(null);
        setScanSuccess(false);
        setIsScanning(true);
    };

    const handleScanSuccess = async (decodedText: string) => {
        if (!activeCheckpoint) return;
        setIsScanning(false);

        // 1. Validate QR Token
        if (decodedText !== activeCheckpoint.qr_code_value) {
            setValidationError('Invalid QR Code. This does not match the checkpoint.');
            return;
        }

        // 2. Validate Location
        if (!navigator.geolocation) {
            setValidationError('Geolocation not supported. Cannot verify location.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                // Default radius or override
                const radius = activeCheckpoint.radius_meters || 20;

                // Calculate exact distance for feedback
                const dist = calculateDistance(latitude, longitude, activeCheckpoint.latitude, activeCheckpoint.longitude);

                if (dist <= radius) {
                    setScanSuccess(true);
                    // In a real app, you would verify this on server or enable the form now
                    alert(`Checkpoint Verified! (Distance: ${dist.toFixed(1)}m)`);
                } else {
                    setValidationError(`Location Verification Failed. You are ${dist.toFixed(1)}m away (Max: ${radius}m).`);
                }
            },
            (err) => {
                setValidationError('Failed to get GPS location. ' + err.message);
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading Patrol Config...</div>;
    if (!route) return <div className="p-8 text-center text-destructive">Route not found</div>;

    return (
        <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900 text-lg leading-tight">{route.name}</h1>
                        <p className="text-xs text-gray-500">Active Patrol • {checkpoints.length} checkpoints</p>
                    </div>
                </div>
            </div>

            {/* Checkpoint List */}
            <div className="p-4 space-y-4">
                {checkpoints.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <p className="font-medium">No checkpoints found</p>
                        <p className="text-sm mt-1">Add checkpoints to this route first.</p>
                    </div>
                )}
                {checkpoints.map((cp) => (
                    <div
                        key={cp.id}
                        className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm transition-all ${activeCheckpoint?.id === cp.id ? 'ring-2 ring-blue-500' : ''}`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">
                                #{cp.sequence_order}
                            </span>
                            <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {cp.radius_meters}m Radius
                            </span>
                        </div>

                        <h3 className="text-gray-900 font-semibold mb-1">{cp.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">Pending Inspection</p>

                        <button
                            onClick={() => handleStartScan(cp)}
                            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <ShieldCheck className="h-4 w-4" />
                            Scan Checkpoint
                        </button>
                    </div>
                ))}
            </div>

            {/* Scanner Modal Overlay */}
            {isScanning && (
                <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
                    <div className="w-full max-w-sm bg-card rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-border flex justify-between items-center bg-card">
                            <h3 className="font-semibold text-foreground">Scan QR Code</h3>
                            <button onClick={() => setIsScanning(false)} className="text-muted-foreground hover:text-foreground">Close</button>
                        </div>
                        <div className="aspect-square relative bg-black">
                            <Scanner
                                onScanSuccess={handleScanSuccess}
                                onScanError={(err) => console.log(err)}
                                onCancel={() => setIsScanning(false)}
                            />
                        </div>
                        <div className="p-4 bg-muted/20 text-center text-sm text-muted-foreground">
                            Point camera at the checkpoint QR code
                        </div>
                    </div>
                </div>
            )}

            {/* Verification Result Modal */}
            {(validationError || scanSuccess) && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
                    <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-xl p-6 animate-in slide-in-from-bottom duration-200">
                        <div className="flex flex-col items-center text-center gap-4">
                            {validationError ? (
                                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center text-success">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                            )}

                            <div>
                                <h3 className={`font-bold text-lg ${validationError ? 'text-destructive' : 'text-success'}`}>
                                    {validationError ? 'Verification Failed' : 'Verified!'}
                                </h3>
                                <p className="text-muted-foreground text-sm mt-1">
                                    {validationError}
                                    {scanSuccess && 'Location and QR Code match successfully.'}
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setValidationError(null);
                                    if (scanSuccess) {
                                        setScanSuccess(false);
                                        // Proceed to form...
                                    }
                                }}
                                className="w-full py-2.5 bg-secondary text-foreground rounded-lg font-medium text-sm hover:bg-secondary/80"
                            >
                                {validationError ? 'Try Again' : 'Continue'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
