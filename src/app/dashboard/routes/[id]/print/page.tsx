'use client';

import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';
import { useEffect, useState, use } from 'react';
import QRCode from 'qrcode';
import Link from 'next/link';
import { ArrowLeft, Printer, Download } from 'lucide-react';

type Checkpoint = Database['public']['Tables']['checkpoints']['Row'];
type Route = Database['public']['Tables']['routes']['Row'];

export default function PrintQRCodesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: routeId } = use(params);
    const [route, setRoute] = useState<Route | null>(null);
    const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
    const [qrImages, setQrImages] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(true);
    const [selectedCheckpoints, setSelectedCheckpoints] = useState<Set<string>>(new Set());
    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, [routeId]);

    async function fetchData() {
        try {
            setLoading(true);
            const routeRes = await supabase.from('routes').select('*').eq('id', routeId).single();
            if (routeRes.error) throw routeRes.error;
            setRoute(routeRes.data);

            const cpRes = await supabase
                .from('checkpoints')
                .select('*')
                .eq('route_id', routeId)
                .order('sequence_order', { ascending: true });
            if (cpRes.error) throw cpRes.error;
            setCheckpoints(cpRes.data);

            // Generate QR codes (larger for printing)
            const images: { [key: string]: string } = {};
            for (const cp of cpRes.data) {
                images[cp.id] = await QRCode.toDataURL(cp.qr_code_value, {
                    width: 400,
                    margin: 2,
                    errorCorrectionLevel: 'H'
                });
            }
            setQrImages(images);

            // Select all by default
            setSelectedCheckpoints(new Set(cpRes.data.map(cp => cp.id)));
        } catch (error: any) {
            console.error(error);
            alert('Error fetching data');
        } finally {
            setLoading(false);
        }
    }

    const toggleCheckpoint = (id: string) => {
        const newSet = new Set(selectedCheckpoints);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedCheckpoints(newSet);
    };

    const selectAll = () => {
        setSelectedCheckpoints(new Set(checkpoints.map(cp => cp.id)));
    };

    const selectNone = () => {
        setSelectedCheckpoints(new Set());
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
    if (!route) return <div className="p-8 text-center text-red-500">Route not found</div>;

    const selectedCps = checkpoints.filter(cp => selectedCheckpoints.has(cp.id));

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Controls - hidden when printing */}
            <div className="print:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-10 shadow-sm">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <Link
                            href={`/dashboard/routes/${routeId}`}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Route
                        </Link>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Printer className="h-4 w-4" />
                            Print Selected ({selectedCps.length})
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{route.name}</h1>
                            <p className="text-sm text-gray-500">Print QR Codes for Checkpoints</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={selectAll}
                                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                                Select All
                            </button>
                            <button
                                onClick={selectNone}
                                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                                Select None
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Checkpoint Selection Grid - hidden when printing */}
            <div className="print:hidden max-w-4xl mx-auto p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {checkpoints.map((cp) => (
                        <div
                            key={cp.id}
                            onClick={() => toggleCheckpoint(cp.id)}
                            className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${selectedCheckpoints.has(cp.id)
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="checkbox"
                                    checked={selectedCheckpoints.has(cp.id)}
                                    onChange={() => toggleCheckpoint(cp.id)}
                                    className="h-4 w-4 text-blue-600 rounded"
                                />
                                <span className="font-medium text-gray-900">#{cp.sequence_order}</span>
                            </div>
                            <p className="text-sm text-gray-700 truncate">{cp.name}</p>
                            {qrImages[cp.id] && (
                                <img src={qrImages[cp.id]} alt="QR" className="w-full mt-2" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Print Preview - shown when printing */}
            <div className="hidden print:block">
                {selectedCps.map((cp, index) => (
                    <div
                        key={cp.id}
                        className="page-break-after-always flex flex-col items-center justify-center min-h-screen p-8"
                        style={{ pageBreakAfter: index < selectedCps.length - 1 ? 'always' : 'auto' }}
                    >
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{route.name}</h1>
                            <p className="text-lg text-gray-600">Safety Patrol Checkpoint</p>
                        </div>

                        {/* QR Code */}
                        <div className="border-4 border-gray-900 p-8 rounded-2xl bg-white shadow-lg">
                            {qrImages[cp.id] && (
                                <img
                                    src={qrImages[cp.id]}
                                    alt={`QR Code for ${cp.name}`}
                                    className="w-64 h-64 md:w-80 md:h-80"
                                    style={{ width: '300px', height: '300px' }}
                                />
                            )}
                        </div>

                        {/* Checkpoint Info */}
                        <div className="text-center mt-8">
                            <div className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-2 rounded-full text-xl font-bold mb-4">
                                Checkpoint #{cp.sequence_order}
                            </div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-2">{cp.name}</h2>
                            <p className="text-lg text-gray-500">
                                Radius: {cp.radius_meters}m • Lat: {cp.latitude.toFixed(5)} • Lng: {cp.longitude.toFixed(5)}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="mt-auto pt-8 text-center text-gray-400 text-sm">
                            <p>Scan this QR code with the Safety Patrol app to verify your location</p>
                            <p className="mt-1">Token: {cp.qr_code_value.substring(0, 8)}...</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:block {
                        display: block !important;
                    }
                }
            `}</style>
        </div>
    );
}
