'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateRoutePage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_active: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.from('routes').insert([
                {
                    name: formData.name,
                    description: formData.description,
                    is_active: formData.is_active,
                },
            ]);

            if (error) throw error;
            router.push('/dashboard/routes');
            router.refresh();
        } catch (error: any) {
            alert('Error creating route: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-foreground sm:truncate sm:text-3xl sm:tracking-tight">
                        Create Route
                    </h2>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card shadow-sm border border-border sm:rounded-lg p-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium leading-6 text-foreground">
                        Route Name
                    </label>
                    <div className="mt-2">
                        <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            className="block w-full rounded-md border-0 py-1.5 text-foreground bg-background shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium leading-6 text-foreground">
                        Description
                    </label>
                    <div className="mt-2">
                        <textarea
                            name="description"
                            id="description"
                            rows={3}
                            className="block w-full rounded-md border-0 py-1.5 text-foreground bg-background shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                <div className="relative flex gap-x-3">
                    <div className="flex h-6 items-center">
                        <input
                            id="is_active"
                            name="is_active"
                            type="checkbox"
                            className="h-4 w-4 rounded border-input text-primary focus:ring-primary bg-background"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        />
                    </div>
                    <div className="text-sm leading-6">
                        <label htmlFor="is_active" className="font-medium text-foreground">
                            Active
                        </label>
                        <p className="text-muted-foreground">Enable this route for inspectors immediately.</p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-x-6 pt-4 border-t border-border">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="text-sm font-semibold leading-6 text-foreground hover:text-muted-foreground"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Create Route'}
                    </button>
                </div>
            </form>
        </div>
    );
}
