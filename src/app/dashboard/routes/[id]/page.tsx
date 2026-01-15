'use client';

import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';
import { useEffect, useState, use } from 'react';
import QRCode from 'qrcode';
import Link from 'next/link';
import { Printer } from 'lucide-react';

type Checkpoint = Database['public']['Tables']['checkpoints']['Row'];
type Route = Database['public']['Tables']['routes']['Row'];

export default function RouteDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: routeId } = use(params);
    const [route, setRoute] = useState<Route | null>(null);
    const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [qrImages, setQrImages] = useState<{ [key: string]: string }>({});
    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, [routeId]);

    async function fetchData() {
        try {
            setLoading(true);
            // Fetch Route
            const routeRes = await supabase.from('routes').select('*').eq('id', routeId).single();
            if (routeRes.error) throw routeRes.error;
            setRoute(routeRes.data);

            // Fetch Checkpoints
            const cpRes = await supabase
                .from('checkpoints')
                .select('*')
                .eq('route_id', routeId)
                .order('sequence_order', { ascending: true });
            if (cpRes.error) throw cpRes.error;
            setCheckpoints(cpRes.data);

            // Generate QRs
            const images: { [key: string]: string } = {};
            for (const cp of cpRes.data) {
                images[cp.id] = await QRCode.toDataURL(cp.qr_code_value);
            }
            setQrImages(images);

        } catch (error: any) {
            console.error(error);
            alert('Error fetching data');
        } finally {
            setLoading(false);
        }
    }

    const handleDeleteCheckpoint = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        const { error } = await supabase.from('checkpoints').delete().eq('id', id);
        if (!error) fetchData();
        else alert(error.message);
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!route) return <div className="p-8">Route not found</div>;

    return (
        <div>
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        {route.name}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">{route.description}</p>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0 gap-3">
                    <Link
                        href={`/dashboard/routes/${routeId}/print`}
                        className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                        <Printer className="h-4 w-4 mr-1.5" />
                        Print QR Codes
                    </Link>
                    <Link
                        href={`/patrol/${routeId}`}
                        className="inline-flex items-center rounded-md bg-secondary/80 px-3 py-2 text-sm font-semibold text-secondary-foreground shadow-sm hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                    >
                        Start Patrol
                    </Link>
                    <Link
                        href={`/dashboard/routes/${routeId}/checkpoints/create`}
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Add Checkpoint
                    </Link>
                </div>
            </div>

            <div className="mt-8 flow-root">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Checkpoints ({checkpoints.length})</h3>
                <ul role="list" className="divide-y divide-gray-100 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                    {checkpoints.map((cp) => (
                        <li key={cp.id} className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
                            <div className="flex min-w-0 gap-x-4">
                                <div className="h-12 w-12 flex-none rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                                    {/* QR Preview */}
                                    {qrImages[cp.id] && <img src={qrImages[cp.id]} alt="QR" className="w-full h-full" />}
                                </div>
                                <div className="min-w-0 flex-auto">
                                    <p className="text-sm font-semibold leading-6 text-gray-900">
                                        <span className="absolute inset-x-0 -top-px bottom-0" />
                                        {cp.sequence_order}. {cp.name}
                                    </p>
                                    <p className="mt-1 flex text-xs leading-5 text-gray-500">
                                        Lat: {cp.latitude.toFixed(5)}, Lng: {cp.longitude.toFixed(5)} ({cp.radius_meters}m) - Token: {cp.qr_code_value.substring(0, 8)}...
                                    </p>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-x-4 z-10">
                                <button
                                    onClick={() => handleDeleteCheckpoint(cp.id)}
                                    className="text-sm font-medium text-red-600 hover:text-red-900"
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                    {checkpoints.length === 0 && (
                        <li className="px-4 py-5 text-center text-sm text-gray-500">No checkpoints added yet.</li>
                    )}
                </ul>
            </div>
        </div>
    );
}
