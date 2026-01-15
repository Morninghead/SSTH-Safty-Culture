'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ModeToggle } from '@/components/mode-toggle';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading, signOut } = useAuth();
    const router = useRouter();

    // Protect Route
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Routes & Checkpoints', href: '/dashboard/routes', icon: Map },
        { name: 'Inspection Reports', href: '/dashboard/inspections', icon: ClipboardCheck },
        { name: 'User Management', href: '/dashboard/users', icon: Users },
    ];

    return (
        <div className="flex h-screen bg-background text-foreground font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-card border-r border-border flex flex-col shadow-xl z-10 transition-all duration-300">
                <div className="p-6 border-b border-border/50 flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">Safety Patrol</h1>
                        <p className="text-xs text-muted-foreground font-medium">Inspector Dashboard</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-muted hover:text-foreground text-muted-foreground"
                        >
                            <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-border/50 bg-muted/5">
                    <div className="flex items-center justify-between gap-2 mb-4 px-2">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shadow-inner">
                                {user?.email?.[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate max-w-[120px]">{user?.email}</p>
                                <p className="text-xs text-muted-foreground">Inspector</p>
                            </div>
                        </div>
                        <ModeToggle />
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-2 justify-center px-4 py-2 text-sm font-medium text-destructive bg-destructive/5 hover:bg-destructive/10 rounded-lg transition-colors border border-transparent hover:border-destructive/20"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-background relative">
                <div className="h-full w-full p-8 md:p-12 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

import { LayoutDashboard, Map, ClipboardCheck, Users, LogOut, ShieldCheck } from 'lucide-react';
