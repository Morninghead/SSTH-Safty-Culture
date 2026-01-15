import { Shield, FileCheck, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
                <p className="text-muted-foreground mt-2">Welcome back, here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Shield className="w-24 h-24 text-primary" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-primary/10 rounded-lg text-primary">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-medium text-muted-foreground">Active Patrols</h3>
                    </div>
                    <p className="text-4xl font-bold text-foreground">0</p>
                    <div className="mt-4 text-xs text-muted-foreground">
                        <span className="text-success font-medium">Online</span> • System operational
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <FileCheck className="w-24 h-24 text-success" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-success/10 rounded-lg text-success">
                            <FileCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-medium text-muted-foreground">Reports Today</h3>
                    </div>
                    <p className="text-4xl font-bold text-foreground">0</p>
                    <div className="mt-4 text-xs text-muted-foreground">
                        <span className="text-success font-medium">+0%</span> from yesterday
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <AlertTriangle className="w-24 h-24 text-warning" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-warning/10 rounded-lg text-warning">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-medium text-muted-foreground">Pending Issues</h3>
                    </div>
                    <p className="text-4xl font-bold text-foreground">0</p>
                    <div className="mt-4 text-xs text-muted-foreground">
                        <span className="text-warning font-medium">Action Required</span>
                    </div>
                </div>
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-card rounded-xl shadow-sm border border-border/50 p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
                <div className="h-32 flex items-center justify-center border-2 border-dashed border-border rounded-lg text-muted-foreground">
                    No recent activity found.
                </div>
            </div>
        </div>
    );
}
