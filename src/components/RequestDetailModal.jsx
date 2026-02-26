import Modal from './Modal';

function RequestDetailModal({ isOpen, onClose, data }) {
    if (!data) return null;

    const isIzin = data.type === 'izin'; // 'izin' or 'mutasi'

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isIzin ? "Detail Permohonan Izin" : "Detail Pengajuan Mutasi"}
            maxWidth="max-w-2xl"
        >
            <div className="space-y-6">
                {/* Header / Status Banner */}
                <div className={`p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${data.status === 'Disetujui' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 text-green-800 dark:text-green-300' :
                    data.status === 'Pending' ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 text-amber-800 dark:text-amber-300' :
                        'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 text-red-800 dark:text-red-300'
                    }`}>
                    <div>
                        <p className="text-xs font-semibold mb-1 uppercase tracking-wider">Status Pengajuan</p>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">
                                {data.status === 'Disetujui' ? 'check_circle' : data.status === 'Pending' ? 'hourglass_empty' : 'cancel'}
                            </span>
                            <span className="text-lg font-bold">{data.status}</span>
                        </div>
                    </div>
                    {data.status === 'Pending' && (
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">check</span>
                                Setujui
                            </button>
                            <button className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">close</span>
                                Tolak
                            </button>
                        </div>
                    )}
                </div>

                {/* Applicant Info */}
                <div>
                    <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span className="material-symbols-outlined text-[18px]">person</span>
                        Informasi Pemohon
                    </h5>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Nama Lengkap</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{data.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Blok / Nomor Rumah</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{data.block}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Tanggal Pengajuan</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{data.date}</p>
                        </div>
                    </div>
                </div>

                {/* Specific Details based on type */}
                <div>
                    <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span className="material-symbols-outlined text-[18px]">{isIzin ? 'description' : 'move_location'}</span>
                        Detail {isIzin ? 'Perizinan' : 'Mutasi'}
                    </h5>

                    {isIzin ? (
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Jenis Izin</p>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{data.category}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Tanggal Mulai</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{data.startDate || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Tanggal Selesai</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{data.endDate || '-'}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Keterangan / Tujuan</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg mt-1 border border-slate-100 dark:border-slate-700">
                                    {data.description || "Tidak ada keterangan tambahan."}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Jenis Mutasi</p>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{data.mutasiType}</p>
                            </div>
                            {data.mutasiType === 'Pindah Keluar' ? (
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Alamat Tujuan Pindah</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg mt-1 border border-slate-100 dark:border-slate-700">
                                        {data.destinationAddress || "Alamat tidak disertakan."}
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Alamat Asal</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg mt-1 border border-slate-100 dark:border-slate-700">
                                        {data.originAddress || "Alamat tidak disertakan."}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Alasan Mutasi</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg mt-1 border border-slate-100 dark:border-slate-700">
                                    {data.reason || "Tidak ada alasan yang disertakan."}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Attachments */}
                {data.attachment && (
                    <div>
                        <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                            <span className="material-symbols-outlined text-[18px]">attach_file</span>
                            Dokumen Pendukung
                        </h5>
                        <div className="flex flex-col gap-2">
                            <a href={`http://localhost:3001${data.attachment}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                                        <span className="material-symbols-outlined">description</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">Lihat / Unduh Dokumen</p>
                                        <p className="text-xs text-slate-500">Klik untuk membuka file {typeof data.attachment === 'string' ? data.attachment.split('/').pop() : 'dokumen'}</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600">open_in_new</span>
                            </a>
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
                    {data.status === 'Disetujui' && (
                        <button className="px-4 py-2 text-sm font-medium text-primary-blue bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">print</span>
                            Cetak Surat
                        </button>
                    )}
                </div>

            </div>
        </Modal>
    );
}

export default RequestDetailModal;
