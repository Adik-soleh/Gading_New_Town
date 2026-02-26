import { useState, useEffect } from 'react';
import RequestDetailModal from '../components/RequestDetailModal';
import AddRequestModal from '../components/AddRequestModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { mutations, upload } from '../lib/api';
import { useAuth } from '../context/AuthContext';

function getInitials(n) { return n ? n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??'; }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
const colors = ['purple', 'blue', 'pink', 'indigo', 'emerald', 'amber'];

function MutasiPage() {
    const { user } = useAuth();
    const [selectedMutasi, setSelectedMutasi] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState({ isOpen: false, type: '', data: null });
    const [data, setData] = useState([]);
    const [stats, setStats] = useState({ total: 0, incoming: 0, outgoing: 0, pendingIncoming: 0 });
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('PINDAH_MASUK');

    useEffect(() => { loadData(); }, [meta.page, tab]);

    async function loadData() {
        setLoading(true);
        try {
            const [listRes, statsRes] = await Promise.all([
                mutations.list({ page: meta.page, limit: 10, type: tab }),
                mutations.stats().catch(() => null),
            ]);
            setData(listRes.data || []);
            setMeta(listRes.meta || meta);
            if (statsRes) setStats(statsRes);
        } catch (err) { console.error('Failed to load mutations:', err); }
        finally { setLoading(false); }
    }

    const openDetail = (item) => {
        const hh = item.resident?.household;
        setSelectedMutasi({
            id: item.id, type: 'mutasi', mutasiType: item.type === 'PINDAH_MASUK' ? 'Pindah Masuk' : 'Pindah Keluar',
            name: item.resident?.name || 'N/A',
            block: hh ? `Block ${hh.block} / No. ${hh.houseNumber}` : '-',
            date: fmtDate(item.date), originAddress: item.originAddress || item.destinationAddress || '-',
            status: item.status === 'VERIFIED' ? 'Disetujui' : 'Pending',
            reason: item.reason, attachment: item.attachment || null,
        });
        setIsDetailOpen(true);
    };

    const openConfirm = (type, item) => {
        setIsDetailOpen(false);
        setConfirmAction({ isOpen: true, type, data: { id: item.id, name: item.resident?.name || 'N/A' } });
    };

    const handleConfirmAction = async () => {
        try { await mutations.verify(confirmAction.data.id); loadData(); }
        catch (err) { console.error('Verify failed:', err); }
        setConfirmAction({ isOpen: false, type: '', data: null });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Mutasi Warga Tracking</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Manage incoming and outgoing resident records for this month.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">filter_list</span><span>Filter</span>
                    </button>
                    <button onClick={() => setIsAddOpen(true)} className="px-4 py-2 bg-mutasi-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-mutasi-primary/25 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">add</span><span>Catat Mutasi</span>
                    </button>
                </div>
            </div>

            {user?.role !== 'WARGA' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Total Moves This Month', val: stats.total, icon: 'swap_horiz', iconColor: 'text-mutasi-primary', bg: 'bg-blue-50 dark:bg-blue-900/30' },
                        { label: 'Incoming Residents', val: stats.incoming, icon: 'login', iconColor: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30', sub: `${stats.pendingIncoming} pending verification` },
                        { label: 'Outgoing Residents', val: stats.outgoing, icon: 'logout', iconColor: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30' },
                    ].map((c) => (
                        <div key={c.label} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{c.label}</p>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{loading ? '...' : c.val}</h3>
                                {c.sub && <p className="text-xs text-slate-400 mt-1">{c.sub}</p>}
                            </div>
                            <div className={`w-12 h-12 rounded-full ${c.bg} flex items-center justify-center ${c.iconColor}`}>
                                <span className="material-symbols-outlined">{c.icon}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                <div className="flex border-b border-slate-200 dark:border-slate-700 px-6 pt-2">
                    <button onClick={() => { setTab('PINDAH_MASUK'); setMeta(m => ({ ...m, page: 1 })); }} className={`px-4 py-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${tab === 'PINDAH_MASUK' ? 'text-mutasi-primary border-mutasi-primary' : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'}`}>
                        <span className="material-symbols-outlined text-[18px]">login</span>Warga Masuk
                    </button>
                    <button onClick={() => { setTab('PINDAH_KELUAR'); setMeta(m => ({ ...m, page: 1 })); }} className={`px-4 py-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${tab === 'PINDAH_KELUAR' ? 'text-mutasi-primary border-mutasi-primary' : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'}`}>
                        <span className="material-symbols-outlined text-[18px]">logout</span>Warga Keluar
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Resident Name</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Date of Change</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">{tab === 'PINDAH_MASUK' ? 'Origin' : 'Destination'}</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Block</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan="6" className="py-12 text-center text-slate-400"><span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span><p className="mt-2 text-sm">Loading...</p></td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan="6" className="py-12 text-center text-slate-400"><p className="text-sm">No mutations found</p></td></tr>
                            ) : data.map((item, idx) => {
                                const name = item.resident?.name || 'N/A';
                                const c = colors[idx % colors.length];
                                const hh = item.resident?.household;
                                const block = hh ? `Block ${hh.block} / No. ${hh.houseNumber}` : '-';
                                const isVerified = item.status === 'VERIFIED';
                                return (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full bg-${c}-100 text-${c}-600 flex items-center justify-center font-bold text-sm`}>{getInitials(name)}</div>
                                                <div><p className="text-sm font-medium text-slate-900 dark:text-white">{name}</p></div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300">{fmtDate(item.date)}</td>
                                        <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300">{tab === 'PINDAH_MASUK' ? (item.originAddress || '-') : (item.destinationAddress || '-')}</td>
                                        <td className="py-4 px-6 text-sm"><span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium">{block}</span></td>
                                        <td className="py-4 px-6">
                                            {isVerified ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Verified</span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Pending</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {!isVerified && user?.role !== 'WARGA' && <button onClick={() => openConfirm('approve', item)} className="text-green-600 hover:text-green-700 transition-colors p-1" title="Approve"><span className="material-symbols-outlined text-[20px]">check_circle</span></button>}
                                                <button onClick={() => openDetail(item)} className="text-slate-400 hover:text-mutasi-primary transition-colors p-1" title="Detail"><span className="material-symbols-outlined text-[20px]">visibility</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <p className="text-sm text-slate-500">Showing <span className="font-medium text-slate-900 dark:text-white">{data.length > 0 ? `${(meta.page - 1) * meta.limit + 1}-${Math.min(meta.page * meta.limit, meta.total)}` : '0'}</span> of <span className="font-medium text-slate-900 dark:text-white">{meta.total}</span></p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 disabled:opacity-50" disabled={meta.page <= 1} onClick={() => setMeta(m => ({ ...m, page: m.page - 1 }))}>Previous</button>
                        <button className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-50" disabled={meta.page >= meta.totalPages} onClick={() => setMeta(m => ({ ...m, page: m.page + 1 }))}>Next</button>
                    </div>
                </div>
            </div>

            <AddRequestModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                type="mutasi"
                onSave={async (formData) => {
                    try {
                        let attachmentUrl;
                        if (formData.attachment && typeof formData.attachment !== 'string') {
                            const uploadRes = await upload.file(formData.attachment);
                            attachmentUrl = uploadRes.url || uploadRes.path;
                        }

                        await mutations.create({
                            type: formData.mutasiType === 'Pindah Masuk' ? 'PINDAH_MASUK' : 'PINDAH_KELUAR',
                            date: new Date().toISOString(),
                            originAddress: formData.originAddress || undefined,
                            destinationAddress: formData.destinationAddress || undefined,
                            reason: formData.reason || undefined,
                            attachment: attachmentUrl || undefined,
                        });
                        setIsAddOpen(false);
                        loadData();
                    } catch (err) {
                        console.error('Failed to create mutation:', err);
                        alert('Gagal mengajukan mutasi: ' + err.message);
                    }
                }}
            />
            <RequestDetailModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} data={selectedMutasi} />
            <ConfirmationModal isOpen={confirmAction.isOpen} onClose={() => setConfirmAction({ isOpen: false, type: '', data: null })} onConfirm={handleConfirmAction}
                title="Verifikasi Mutasi" message={`Verifikasi data mutasi atas nama ${confirmAction.data?.name}?`} type="success" confirmText="Verifikasi Data" />
        </div>
    );
}

export default MutasiPage;
