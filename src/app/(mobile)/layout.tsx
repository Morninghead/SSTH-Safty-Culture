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
        <div className="flex flex-col h-screen bg-background">
            {/* Top Header */}
            <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-14 items-center px-4">
                    <div className="font-bold text-lg">Safety Patrol</div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 w-full bg-background border-t border-border flex justify-around py-3 z-50 safe-area-pb shadow-lg">
                <Link href="/patrol" className="flex flex-col items-center text-muted-foreground hover:text-primary active:text-primary transition-colors">
                    <ScanLine className="h-6 w-6" />
                    <span className="text-[10px] uppercase font-medium mt-1">Patrol</span>
                </Link>
                <Link href="/profile" className="flex flex-col items-center text-muted-foreground hover:text-primary active:text-primary transition-colors">
                    <UserCircle className="h-6 w-6" />
                    <span className="text-[10px] uppercase font-medium mt-1">Profile</span>
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
