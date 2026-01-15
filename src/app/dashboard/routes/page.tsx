'use client';

import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus, ArrowRight } from 'lucide-react';


type Route = Database['public']['Tables']['routes']['Row'];

export default function RoutesPage() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchRoutes();
    }, []);

    async function fetchRoutes() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('routes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRoutes(data || []);
        } catch (error) {
            console.error('Error fetching routes:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Routes</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Manage patrol routes and their checkpoints.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <Link
                        href="/dashboard/routes/create"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Add Route
                    </Link>
                </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-border/50">
                    <thead className="bg-muted/50">
                        <tr>
                            <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-6">
                                <span className="sr-only">Edit</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 bg-card">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">Loading routes...</td>
                            </tr>
                        ) : routes.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-12 text-center text-sm text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center">
                                        <p className="text-base font-semibold">No routes found</p>
                                        <p className="mt-1">Get started by creating a new patrol route.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            routes.map((route) => (
                                <tr key={route.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-foreground">{route.name}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground max-w-xs truncate">{route.description || '-'}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${route.is_active
                                            ? 'bg-success/10 text-success ring-success/20'
                                            : 'bg-muted text-muted-foreground ring-border'
                                            }`}>
                                            {route.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                                        <Link
                                            href={`/dashboard/routes/${route.id}`}
                                            className="inline-flex items-center gap-1 rounded-md bg-secondary/80 px-3 py-1.5 text-xs font-semibold text-secondary-foreground shadow-sm hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary transition-all"
                                        >
                                            Manage
                                            <ArrowRight className="h-3 w-3" />
                                        </Link>
                                        <Link
                                            href={`/patrol/${route.id}`}
                                            className="ml-2 inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
                                        >
                                            Patrol
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
