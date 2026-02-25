import Modal from './Modal';

function ImagePreviewModal({ isOpen, onClose, imageUrl, title = "Bukti Pembayaran" }) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            maxWidth="max-w-3xl"
        >
            <div className="space-y-4">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-2 flex items-center justify-center min-h-[300px]">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={title}
                            className="max-w-full max-h-[60vh] object-contain rounded-lg"
                        />
                    ) : (
                        <div className="text-slate-400 flex flex-col items-center gap-2">
                            <span className="material-symbols-outlined text-[48px]">broken_image</span>
                            <p className="text-sm">Gambar tidak tersedia</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    {imageUrl && (
                        <button className="px-3 py-2 text-sm font-medium text-ipl-primary bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            Download
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default ImagePreviewModal;
