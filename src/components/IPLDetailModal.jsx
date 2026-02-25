import Modal from './Modal';

function IPLDetailModal({ isOpen, onClose, data }) {
    if (!data) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detail Pembayaran IPL"
            maxWidth="max-w-xl"
        >
            <div className="space-y-6">
                {/* Status Banner */}
                <div className={`p-4 rounded-xl flex items-center justify-between ${data.status === 'VERIFIED' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                    data.status === 'PENDING' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' :
                        data.status === 'UNPAID' ? 'bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-400' :
                            'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    }`}>
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[24px]">
                            {data.status === 'VERIFIED' ? 'check_circle' : data.status === 'PENDING' ? 'schedule' : data.status === 'UNPAID' ? 'radio_button_unchecked' : 'cancel'}
                        </span>
                        <div>
                            <p className="text-sm font-medium">Status Pembayaran</p>
                            <p className="text-lg font-bold">{data.status === 'VERIFIED' ? 'Lunas' : data.status === 'PENDING' ? 'Pending' : data.status === 'UNPAID' ? 'Belum Bayar' : 'Ditolak'}</p>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Nama Warga</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{data.name}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Blok / Nomor</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{data.block}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Periode Tagihan</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{data.period}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Jumlah Tagihan</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{data.amount}</p>
                    </div>
                </div>

                {/* Admin Notes if Rejected */}
                {data.status === 'REJECTED' && data.notes && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Penolakan:</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{data.notes}</p>
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
                    {data.status === 'PENDING' && (
                        <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-600/25">
                            Verifikasi Pembayaran
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
}

export default IPLDetailModal;
