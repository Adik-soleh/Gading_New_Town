import Modal from './Modal';

function LaporanDetailModal({ isOpen, onClose, data }) {
    if (!data) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detail Laporan / Pengaduan"
            maxWidth="max-w-2xl"
        >
            <div className="space-y-6">

                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white">{data.subject}</h4>
                        <div className="flex items-center gap-3 mt-2 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                {data.date}
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">category</span>
                                {data.category}
                            </span>
                        </div>
                    </div>
                    <div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${data.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                                data.status === 'On Progress' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                                    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                            }`}>
                            {data.status}
                        </span>
                    </div>
                </div>

                {/* Reporter Info */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-lg">
                        {data.reporterName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Pelapor</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{data.reporterName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{data.reporterBlock}</p>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Deskripsi Laporan</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {data.description || "Tidak ada deskripsi yang diberikan."}
                    </p>
                </div>

                {/* Photos */}
                {data.photos && data.photos.length > 0 && (
                    <div>
                        <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">photo_library</span>
                            Lampiran Foto
                        </h5>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {data.photos.map((photo, index) => (
                                <div key={index} className="aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 relative group cursor-pointer">
                                    <img src={photo} alt={`Lampiran ${index + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white">zoom_in</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        Tutup
                    </button>
                    {data.status !== 'Resolved' && (
                        <button className="px-4 py-2 text-sm font-medium text-white bg-lapor-primary rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-lapor-primary/25">
                            Tindak Lanjuti
                        </button>
                    )}
                </div>

            </div>
        </Modal>
    );
}

export default LaporanDetailModal;
