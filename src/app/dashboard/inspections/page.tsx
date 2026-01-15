'use client';

import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';
import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

// Join query type definition would be complex manually, so using 'any' for joined relations for speed
type InspectionWithDetails = {
    id: string;
    status: string;
    recorded_at: string;
    data: any;
    checkpoints: { name: string; route_id: string };
    profiles: { full_name: string };
};

export default function InspectionsPage() {
    const [inspections, setInspections] = useState<InspectionWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchInspections();
    }, []);

    async function fetchInspections() {
        try {
            const { data, error } = await supabase
                .from('inspections')
                .select(`
            id, status, recorded_at, data,
            checkpoints ( name, route_id ),
            profiles ( full_name )
        `)
                .order('recorded_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setInspections(data as any);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Recent Inspections</h1>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                    {loading ? <div className="p-4">Loading...</div> : inspections.length === 0 ? <div className="p-4 text-gray-500">No inspections found.</div> : null}

                    {inspections.map((insp) => (
                        <li key={insp.id}>
                            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <p className="truncate text-sm font-medium text-indigo-600">{insp.checkpoints?.name || 'Unknown Checkpoint'}</p>
                                    <div className="ml-2 flex flex-shrink-0">
                                        <p className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${insp.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {insp.status}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="flex items-center text-sm text-gray-500">
                                            <CheckCircle className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                                            {insp.profiles?.full_name || 'Unknown Inspector'}
                                        </p>
                                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                            Notes: {insp.data?.notes || 'No notes'}
                                        </p>
                                    </div>
                                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                        <p>
                                            {new Date(insp.recorded_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
