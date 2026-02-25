import React, { useState } from 'react';

const statusColors = {
    NEW: { badge: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300', label: 'Menunggu' },
    IN_PROGRESS: { badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300', label: 'Diproses' },
    RESOLVED: { badge: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300', label: 'Selesai' },
};

const catIcons = {
    Infrastructure: 'construction',
    Security: 'security',
    Cleanliness: 'cleaning_services',
    'Noise Complaint': 'volume_up',
    Other: 'category'
};

const catIconColors = {
    Infrastructure: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300',
    Security: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
    Cleanliness: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
    'Noise Complaint': 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
    Other: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
};

function fmtDate(d) {
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ResidentLapor({ user, data, loading, meta, setMeta, onAddReport, onViewDetail }) {
    const [formData, setFormData] = useState({
        category: 'Security',
        subject: '',
        description: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onAddReport(formData);
        setFormData({ category: 'Security', subject: '', description: '' });
        setIsSubmitting(false);
    };

    return (
        <div className="flex-1 w-full max-w-7xl mx-auto font-display text-text-main">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Laporan Keluhan & Aspirasi</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Sampaikan keluhan atau masukan Anda demi kenyamanan lingkungan kita.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Form Widget (Static placement for resident view as requested by design) */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sticky top-24 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">edit_note</span>
                            Form Laporan Baru
                        </h3>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-1">Kategori</label>
                                <select
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary"
                                    value={formData.category}
                                    onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                                >
                                    <option value="Security">Keamanan</option>
                                    <option value="Infrastructure">Infrastruktur</option>
                                    <option value="Cleanliness">Kebersihan</option>
                                    <option value="Noise Complaint">Sosial / Tetangga</option>
                                    <option value="Other">Lainnya</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-1">Judul Laporan</label>
                                <input
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary placeholder-slate-400"
                                    placeholder="Contoh: Lampu jalan mati"
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-1">Deskripsi</label>
                                <textarea
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary placeholder-slate-400"
                                    placeholder="Jelaskan detail keluhan Anda..."
                                    rows="4"
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                ></textarea>
                            </div>
                            <button
                                className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column - History list */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Riwayat Laporan Saya</h3>
                        <div className="flex gap-2">
                            <button className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                <span className="material-symbols-outlined">filter_list</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="py-12 text-center text-slate-400">
                                <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                                <p className="mt-2 text-sm">Loading riwayat laporan...</p>
                            </div>
                        ) : data.length === 0 ? (
                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center text-slate-500">
                                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300 dark:text-slate-600">inbox</span>
                                <p className="text-sm font-medium">Belum ada riwayat laporan</p>
                            </div>
                        ) : (
                            data.map((item) => {
                                const sc = statusColors[item.status] || statusColors.NEW;
                                const icon = catIcons[item.category] || catIcons.Other;
                                const iconColor = catIconColors[item.category] || catIconColors.Other;
                                const isResolved = item.status === 'RESOLVED';

                                return (
                                    <div key={item.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:border-primary/30 dark:hover:border-primary/50 transition-all shadow-sm">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${iconColor}`}>
                                                    <span className="material-symbols-outlined">{icon}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white">{item.subject}</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">#REP-{new Date(item.createdAt).getFullYear()}-{item.id.toString().slice(-4)} • {fmtDate(item.createdAt)}</p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sc.badge}`}>
                                                {sc.label}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                                            {item.description}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                                            {isResolved ? (
                                                <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium">
                                                    <span className="material-symbols-outlined text-sm">task_alt</span>
                                                    Selesai diproses
                                                </div>
                                            ) : item.status === 'IN_PROGRESS' ? (
                                                <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                                                    <span className="material-symbols-outlined text-sm">pending</span>
                                                    Sedang ditindaklanjuti
                                                </div>
                                            ) : (
                                                <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                                                    Menunggu peninjauan petugas
                                                </div>
                                            )}
                                            <button
                                                onClick={() => onViewDetail && onViewDetail(item)}
                                                className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
                                            >
                                                Lihat Detail <span class="material-symbols-outlined text-sm">chevron_right</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Simplified Pagination for resident */}
                    {data.length > 0 && (
                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Menampilkan {(meta.page - 1) * meta.limit + 1}-{Math.min(meta.page * meta.limit, meta.total)} dari {meta.total}</p>
                            <div className="flex gap-2">
                                <button className="p-1 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700" disabled={meta.page <= 1} onClick={() => setMeta(m => ({ ...m, page: m.page - 1 }))}>Sebelumnya</button>
                                <button className="p-1 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700" disabled={meta.page >= meta.totalPages} onClick={() => setMeta(m => ({ ...m, page: m.page + 1 }))}>Selanjutnya</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ResidentLapor;
