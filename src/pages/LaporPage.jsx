import { useState, useEffect } from 'react';
import LaporanDetailModal from '../components/LaporanDetailModal';
import LaporanResponseForm from '../components/LaporanResponseForm';
import { reports } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import ResidentLapor from '../components/ResidentLapor';
import { Toast } from '../lib/sweetalert';
function fmtDate(d) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }

const statusColors = {
    NEW: { bar: 'bg-red-500', badge: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300', label: 'New' },
    IN_PROGRESS: { bar: 'bg-amber-500', badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300', label: 'In Progress' },
    RESOLVED: { bar: 'bg-green-500', badge: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300', label: 'Resolved' },
};

const catIcons = { Infrastructure: 'lightbulb', Security: 'security', Cleanliness: 'delete_outline', 'Noise Complaint': 'volume_up', Other: 'category' };
const catIconColors = { Infrastructure: 'text-red-500 bg-red-50 dark:bg-red-900/20', Security: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20', Cleanliness: 'text-green-500 bg-green-50 dark:bg-green-900/20', 'Noise Complaint': 'text-purple-500 bg-purple-50 dark:bg-purple-900/20', Other: 'text-slate-500 bg-slate-50 dark:bg-slate-900/20' };

function LaporPage() {
    const { user } = useAuth();
    const [selectedLaporan, setSelectedLaporan] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isResponseOpen, setIsResponseOpen] = useState(false);
    const [data, setData] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    useEffect(() => { loadData(); }, [meta.page, statusFilter, categoryFilter]);

    async function loadData() {
        setLoading(true);
        try {
            const params = { page: meta.page, limit: 10 };
            if (statusFilter) params.status = statusFilter;
            if (categoryFilter) params.category = categoryFilter;
            const res = await reports.list(params);
            setData(res.data || []);
            setMeta(res.meta || meta);
        } catch (err) { console.error('Failed to load reports:', err); }
        finally { setLoading(false); }
    }

    const openDetail = (item) => { setSelectedLaporan(item); setIsDetailOpen(true); };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await reports.updateStatus(id, newStatus);
            Toast.fire({ icon: 'success', title: 'Status laporan berhasil diperbarui!' });
            loadData();
        }
        catch (err) {
            console.error('Status update failed:', err);
            Toast.fire({ icon: 'error', title: 'Gagal memperbarui status laporan!' });
        }
    };

    const newCount = data.filter(d => d.status === 'NEW').length;
    const progressCount = data.filter(d => d.status === 'IN_PROGRESS').length;

    const isWarga = user?.role === 'WARGA';

    const handleAddReport = async (formData) => {
        try {
            await reports.create(formData);
            Toast.fire({ icon: 'success', title: 'Laporan berhasil dibuat!' });
            loadData();
        } catch (err) {
            console.error('Failed to create report:', err);
            Toast.fire({ icon: 'error', title: 'Gagal membuat laporan!' });
        }
    };

    if (isWarga) {
        return (
            <>
                <ResidentLapor
                    user={user}
                    data={data}
                    loading={loading}
                    meta={meta}
                    setMeta={setMeta}
                    onAddReport={handleAddReport}
                    onViewDetail={(item) => openDetail(item)}
                />
                <LaporanDetailModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} data={selectedLaporan} />
            </>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Report Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Manage and track community issues reported by residents.</p>
                </div>
                {user?.role !== 'WARGA' && (
                    <div className="flex gap-3">
                        <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-sm">
                            <span className="flex h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">New: <span className="font-bold">{newCount}</span></span>
                        </div>
                        <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-sm">
                            <span className="flex h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">In Progress: <span className="font-bold">{progressCount}</span></span>
                        </div>
                        <button className="px-4 py-2 bg-lapor-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-lapor-primary/25 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">file_download</span><span>Export Data</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-700 pr-4 mr-2">
                    <span className="material-symbols-outlined text-slate-400">filter_list</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filters:</span>
                </div>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setMeta(m => ({ ...m, page: 1 })); }} className="bg-slate-50 dark:bg-slate-900 border-none text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-2 focus:ring-lapor-primary py-2 pl-3 pr-8 w-40">
                    <option value="">All Status</option>
                    <option value="NEW">New</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                </select>
                <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setMeta(m => ({ ...m, page: 1 })); }} className="bg-slate-50 dark:bg-slate-900 border-none text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-2 focus:ring-lapor-primary py-2 pl-3 pr-8 w-40">
                    <option value="">All Categories</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Security">Security</option>
                    <option value="Cleanliness">Cleanliness</option>
                    <option value="Noise Complaint">Noise Complaint</option>
                </select>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="py-12 text-center text-slate-400">
                        <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                        <p className="mt-2 text-sm">Loading reports...</p>
                    </div>
                ) : data.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl">search_off</span>
                        <p className="mt-2 text-sm">No reports found</p>
                    </div>
                ) : data.map((item) => {
                    const sc = statusColors[item.status] || statusColors.NEW;
                    const icon = catIcons[item.category] || catIcons.Other;
                    const iconColor = catIconColors[item.category] || catIconColors.Other;
                    return (
                        <div key={item.id} className={`bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group ${item.status === 'RESOLVED' ? 'opacity-75 hover:opacity-100' : ''}`}>
                            <div className={`absolute top-0 left-0 w-1 h-full ${sc.bar}`}></div>
                            <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
                                <div className="flex-1 flex gap-4">
                                    <div className={`w-12 h-12 rounded-xl ${iconColor} flex items-center justify-center flex-shrink-0`}>
                                        <span className="material-symbols-outlined">{icon}</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.subject}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${sc.badge}`}>{sc.label}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{item.description}</p>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">person</span>Reported by: {item.reporter?.name || 'Anonymous'}</span>
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span>{fmtDate(item.createdAt)}</span>
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">category</span>{item.category}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 lg:border-l lg:border-slate-100 lg:dark:border-slate-700 lg:pl-6 pt-4 lg:pt-0">
                                    {user?.role !== 'WARGA' ? (
                                        <select value={item.status} onChange={e => handleStatusChange(item.id, e.target.value)} className="appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-2 focus:ring-lapor-primary block w-36 p-2.5">
                                            <option value="NEW">New</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="RESOLVED">Resolved</option>
                                        </select>
                                    ) : (
                                        <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${sc.badge}`}>{sc.label}</span>
                                    )}
                                    <button onClick={() => openDetail(item)} className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="View Details">
                                        <span className="material-symbols-outlined">visibility</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-6">
                <p className="text-sm text-slate-500">Showing <span className="font-bold text-slate-900 dark:text-white">{data.length > 0 ? `${(meta.page - 1) * meta.limit + 1}-${Math.min(meta.page * meta.limit, meta.total)}` : '0'}</span> of <span className="font-bold text-slate-900 dark:text-white">{meta.total}</span> reports</p>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-500 disabled:opacity-50" disabled={meta.page <= 1} onClick={() => setMeta(m => ({ ...m, page: m.page - 1 }))}>Previous</button>
                    <button className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-500 disabled:opacity-50" disabled={meta.page >= meta.totalPages} onClick={() => setMeta(m => ({ ...m, page: m.page + 1 }))}>Next</button>
                </div>
            </div>

            <LaporanDetailModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} data={selectedLaporan} />
            <LaporanResponseForm isOpen={isResponseOpen} onClose={() => { setIsResponseOpen(false); loadData(); }} data={selectedLaporan} />
        </div>
    );
}

export default LaporPage;
