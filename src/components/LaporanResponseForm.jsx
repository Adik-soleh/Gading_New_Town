import { useState } from 'react';
import Modal from './Modal';

function LaporanResponseForm({ isOpen, onClose, data }) {
    if (!data) return null;

    const [status, setStatus] = useState(data.status === 'Pending' ? 'On Progress' : 'Resolved');
    const [responseMessage, setResponseMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting Response:", { id: data.id, status, responseMessage });
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Tanggapi Laporan"
            maxWidth="max-w-lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">Menanggapi Laporan:</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{data.subject}</p>
                    <p className="text-xs text-slate-500 mt-1">Dari: {data.reporterName}</p>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Update Status Laporan</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <label className={`flex-1 cursor-pointer p-3 rounded-lg border text-sm font-medium transition-colors ${status === 'On Progress'
                                ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400'
                                : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}>
                            <input
                                type="radio"
                                name="status"
                                value="On Progress"
                                checked={status === 'On Progress'}
                                onChange={() => setStatus('On Progress')}
                                className="sr-only"
                            />
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">engineering</span>
                                Sedang Diproses
                            </div>
                        </label>

                        <label className={`flex-1 cursor-pointer p-3 rounded-lg border text-sm font-medium transition-colors ${status === 'Resolved'
                                ? 'bg-green-50 border-green-600 text-green-700 dark:bg-green-900/30 dark:border-green-500 dark:text-green-400'
                                : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}>
                            <input
                                type="radio"
                                name="status"
                                value="Resolved"
                                checked={status === 'Resolved'}
                                onChange={() => setStatus('Resolved')}
                                className="sr-only"
                            />
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                Selesai
                            </div>
                        </label>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pesan Tanggapan (Response)</label>
                    <p className="text-xs text-slate-500 mb-2">Pesan ini akan dikirim / dapat dilihat oleh pelapor.</p>
                    <textarea
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        required
                        rows="4"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-lapor-primary focus:border-transparent text-slate-900 dark:text-white"
                        placeholder="Tuliskan tanggapan atau solusi penyelesaian disini..."
                    ></textarea>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-lapor-primary rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-lapor-primary/25"
                    >
                        Update Laporan
                    </button>
                </div>

            </form>
        </Modal>
    );
}

export default LaporanResponseForm;
