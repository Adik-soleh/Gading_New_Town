import React, { useState } from 'react';
import { upload, ipl } from '../lib/api';
import { dateFormatHistory } from '../lib/datePlugin';
import IPLDetailModal from './IPLDetailModal';

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

function ResidentIPL({ user, data, loading, meta, setMeta, onUploadProof, onSuccess, summary }) {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedIPLData, setSelectedIPLData] = useState(null);
    const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [amount, setAmount] = useState(250000); // Default placeholder
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Generate last 6 months for selection
    const monthOptions = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        return { month: d.getMonth() + 1, year: d.getFullYear(), label: `${monthNames[d.getMonth() + 1]} ${d.getFullYear()}` };
    });

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert('Pilih file bukti transfer terlebih dahulu');
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Upload the file to S3/Disk
            const uploadRes = await upload.file(file);

            // 2. Submit the IPL Payment
            await ipl.create({
                month: parseInt(selectedMonth),
                year: parseInt(selectedYear),
                amount: parseInt(amount),
                proofImage: uploadRes.url,
            });

            setIsUploadModalOpen(false);
            setFile(null);
            if (onSuccess) onSuccess(); // Notify parent to refresh list
        } catch (err) {
            console.error('Failed to submit IPL:', err);
            alert(err.message || 'Gagal mengunggah pembayaran.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const statusBadge = (status) => {
        const map = {
            VERIFIED: { classes: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300', label: 'Lunas' },
            PENDING: { classes: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300', label: 'Pending' },
            REJECTED: { classes: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300', label: 'Ditolak' },
            UNPAID: { classes: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400', label: 'Belum Bayar' },
        };
        const cfg = map[status] || map.UNPAID;
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.classes}`}>
                {cfg.label}
            </span>
        );
    };

    const currentMonthStatus = () => {
        if (!summary) return { text: 'Memuat...', color: 'text-slate-400', icon: 'sync' };
        if (summary.paid > 0) return { text: 'Sudah Bayar', color: 'text-success dark:text-green-400', icon: 'check_circle' };
        if (summary.pending > 0) return { text: 'Menunggu Verifikasi', color: 'text-amber-500', icon: 'hourglass_empty' };
        return { text: 'Belum Bayar', color: 'text-red-500', icon: 'cancel' };
    };

    const currentStatus = currentMonthStatus();

    const openDetailModal = (item) => {
        setSelectedIPLData({
            name: item.household?.headOfFamily?.name || user?.name || 'N/A',
            block: item.household ? `Block ${item.household.block} No. ${item.household.houseNumber}` : '-',
            period: `${monthNames[item.month]} ${item.year}`,
            amount: formatCurrency(item.amount),
            status: item.status,
            notes: item.notes,
        });
        setIsDetailModalOpen(true);
    };

    return (
        <div className="max-w-7xl mx-auto w-full font-display text-text-main">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Riwayat Pembayaran IPL</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base">Kelola dan pantau iuran pemeliharaan lingkungan Anda</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined">upload_file</span>
                    Bayar IPL
                </button>
            </div>

            <div className="mb-8">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row shadow-sm">
                    <div className="p-8 flex-1 flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <span className="material-symbols-outlined text-xl">event</span>
                            <span className="text-sm font-medium">Bulan Berjalan: {monthNames[currentDate.getMonth() + 1]} {currentDate.getFullYear()}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Status Pembayaran</h3>
                            <div className="flex items-center gap-3">
                                <span className={`text-3xl font-bold ${currentStatus.color}`}>{currentStatus.text}</span>
                                <span className={`material-symbols-outlined ${currentStatus.color} text-3xl`}>{currentStatus.icon}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-8 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 flex flex-col justify-center min-w-[300px]">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium">Total Iuran Bulanan</p>
                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatCurrency(summary?.target || 250000)}</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Ditetapkan berdasarkan luas kavling & fasilitas.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Daftar Transaksi</h3>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                            <input className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm focus:ring-primary focus:border-primary text-slate-900 dark:text-white" placeholder="Cari bulan..." type="text" />
                        </div>
                        <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <span className="material-symbols-outlined">filter_list</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bulan Tagihan</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nominal</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tanggal Unggah</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-slate-400">
                                        <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                                        <p className="mt-2 text-sm">Loading data...</p>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-slate-400">
                                        <span className="material-symbols-outlined text-4xl">search_off</span>
                                        <p className="mt-2 text-sm">Belum ada riwayat pembayaran</p>
                                    </td>
                                </tr>
                            ) : (
                                data.map((item) => {
                                    const shortMonth = monthNames[item.month]?.substring(0, 3).toUpperCase() || '???';
                                    const fullPeriod = `${monthNames[item.month]} ${item.year}`;
                                    const dateStr = item.createdAt ? dateFormatHistory(item.createdAt) : '-';

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-primary flex items-center justify-center font-bold text-xs">{shortMonth}</div>
                                                    <span className="font-semibold text-slate-900 dark:text-white text-sm">{fullPeriod}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{formatCurrency(item.amount)}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{dateStr}</td>
                                            <td className="px-6 py-4">
                                                {statusBadge(item.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    {item.proofImage ? (
                                                        <button onClick={() => onUploadProof && onUploadProof(item, 'view')} className="text-primary hover:text-blue-700 dark:hover:text-blue-400 text-sm font-semibold">Lihat Bukti</button>
                                                    ) : item.status === 'REJECTED' ? (
                                                        <button onClick={() => {
                                                            setSelectedMonth(item.month);
                                                            setSelectedYear(item.year);
                                                            setAmount(item.amount || summary?.target || 250000);
                                                            setIsUploadModalOpen(true);
                                                        }} className="text-primary hover:text-blue-700 dark:hover:text-blue-400 text-sm font-semibold">Re-upload</button>
                                                    ) : (
                                                        <button onClick={() => {
                                                            setSelectedMonth(item.month);
                                                            setSelectedYear(item.year);
                                                            setAmount(item.amount || summary?.target || 250000);
                                                            setIsUploadModalOpen(true);
                                                        }} className="text-slate-400 hover:text-primary text-sm font-semibold">Unggah Bukti</button>
                                                    )}

                                                    <button onClick={() => openDetailModal(item)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 rounded-lg transition-colors">
                                                        Detail
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Menampilkan {data.length > 0 ? (meta.page - 1) * meta.limit + 1 : 0} dari {meta.total} riwayat pembayaran
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            className="p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-500 dark:text-slate-400"
                            disabled={meta.page <= 1}
                            onClick={() => setMeta(m => ({ ...m, page: m.page - 1 }))}
                        >
                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                        </button>
                        <button
                            className="p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-500 dark:text-slate-400"
                            disabled={meta.page >= meta.totalPages}
                            onClick={() => setMeta(m => ({ ...m, page: m.page + 1 }))}
                        >
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-primary/10 flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined">info</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Cara Konfirmasi</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Gunakan tombol 'Bayar IPL' untuk mengunggah bukti transfer. Pastikan nominal dan berita acara sesuai untuk mempercepat proses verifikasi oleh RT/RW.</p>
                    </div>
                </div>
                <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0">
                        <span className="material-symbols-outlined">account_balance</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Rekening Pembayaran</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Bank Mandiri: 123-000-4567-890<br />a.n. Iuran Warga Gading New Town</p>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-stretch md:items-center justify-end md:justify-center">
                    <div className="h-full w-full md:h-auto md:max-h-[90vh] md:rounded-2xl max-w-md bg-white dark:bg-slate-800 shadow-2xl p-8 overflow-y-auto relative animate-in slide-in-from-right md:slide-in-from-bottom-4">
                        <div className="flex items-center justify-between mb-8 md:mt-2 sticky top-0 bg-white dark:bg-slate-800 z-10 py-2">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Unggah Bukti Bayar</h2>
                            <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form className="flex flex-col gap-6" onSubmit={handleUploadSubmit}>
                            <div>
                                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Pilih Bulan</label>
                                <select
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-primary text-slate-900 dark:text-white"
                                    value={`${selectedMonth}-${selectedYear}`}
                                    onChange={(e) => {
                                        const [m, y] = e.target.value.split('-');
                                        setSelectedMonth(m);
                                        setSelectedYear(y);
                                    }}
                                >
                                    {monthOptions.map((opt) => (
                                        <option key={`${opt.month}-${opt.year}`} value={`${opt.month}-${opt.year}`}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Nominal Transfer</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                                    <input
                                        className="w-full pl-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-primary font-bold text-slate-900 dark:text-white"
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Bukti Transfer (Gambar/PDF)</label>
                                <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center gap-2 hover:border-primary/50 dark:hover:border-primary/50 transition-colors cursor-pointer bg-slate-50 dark:bg-slate-900/50">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        required
                                    />
                                    {file ? (
                                        <div className="text-center">
                                            <span className="material-symbols-outlined text-4xl text-green-500">check_circle</span>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{file.name}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">add_photo_alternate</span>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Klik untuk unggah file</p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">PNG, JPG, PDF max 5MB</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button disabled={isSubmitting} className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-primary/20 disabled:opacity-50" type="submit">
                                    {isSubmitting ? 'Mengunggah...' : 'Konfirmasi Pembayaran'}
                                </button>
                                <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4 italic">Verifikasi biasanya membutuhkan waktu 1x24 jam.</p>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* IPL Detail Modal */}
            <IPLDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} data={selectedIPLData} hideAdminActions={true} />
        </div>
    );
}

export default ResidentIPL;
