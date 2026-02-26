import { useState, useEffect } from 'react';
import RequestDetailModal from '../components/RequestDetailModal';
import AddRequestModal from '../components/AddRequestModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { permits, upload } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Toast } from '../lib/sweetalert';

function getInitials(n) { return n ? n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??'; }
function fmtDate(d) { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); }
const colors = ['blue', 'purple', 'green', 'red', 'orange', 'pink'];

function IzinPage() {
    const { user } = useAuth();
    const [selectedIzin, setSelectedIzin] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editData, setEditData] = useState(null);
    const [confirmAction, setConfirmAction] = useState({ isOpen: false, type: '', data: null });
    const [data, setData] = useState([]);
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, [meta.page]);

    async function loadData() {
        setLoading(true);
        try {
            const [listRes, statsRes] = await Promise.all([
                permits.list({ page: meta.page, limit: 10 }),
                permits.stats().catch(() => null),
            ]);
            setData(listRes.data || []);
            setMeta(listRes.meta || meta);
            if (statsRes) setStats(statsRes);
        } catch (err) { console.error('Failed to load permits:', err); }
        finally { setLoading(false); }
    }

    const openDetail = (item) => {
        setSelectedIzin({
            id: item.id, type: 'izin',
            name: item.household?.headOfFamily?.name || 'N/A',
            block: `Block ${item.household?.block} No. ${item.household?.houseNumber}`,
            date: fmtDate(item.createdAt), category: item.category,
            status: item.status === 'PENDING' ? 'Pending' : item.status === 'APPROVED' ? 'Disetujui' : 'Ditolak',
            startDate: fmtDate(item.startDate), endDate: fmtDate(item.endDate),
            description: item.description, attachment: item.attachment,
        });
        setIsDetailOpen(true);
    };

    const openConfirm = (type, item) => {
        setIsDetailOpen(false);
        setConfirmAction({ isOpen: true, type, data: { id: item.id, name: item.household?.headOfFamily?.name || 'N/A' } });
    };

    const handleConfirmAction = async () => {
        try {
            if (confirmAction.type === 'approve') {
                await permits.approve(confirmAction.data.id, 'Disetujui');
                Toast.fire({ icon: 'success', title: 'Izin berhasil disetujui!' });
            } else if (confirmAction.type === 'reject') {
                await permits.reject(confirmAction.data.id, 'Ditolak');
                Toast.fire({ icon: 'success', title: 'Izin berhasil ditolak!' });
            } else if (confirmAction.type === 'delete') {
                await permits.delete(confirmAction.data.id);
                Toast.fire({ icon: 'success', title: 'Izin berhasil dihapus!' });
            }
            loadData();
        } catch (err) {
            console.error('Action failed:', err);
            Toast.fire({ icon: 'error', title: 'Gagal memproses tindakan!' });
        }
        setConfirmAction({ isOpen: false, type: '', data: null });
    };

    const badge = (s) => {
        const m = { PENDING: ['bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', 'bg-amber-500', 'Pending'], APPROVED: ['bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', 'bg-green-500', 'Disetujui'], REJECTED: ['bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', 'bg-red-500', 'Ditolak'] };
        const c = m[s] || m.PENDING;
        return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c[0]}`}><span className={`w-1.5 h-1.5 rounded-full ${c[1]}`}></span>{c[2]}</span>;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Pengajuan Izin Renovasi</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Kelola permohonan izin renovasi dan kegiatan warga lainnya.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">filter_list</span><span>Filter</span>
                    </button>
                    <button onClick={() => setIsAddOpen(true)} className="px-4 py-2 bg-izin-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-izin-primary/25 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">add</span><span>Buat Izin Baru</span>
                    </button>
                </div>
            </div>

            {user?.role !== 'WARGA' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Menunggu Persetujuan', val: stats.pending, color: 'amber', icon: 'hourglass_top' },
                        { label: 'Disetujui Bulan Ini', val: stats.approved, color: 'green', icon: 'check_circle' },
                        { label: 'Ditolak', val: stats.rejected, color: 'red', icon: 'cancel' },
                        { label: 'Total Pengajuan', val: stats.total, color: 'blue', icon: 'folder' },
                    ].map((c) => (
                        <div key={c.label} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{c.label}</p>
                                <h3 className={`text-2xl font-bold mt-1 ${c.color === 'blue' ? 'text-slate-900 dark:text-white' : `text-${c.color}-500`}`}>{loading ? '...' : c.val}</h3>
                            </div>
                            <div className={`w-10 h-10 rounded-full bg-${c.color}-50 dark:bg-${c.color}-900/20 flex items-center justify-center text-${c.color}-500`}>
                                <span className="material-symbols-outlined">{c.icon}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-slate-900 dark:text-white">Daftar Terbaru</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Pemohon</th>
                                <th className="px-6 py-4 font-semibold">Jenis Izin</th>
                                <th className="px-6 py-4 font-semibold">Tanggal</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan="5" className="py-12 text-center text-slate-400"><span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span><p className="mt-2 text-sm">Loading...</p></td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan="5" className="py-12 text-center text-slate-400"><p className="text-sm">No permits found</p></td></tr>
                            ) : data.map((item, idx) => {
                                const name = item.household?.headOfFamily?.name || 'N/A';
                                const block = item.household ? `Block ${item.household.block} No. ${item.household.houseNumber}` : '-';
                                const c = colors[idx % colors.length];
                                return (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full bg-${c}-100 text-${c}-600 flex items-center justify-center font-bold text-sm`}>{getInitials(name)}</div>
                                                <div><p className="font-semibold text-slate-900 dark:text-white">{name}</p><p className="text-xs text-slate-500">{block}</p></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{item.category}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{fmtDate(item.createdAt)}</td>
                                        <td className="px-6 py-4">{badge(item.status)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                {item.status === 'PENDING' && user?.role === 'WARGA' && <>
                                                    <button onClick={() => { setIsEdit(true); setEditData(item); setIsAddOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="Edit"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                                                    <button onClick={() => openConfirm('delete', item)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Hapus"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                                                </>}
                                                {item.status === 'PENDING' && user?.role !== 'WARGA' && <>
                                                    <button onClick={() => openConfirm('approve', item)} className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg" title="Setujui"><span className="material-symbols-outlined text-[20px]">check</span></button>
                                                    <button onClick={() => openConfirm('reject', item)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Tolak"><span className="material-symbols-outlined text-[20px]">close</span></button>
                                                </>}
                                                <button onClick={() => openDetail(item)} className="p-2 text-slate-400 hover:text-izin-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg" title="Detail"><span className="material-symbols-outlined text-[20px]">visibility</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <p className="text-sm text-slate-500">Showing <span className="font-bold text-slate-900 dark:text-white">{data.length > 0 ? `${(meta.page - 1) * meta.limit + 1}-${Math.min(meta.page * meta.limit, meta.total)}` : '0'}</span> of <span className="font-bold text-slate-900 dark:text-white">{meta.total}</span></p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 disabled:opacity-50" disabled={meta.page <= 1} onClick={() => setMeta(m => ({ ...m, page: m.page - 1 }))}>Previous</button>
                        <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 disabled:opacity-50" disabled={meta.page >= meta.totalPages} onClick={() => setMeta(m => ({ ...m, page: m.page + 1 }))}>Next</button>
                    </div>
                </div>
            </div>

            <AddRequestModal
                isOpen={isAddOpen}
                onClose={() => { setIsAddOpen(false); setIsEdit(false); setEditData(null); }}
                type="izin"
                initialData={isEdit ? editData : null}
                onSave={async (formData) => {
                    try {
                        let finalAttachment = formData.attachment;
                        if (formData.attachment instanceof File) {
                            const uploadRes = await upload.file(formData.attachment);
                            finalAttachment = uploadRes.url;
                        }

                        const payload = {
                            category: formData.category,
                            description: formData.description,
                            startDate: new Date(formData.startDate).toISOString(),
                            endDate: new Date(formData.endDate).toISOString(),
                            attachment: finalAttachment,
                        };
                        if (isEdit) {
                            await permits.update(editData.id, payload);
                            Toast.fire({ icon: 'success', title: 'Izin berhasil diperbarui!' });
                        } else {
                            await permits.create(payload);
                            Toast.fire({ icon: 'success', title: 'Izin berhasil diajukan!' });
                        }
                        setIsAddOpen(false);
                        setIsEdit(false);
                        setEditData(null);
                        loadData();
                    } catch (err) {
                        console.error('Failed to create/update permit:', err);
                        Toast.fire({ icon: 'error', title: 'Gagal menyimpan data izin!' });
                    }
                }}
            />
            <RequestDetailModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} data={selectedIzin} />
            <ConfirmationModal isOpen={confirmAction.isOpen} onClose={() => setConfirmAction({ isOpen: false, type: '', data: null })} onConfirm={handleConfirmAction}
                title={confirmAction.type === 'approve' ? 'Setujui Izin' : confirmAction.type === 'delete' ? 'Hapus Izin' : 'Tolak Izin'}
                message={confirmAction.type === 'approve' ? `Setujui izin dari ${confirmAction.data?.name}?` : confirmAction.type === 'delete' ? `Hapus izin ini?` : `Tolak izin dari ${confirmAction.data?.name}?`}
                type={confirmAction.type === 'approve' ? 'success' : confirmAction.type === 'delete' ? 'danger' : 'danger'}
                confirmText={confirmAction.type === 'approve' ? 'Ya, Setujui' : confirmAction.type === 'delete' ? 'Ya, Hapus' : 'Ya, Tolak'} />
        </div>
    );
}

export default IzinPage;
