'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ScanLine, UserCircle } from 'lucide-react';

export default function MobileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <main className="flex-1 overflow-y-auto pb-20">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-3 z-50 safe-area-pb">
                <Link href="/patrol" className="flex flex-col items-center text-gray-600 hover:text-indigo-600">
                    <ScanLine className="h-6 w-6" />
                    <span className="text-xs mt-1">Patrol</span>
                </Link>
                <Link href="/profile" className="flex flex-col items-center text-gray-600 hover:text-indigo-600">
                    <UserCircle className="h-6 w-6" />
                    <span className="text-xs mt-1">Profile</span>
                </Link>
            </nav>

            <style jsx global>{`
        .safe-area-pb {
            padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
        </div>
    );
}
