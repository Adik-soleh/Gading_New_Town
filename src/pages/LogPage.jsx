import { useState, useEffect } from 'react';
import { logs } from '../lib/api';

function getInitials(n) { return n ? n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'SYS'; }
function getTimeAgo(d) {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

const catColors = {
    Finance: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Permits: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    System: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    'Data Entry': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    Security: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const avatarColors = {
    Finance: { bg: 'bg-blue-100', text: 'text-blue-600' },
    Permits: { bg: 'bg-purple-100', text: 'text-purple-600' },
    System: { bg: 'bg-slate-100', text: 'text-slate-600' },
    'Data Entry': { bg: 'bg-blue-100', text: 'text-blue-600' },
    Security: { bg: 'bg-red-100', text: 'text-red-600' },
};

function LogPage() {
    const [data, setData] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => { loadData(); }, [meta.page, search]);

    async function loadData() {
        setLoading(true);
        try {
            const params = { page: meta.page, limit: 10 };
            if (search) params.search = search;
            const res = await logs.list(params);
            setData(res.data || []);
            setMeta(res.meta || meta);
        } catch (err) { console.error('Failed to load logs:', err); }
        finally { setLoading(false); }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Log Aktivitas Sistem</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Audit trail of all administrative actions and system events.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </span>
                        <input
                            className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-log-primary focus:border-transparent text-sm w-full md:w-64 text-slate-900 dark:text-white placeholder-slate-400"
                            placeholder="Search user, action..."
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setMeta(m => ({ ...m, page: 1 })); }}
                        />
                    </div>
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">download</span><span>Export</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">
                                <th className="px-6 py-4 w-64">User / Actor</th>
                                <th className="px-6 py-4">Action Details</th>
                                <th className="px-6 py-4 w-40">Category</th>
                                <th className="px-6 py-4 w-48 text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan="4" className="py-12 text-center text-slate-400">
                                    <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                                    <p className="mt-2 text-sm">Loading logs...</p>
                                </td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan="4" className="py-12 text-center text-slate-400">
                                    <p className="text-sm">No activity logs found</p>
                                </td></tr>
                            ) : data.map((item) => {
                                const userName = item.user?.name || 'System';
                                const userRole = item.user?.role || 'Automated';
                                const cat = item.category || 'System';
                                const ac = avatarColors[cat] || avatarColors.System;
                                const cc = catColors[cat] || catColors.System;
                                const ts = new Date(item.createdAt);
                                return (
                                    <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full ${ac.bg} ${ac.text} flex items-center justify-center text-xs font-bold`}>{getInitials(userName)}</div>
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{userName}</div>
                                                    <div className="text-xs text-slate-500">{userRole}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-700 dark:text-slate-300">{item.action}</p>
                                            {item.entityId && <p className="text-xs text-slate-500 mt-0.5">Ref: {item.entityType}-{item.entityId?.slice(0, 8)}</p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cc}`}>{cat}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-sm text-slate-600 dark:text-slate-400">{ts.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                            <div className="text-xs text-slate-400">{getTimeAgo(item.createdAt)}</div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Showing <span className="font-medium text-slate-900 dark:text-white">{data.length > 0 ? (meta.page - 1) * meta.limit + 1 : 0}</span> to{' '}
                        <span className="font-medium text-slate-900 dark:text-white">{Math.min(meta.page * meta.limit, meta.total)}</span> of{' '}
                        <span className="font-medium text-slate-900 dark:text-white">{meta.total.toLocaleString()}</span> results
                    </p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-50 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" disabled={meta.page <= 1} onClick={() => setMeta(m => ({ ...m, page: m.page - 1 }))}>Previous</button>
                        <button className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50" disabled={meta.page >= meta.totalPages} onClick={() => setMeta(m => ({ ...m, page: m.page + 1 }))}>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LogPage;
