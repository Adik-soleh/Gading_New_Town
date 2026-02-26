import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboard } from '../lib/api';
import ResidentDashboard from '../components/ResidentDashboard';
function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ activeFamilies: 0, unpaidIPL: 0, pendingVerifications: 0, pendingPermits: 0 });
    const [chartData, setChartData] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {
        try {
            const [statsRes, chartRes, activityRes] = await Promise.all([
                dashboard.getStats().catch(() => null),
                dashboard.getIPLChart().catch(() => []),
                dashboard.getRecentActivity(5).catch(() => []),
            ]);
            if (statsRes) setStats(statsRes);
            if (chartRes) setChartData(chartRes);
            if (activityRes) setRecentActivity(activityRes);
        } catch (err) {
            console.error('Dashboard load error:', err);
        } finally {
            setLoading(false);
        }
    }

    const userName = user?.name || 'Admin';

    const activityIcons = {
        Finance: { icon: 'check_circle', color: 'green' },
        Permits: { icon: 'home_repair_service', color: 'blue' },
        'Data Entry': { icon: 'person_add', color: 'purple' },
        Security: { icon: 'warning', color: 'amber' },
        System: { icon: 'settings', color: 'slate' },
    };

    function getTimeAgo(dateStr) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    const displayChart = chartData; // Display all months
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const isWarga = user?.role === 'WARGA';

    if (isWarga) {
        return <ResidentDashboard user={user} stats={stats} recentActivity={recentActivity} />;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome, {userName} 👋</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Here is what's happening in your neighborhood today.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                        <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </button>
                    {!isWarga && (
                        <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-primary/25 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            <span>New Entry</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${isWarga ? 'lg:grid-cols-2 max-w-3xl' : 'lg:grid-cols-4'} gap-6`}>
                {/* Card 1 */}
                {!isWarga && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-4 group hover:border-primary/50 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-primary">
                                <span className="material-symbols-outlined">groups</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Families</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{loading ? '...' : stats.activeFamilies}</h3>
                        </div>
                    </div>
                )}

                {/* Card 2 */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-4 group hover:border-red-400/50 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-xl text-red-500">
                            <span className="material-symbols-outlined">payments</span>
                        </div>
                        {stats.unpaidIPL > 0 && (
                            <span className="flex items-center text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">Urgent</span>
                        )}
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{isWarga ? 'Tagihan IPL' : 'Unpaid IPL'}</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{loading ? '...' : stats.unpaidIPL} {isWarga ? 'Bulan' : ''}</h3>
                    </div>
                </div>

                {/* Card 3 */}
                {!isWarga && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-4 group hover:border-amber-400/50 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl text-amber-500">
                                <span className="material-symbols-outlined">fact_check</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pending Verifications</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{loading ? '...' : stats.pendingVerifications}</h3>
                        </div>
                    </div>
                )}

                {/* Card 4 */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-4 group hover:border-purple-400/50 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-purple-500">
                            <span className="material-symbols-outlined">assignment_late</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pending Permits</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{loading ? '...' : stats.pendingPermits}</h3>
                    </div>
                </div>
            </div>

            {/* Main Grid Section */}
            {!isWarga ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Chart Section (Left 2/3) */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Monthly IPL Payments</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Payment status overview for {new Date().getFullYear()}</p>
                            </div>
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors">
                                <span className="material-symbols-outlined">more_horiz</span>
                            </button>
                        </div>

                        {/* Custom Bar Chart Visualization */}
                        <div className="relative h-64 w-full mt-8">
                            {/* Y-Axis Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                <div className="w-full h-px bg-slate-100 dark:bg-slate-700"></div>
                                <div className="w-full h-px bg-slate-100 dark:bg-slate-700"></div>
                                <div className="w-full h-px bg-slate-100 dark:bg-slate-700"></div>
                                <div className="w-full h-px bg-slate-100 dark:bg-slate-700"></div>
                                <div className="w-full h-px bg-slate-100 dark:bg-slate-700"></div>
                            </div>

                            {/* Bars Container */}
                            <div className="absolute inset-0 flex items-end justify-around px-2 md:px-4 overflow-x-auto snap-x">
                                {displayChart.map((item) => (
                                    <div key={item.month} className="flex flex-col items-center gap-2 group flex-1 min-w-[30px] sm:min-w-[40px] snap-center">
                                        <div className="flex items-end gap-[2px] md:gap-1 h-48 w-full justify-center">
                                            <div className="w-2 sm:w-3 bg-primary rounded-t-sm hover:opacity-80 transition-opacity relative group/bar" style={{ height: `${Math.max(item.paid, 2)}%` }}>
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover/bar:opacity-100 whitespace-nowrap z-10 transition-opacity">Paid: {item.paid}%</div>
                                            </div>
                                            <div className="w-2 sm:w-3 bg-amber-400 rounded-t-sm hover:opacity-80 transition-opacity relative group/bar" style={{ height: `${Math.max(item.pending, 2)}%` }}>
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover/bar:opacity-100 whitespace-nowrap z-10 transition-opacity">Pending: {item.pending}%</div>
                                            </div>
                                            <div className="w-2 sm:w-3 bg-slate-200 dark:bg-slate-600 rounded-t-sm hover:opacity-80 transition-opacity relative group/bar" style={{ height: `${Math.max(item.unpaid, 2)}%` }}>
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover/bar:opacity-100 whitespace-nowrap z-10 transition-opacity">Unpaid: {item.unpaid}%</div>
                                            </div>
                                        </div>
                                        <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">{monthNames[item.month]}</span>
                                    </div>
                                ))}
                                {displayChart.length === 0 && !loading && (
                                    <div className="flex items-center justify-center h-full w-full text-slate-400 text-sm">No chart data available</div>
                                )}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-center gap-6 mt-6">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-primary"></span>
                                <span className="text-sm text-slate-600 dark:text-slate-400">Paid (Lunas)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                                <span className="text-sm text-slate-600 dark:text-slate-400">Pending</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-600"></span>
                                <span className="text-sm text-slate-600 dark:text-slate-400">Unpaid (Belum)</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Section (Right 1/3) */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col h-full">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Recent Activity</h3>
                        <div className="relative flex-1">
                            {/* Vertical Line */}
                            <div className="absolute top-0 bottom-0 left-4 w-px bg-slate-200 dark:bg-slate-700"></div>
                            <div className="space-y-8 relative">
                                {recentActivity.length > 0 ? recentActivity.map((item) => {
                                    const iconConfig = activityIcons[item.category] || activityIcons.System;
                                    return (
                                        <div key={item.id} className="flex gap-4">
                                            <div className={`relative z-10 w-8 h-8 rounded-full bg-${iconConfig.color}-100 dark:bg-${iconConfig.color}-900 border-2 border-white dark:border-slate-800 flex items-center justify-center flex-shrink-0 text-${iconConfig.color}-600`}>
                                                <span className="material-symbols-outlined text-[16px]">{iconConfig.icon}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight">{item.action}</p>
                                                <span className="text-xs text-slate-500">{getTimeAgo(item.createdAt)}</span>
                                            </div>
                                        </div>
                                    );
                                }) : !loading && (
                                    <p className="text-sm text-slate-400 text-center py-4">No recent activity</p>
                                )}
                            </div>
                        </div>
                        <button onClick={() => navigate('/log')} className="w-full mt-6 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors">
                            View All Activity
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    )
}

export default DashboardPage
