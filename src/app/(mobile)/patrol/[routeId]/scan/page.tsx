'use client';

import Scanner from '@/components/Scanner';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Checkpoint = Database['public']['Tables']['checkpoints']['Row'];

export default function ScanPage({ params }: { params: { routeId: string } }) {
    const searchParams = useSearchParams();
    const checkpointId = searchParams.get('checkpointId');
    const router = useRouter();
    const supabase = createClient();

    const [checkpoint, setCheckpoint] = useState<Checkpoint | null>(null);
    const [step, setStep] = useState<'loading' | 'scanning' | 'verifying' | 'form' | 'submitting'>('loading');
    const [error, setError] = useState<string | null>(null);
    const [debugLog, setDebugLog] = useState<string[]>([]); // For field debugging

    useEffect(() => {
        async function fetchCP() {
            if (!checkpointId) return;
            const { data } = await supabase.from('checkpoints').select('*').eq('id', checkpointId).single();
            setCheckpoint(data);
            setStep('scanning');
        }
        fetchCP();
    }, [checkpointId]);

    const addLog = (msg: string) => setDebugLog(prev => [msg, ...prev]);

    const handleScan = async (decodedText: string) => {
        if (step !== 'scanning') return;

        // 1. Validate QR Token
        if (decodedText !== checkpoint?.qr_code_value) {
            addLog(`❌ QR Mismatch: Scanned ${decodedText.slice(0, 4)}... vs ${checkpoint?.qr_code_value.slice(0, 4)}...`);
            alert(`Invalid QR Code for ${checkpoint?.name}`);
            return;
        }

        addLog('✅ QR Valid. Checking Location...');
        setStep('verifying'); // Pause scanner effectively by UI switch (Scanner unmounts or explicitly paused)

        // 2. Validate Geolocation
        if (!navigator.geolocation) {
            alert("Geolocation not supported");
            setStep('scanning');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const distance = getDistance(
                    pos.coords.latitude,
                    pos.coords.longitude,
                    checkpoint.latitude,
                    checkpoint.longitude
                );
                addLog(`📍 Location: ${distance.toFixed(1)}m away (Max: ${checkpoint.radius_meters}m)`);

                if (distance <= (checkpoint.radius_meters || 20)) {
                    setStep('form');
                } else {
                    alert(`Too far! You are ${distance.toFixed(0)}m away. Move closer.`);
                    setStep('scanning');
                }
            },
            (err) => {
                alert(`Location Error: ${err.message}`);
                setStep('scanning');
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    };

    // Haversine Formula
    function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    const handleSubmitInspection = async () => {
        setStep('submitting');
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not logged in');

            const { error } = await supabase.from('inspections').insert([{
                checkpoint_id: checkpoint!.id,
                inspector_id: user.id,
                status: 'completed',
                gps_lat: checkpoint?.latitude, // In real app, store actual capture coords
                gps_lng: checkpoint?.longitude,
                data: { notes: 'Standard inspection completed via Mobile Web' }
            }]);

            if (error) throw error;
            alert('Inspection Submitted!');
            router.push(`/mobile/patrol/${params.routeId}`); // Go back to list
        } catch (err: any) {
            setError(err.message);
            setStep('form');
        }
    };

    if (step === 'loading') return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            {step === 'scanning' && checkpoint && (
                <div className="w-full max-w-md space-y-4">
                    <div className="text-white text-center">
                        <h2 className="text-xl font-bold">Scan {checkpoint.name}</h2>
                        <p className="text-sm text-gray-400">Find the QR code nearby</p>
                    </div>

                    <Scanner onScanSuccess={handleScan} />

                    <div className="bg-zinc-900 p-2 rounded text-xs text-green-400 font-mono h-32 overflow-y-auto">
                        {debugLog.map((l, i) => <div key={i}>{l}</div>)}
                    </div>

                    <button onClick={() => router.back()} className="text-white w-full text-center mt-4">Cancel</button>
                </div>
            )}

            {step === 'verifying' && (
                <div className="text-white text-center">
                    <div className="animate-spin text-4xl mb-4">🌍</div>
                    <p>Verifying Location...</p>
                </div>
            )}

            {step === 'form' && (
                <div className="w-full max-w-md bg-white rounded-xl p-6 space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">Inspection Form</h2>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <textarea
                            className="w-full border rounded-md p-2"
                            rows={4}
                            placeholder="Describe any issues or observations..."
                        ></textarea>
                    </div>
                    {/* Photo Upload would go here */}

                    <button
                        onClick={handleSubmitInspection}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold shadow-lg active:scale-95 transition-transform"
                    >
                        Submit Inspection
                    </button>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                </div>
            )}
        </div>
    );
}
