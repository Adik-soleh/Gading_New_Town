import { useState, useEffect } from 'react';
import IPLDetailModal from '../components/IPLDetailModal';
import ImagePreviewModal from '../components/ImagePreviewModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { ipl } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import ResidentIPL from '../components/ResidentIPL';
const avatarColors = [
    { bg: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-300' },
    { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-300' },
    { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-600 dark:text-purple-300' },
    { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-600 dark:text-red-300' },
    { bg: 'bg-emerald-100 dark:bg-emerald-900/50', text: 'text-emerald-600 dark:text-emerald-300' },
];

function getInitials(name) {
    return name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??';
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

function IPLPage() {
    const { user } = useAuth();
    const [selectedIPL, setSelectedIPL] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState({ isOpen: false, type: '', data: null });

    const [data, setData] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
    const [summary, setSummary] = useState({ totalCollected: 0, targetAmount: 0, paidCount: 0, pendingCount: 0, unpaidCount: 0, percentage: 0 });
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());

    useEffect(() => {
        loadData();
    }, [meta.page, statusFilter, selectedMonth, selectedYear]);

    async function loadData() {
        setLoading(true);
        try {
            const params = { page: meta.page, limit: 10 };
            if (user?.role !== 'WARGA') {
                params.month = selectedMonth;
                params.year = selectedYear;
            }
            if (statusFilter) params.status = statusFilter;

            const [listRes, summaryRes] = await Promise.all([
                ipl.list(params),
                ipl.summary(selectedMonth, selectedYear).catch(() => null),
            ]);

            setData(listRes.data || []);
            setMeta(listRes.meta || meta);
            if (summaryRes) setSummary(summaryRes);
        } catch (err) {
            console.error('Failed to load IPL data:', err);
        } finally {
            setLoading(false);
        }
    }

    const openDetail = (item) => {
        setSelectedIPL({
            name: item.household?.headOfFamily?.name || 'N/A',
            block: `Block ${item.household?.block} No. ${item.household?.houseNumber}`,
            period: `${['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][item.month]} ${item.year}`,
            amount: formatCurrency(item.amount),
            status: item.status,
            notes: item.notes,
        });
        setIsDetailOpen(true);
    };

    const openPreview = (url) => {
        setPreviewImage(url);
        setIsPreviewOpen(true);
    };

    const openConfirm = (type, item) => {
        setConfirmAction({
            isOpen: true,
            type,
            data: { id: item.id, name: item.household?.headOfFamily?.name || 'N/A' },
        });
    };

    const handleConfirmAction = async (reason) => {
        const { type, data: actionData } = confirmAction;
        try {
            if (type === 'approve') {
                await ipl.verify(actionData.id);
            } else {
                await ipl.reject(actionData.id, reason || 'Bukti pembayaran ditolak oleh Admin');
            }
            loadData();
        } catch (err) {
            console.error('Action failed:', err);
        }
        setConfirmAction({ isOpen: false, type: '', data: null });
    };

    const statusBadge = (status) => {
        const map = {
            VERIFIED: { classes: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', dot: 'bg-green-500', label: 'Lunas' },
            PENDING: { classes: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', dot: 'bg-amber-500', label: 'Pending' },
            REJECTED: { classes: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300', dot: 'bg-red-500', label: 'Ditolak' },
            UNPAID: { classes: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400', dot: 'bg-slate-400', label: 'Belum Bayar' },
        };
        const cfg = map[status] || map.UNPAID;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.classes}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                {cfg.label}
            </span>
        );
    };

    const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const isWarga = user?.role === 'WARGA';

    const handleUploadProof = (item, action) => {
        if (action === 'view') {
            openPreview(item.proofImage.startsWith('http') ? item.proofImage : `http://localhost:3001${item.proofImage}`);
        } else {
            console.log('Upload proof for', item);
            // Will integrate proper modal open logic here later if needed,
            // ResidentIPL currently uses its internal modal or we can pass state.
        }
    };

    if (isWarga) {
        return <ResidentIPL user={user} data={data} loading={loading} meta={meta} setMeta={setMeta} onUploadProof={handleUploadProof} onSuccess={loadData} summary={summary} />;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Pembayaran IPL</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Kelola pembayaran iuran warga bulan {monthNames[selectedMonth]} {selectedYear}.</p>
                </div>
                <div className="flex gap-3 items-center">
                    <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden h-[38px]">
                        <div className="px-3 flex items-center text-slate-400 border-r border-slate-200 dark:border-slate-700">
                            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                        </div>
                        <select
                            className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 border-none focus:ring-0 cursor-pointer h-full py-0 pr-8 pl-3"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        >
                            {monthNames.map((name, idx) => (
                                idx > 0 && <option key={idx} value={idx}>{name}</option>
                            ))}
                        </select>
                        <select
                            className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 border-none border-l border-slate-200 dark:border-slate-700 focus:ring-0 cursor-pointer h-full py-0 pr-8 pl-3"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                        >
                            {[...Array(5)].map((_, idx) => {
                                const year = new Date().getFullYear() - 2 + idx;
                                return <option key={year} value={year}>{year}</option>;
                            })}
                        </select>
                    </div>
                    {user?.role !== 'WARGA' && (
                        <button className="h-[38px] px-4 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-lg shadow-green-600/25 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">table_view</span>
                            <span>Export Excel</span>
                        </button>
                    )}
                </div>
            </div>

            {user?.role !== 'WARGA' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-ipl-primary to-blue-600 rounded-2xl p-6 shadow-lg shadow-ipl-primary/20 text-white relative overflow-hidden">
                        <div className="absolute right-0 top-0 p-4 opacity-10">
                            <span className="material-symbols-outlined text-[120px]">payments</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-blue-100 text-sm font-medium mb-1">Total Terkumpul (Collected)</p>
                            <h3 className="text-4xl font-bold mb-2">{loading ? '...' : formatCurrency(summary.totalCollected)}</h3>
                            <div className="flex items-center gap-2 text-blue-100 text-sm">
                                <span className="bg-white/20 px-2 py-0.5 rounded text-white font-semibold">{summary.percentage}%</span>
                                <span>dari target bulan ini</span>
                            </div>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-1.5 mt-6 relative z-10">
                            <div className="bg-white h-1.5 rounded-full transition-all" style={{ width: `${Math.min(summary.percentage, 100)}%` }}></div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Target Penerimaan</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{loading ? '...' : formatCurrency(summary.targetAmount)}</h3>
                            </div>
                            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-400">
                                <span className="material-symbols-outlined">savings</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-700 pt-4">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Sudah Bayar</p>
                                <p className="font-bold text-green-600 text-lg">{loading ? '...' : `${summary.paidCount} KK`}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Pending</p>
                                <p className="font-bold text-amber-500 text-lg">{loading ? '...' : `${summary.pendingCount} KK`}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Belum Bayar</p>
                                <p className="font-bold text-red-500 text-lg">{loading ? '...' : `${summary.unpaidCount} KK`}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        {['', 'PENDING', 'VERIFIED', 'REJECTED'].map((s) => (
                            <button
                                key={s}
                                onClick={() => { setStatusFilter(s); setMeta(m => ({ ...m, page: 1 })); }}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s
                                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {s === '' ? 'All' : s === 'VERIFIED' ? 'Lunas' : s === 'PENDING' ? 'Pending' : 'Ditolak'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider w-12">
                                    <input className="rounded border-slate-300 text-ipl-primary focus:ring-ipl-primary w-4 h-4" type="checkbox" />
                                </th>
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Nama Warga</th>
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Bulan</th>
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Jumlah</th>
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Bukti Bayar</th>
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Status</th>
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan="7" className="py-12 text-center text-slate-400">
                                    <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                                    <p className="mt-2 text-sm">Loading data...</p>
                                </td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan="7" className="py-12 text-center text-slate-400">
                                    <span className="material-symbols-outlined text-4xl">search_off</span>
                                    <p className="mt-2 text-sm">No payment records found</p>
                                </td></tr>
                            ) : data.map((item, idx) => {
                                const name = item.household?.headOfFamily?.name || 'N/A';
                                const block = item.household ? `Block ${item.household.block} No. ${item.household.houseNumber}` : '-';
                                const color = avatarColors[idx % avatarColors.length];
                                const isPending = item.status === 'PENDING';
                                const period = `${monthNames[item.month]} ${item.year}`;

                                return (
                                    <tr key={item.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${isPending ? 'bg-amber-50/40 dark:bg-amber-900/10' : ''}`}>
                                        <td className="p-4">
                                            <input className="rounded border-slate-300 text-ipl-primary focus:ring-ipl-primary w-4 h-4" type="checkbox" />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full ${color.bg} ${color.text} flex items-center justify-center text-xs font-bold`}>{getInitials(name)}</div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white text-sm">{name}</p>
                                                    <p className="text-xs text-slate-500">{block}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{period}</td>
                                        <td className="p-4 text-sm font-medium text-slate-900 dark:text-white">{formatCurrency(item.amount)}</td>
                                        <td className="p-4">
                                            {item.proofImage ? (
                                                <button
                                                    onClick={() => openPreview(item.proofImage.startsWith('http') ? item.proofImage : `http://localhost:3001${item.proofImage}`)}
                                                    className="inline-flex items-center gap-1.5 text-ipl-primary hover:text-blue-700 text-sm font-medium transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">image</span>
                                                    <span>Lihat Bukti</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => openDetail(item)}
                                                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-ipl-primary text-sm font-medium transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                    <span>Lihat</span>
                                                </button>
                                            )}
                                        </td>
                                        <td className="p-4">{statusBadge(item.status)}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {isPending && user?.role !== 'WARGA' ? (
                                                    <>
                                                        <button onClick={() => openConfirm('approve', item)} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors" title="Verifikasi">
                                                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                                        </button>
                                                        <button onClick={() => openConfirm('reject', item)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Tolak">
                                                            <span className="material-symbols-outlined text-[20px]">cancel</span>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => openDetail(item)} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-xs text-slate-600 dark:text-slate-300 rounded transition-colors">
                                                        Detail
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Menampilkan <span className="font-medium text-slate-900 dark:text-white">{data.length > 0 ? (meta.page - 1) * meta.limit + 1 : 0}</span> sampai{' '}
                        <span className="font-medium text-slate-900 dark:text-white">{Math.min(meta.page * meta.limit, meta.total)}</span> dari{' '}
                        <span className="font-medium text-slate-900 dark:text-white">{meta.total}</span> data
                    </p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 text-sm" disabled={meta.page <= 1} onClick={() => setMeta(m => ({ ...m, page: m.page - 1 }))}>Previous</button>
                        <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 text-sm" disabled={meta.page >= meta.totalPages} onClick={() => setMeta(m => ({ ...m, page: m.page + 1 }))}>Next</button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <IPLDetailModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} data={selectedIPL} />
            <ImagePreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} imageUrl={previewImage} />
            <ConfirmationModal
                isOpen={confirmAction.isOpen}
                onClose={() => setConfirmAction({ isOpen: false, type: '', data: null })}
                onConfirm={handleConfirmAction}
                title={confirmAction.type === 'approve' ? 'Verifikasi Pembayaran' : 'Tolak Pembayaran'}
                message={confirmAction.type === 'approve'
                    ? `Apakah Anda yakin ingin menyetujui pembayaran IPL dari ${confirmAction.data?.name}?`
                    : `Apakah Anda yakin ingin menolak bukti pembayaran dari ${confirmAction.data?.name}?`}
                type={confirmAction.type === 'approve' ? 'success' : 'danger'}
                confirmText={confirmAction.type === 'approve' ? 'Ya, Verifikasi' : 'Ya, Tolak'}
                showInput={confirmAction.type === 'reject'}
                inputLabel="Catatan Penolakan"
                inputPlaceholder="Misal: Bukti pembayaran blur / nominal tidak sesuai"
            />
        </div>
    )
}

export default IPLPage
