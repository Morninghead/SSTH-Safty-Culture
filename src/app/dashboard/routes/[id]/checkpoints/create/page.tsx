'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, use } from 'react';

export default function CreateCheckpointPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        sequence_order: 1,
        latitude: '',
        longitude: '',
        radius_meters: 20,
        qr_code_value: crypto.randomUUID(), // Auto-generate initial token
    });

    const generateToken = () => {
        setFormData({ ...formData, qr_code_value: crypto.randomUUID() });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.latitude || !formData.longitude) throw new Error('Coordinates required');

            const { error } = await supabase.from('checkpoints').insert([
                {
                    route_id: id,
                    name: formData.name,
                    sequence_order: Number(formData.sequence_order),
                    latitude: Number(formData.latitude),
                    longitude: Number(formData.longitude),
                    radius_meters: Number(formData.radius_meters),
                    qr_code_value: formData.qr_code_value,
                },
            ]);

            if (error) throw error;
            router.push(`/dashboard/routes/${id}`);
            router.refresh();
        } catch (error: any) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper to get current location
    const getCurrentLocation = () => {
        if (!navigator.geolocation) return alert('Geolocation not supported');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: pos.coords.latitude.toFixed(6),
                    longitude: pos.coords.longitude.toFixed(6)
                }));
            },
            (err) => alert(err.message)
        );
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h2 className="text-2xl font-bold leading-7 text-foreground mb-8">
                Add Checkpoint
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border shadow-sm sm:rounded-xl p-6">
                <div>
                    <label className="block text-sm font-medium leading-6 text-foreground">Checkpoint Name</label>
                    <input
                        type="text"
                        required
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-foreground bg-background shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium leading-6 text-foreground">Sequence Order</label>
                        <input
                            type="number"
                            required
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-foreground bg-background shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                            value={formData.sequence_order}
                            onChange={(e) => setFormData({ ...formData, sequence_order: Number(e.target.value) })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium leading-6 text-foreground">Radius (meters)</label>
                        <input
                            type="number"
                            required
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-foreground bg-background shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                            value={formData.radius_meters}
                            onChange={(e) => setFormData({ ...formData, radius_meters: Number(e.target.value) })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium leading-6 text-foreground">Latitude</label>
                        <input
                            type="number"
                            step="any"
                            required
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-foreground bg-background shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                            value={formData.latitude}
                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium leading-6 text-foreground">Longitude</label>
                        <input
                            type="number"
                            step="any"
                            required
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-foreground bg-background shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                            value={formData.longitude}
                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                    <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    Use Current Location
                </button>

                <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">QR Code Token</label>
                    <div className="mt-2 flex gap-2">
                        <input
                            type="text"
                            readOnly
                            className="block w-full rounded-md border-0 py-1.5 text-gray-500 bg-gray-50 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6"
                            value={formData.qr_code_value}
                        />
                        <button
                            type="button"
                            onClick={generateToken}
                            className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            Regenerate
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-x-6 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="text-sm font-semibold leading-6 text-gray-900"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Add Checkpoint'}
                    </button>
                </div>
            </form>
        </div>
    );
}
