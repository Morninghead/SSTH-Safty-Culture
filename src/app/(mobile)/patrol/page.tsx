'use client';

import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronRight, Map } from 'lucide-react';

type Route = Database['public']['Tables']['routes']['Row'];

export default function MobilePatrolPage() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchRoutes() {
            const { data } = await supabase
                .from('routes')
                .select('*')
                .eq('is_active', true)
                .order('name');
            setRoutes(data || []);
            setLoading(false);
        }
        fetchRoutes();
    }, []);

    if (loading) return <div className="p-4 text-center">Loading routes...</div>;

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4 text-gray-900">Select Patrol Route</h1>
            <div className="space-y-3">
                {routes.map(r => (
                    <Link key={r.id} href={`/patrol/${r.id}`} className="block bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-100 p-2 rounded-lg">
                                <Map className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{r.name}</h3>
                                <p className="text-xs text-gray-500 line-clamp-1">{r.description || 'No description'}</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>
                ))}
                {routes.length === 0 && (
                    <p className="text-center text-gray-500 mt-10">No active routes found.</p>
                )}
            </div>
        </div>
    );
}
