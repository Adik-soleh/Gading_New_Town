import { useState, useEffect } from 'react';
import Modal from './Modal';

function AddRequestModal({ isOpen, onClose, type, onSave, initialData }) {
    const isIzin = type === 'izin'; // 'izin' or 'mutasi'
    const isEdit = !!initialData;

    const [formData, setFormData] = useState({
        name: '',
        block: '',
        category: '', // Jenis Izin
        startDate: '',
        endDate: '',
        description: '', // Keterangan Izin
        mutasiType: 'Pindah Keluar', // Jenis Mutasi
        originAddress: '',
        destinationAddress: '',
        reason: '',
        attachment: null
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.household?.headOfFamily?.name || '',
                    block: initialData.household ? `Blok ${initialData.household.block} No. ${initialData.household.houseNumber}` : '',
                    category: initialData.category || '',
                    startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
                    endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
                    description: initialData.description || '',
                    mutasiType: initialData.mutasiType || 'Pindah Keluar',
                    originAddress: initialData.originAddress || '',
                    destinationAddress: initialData.destinationAddress || '',
                    reason: initialData.reason || '',
                    attachment: initialData.attachment || null
                });
            } else {
                setFormData({
                    name: '',
                    block: '',
                    category: '',
                    startDate: '',
                    endDate: '',
                    description: '',
                    mutasiType: 'Pindah Keluar',
                    originAddress: '',
                    destinationAddress: '',
                    reason: '',
                    attachment: null
                });
            }
        }
    }, [isOpen, initialData]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'attachment') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (onSave) {
            await onSave(formData);
        } else {
            console.log(`Submitting New ${isIzin ? 'Izin' : 'Mutasi'}:`, formData);
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? (isIzin ? "Edit Permohonan Izin" : "Edit Pengajuan Mutasi") : (isIzin ? "Buat Permohonan Izin Baru" : "Pengajuan Mutasi Baru")}
            maxWidth="max-w-2xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Pemohon Info */}
                <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span className="material-symbols-outlined text-[18px]">person</span>
                        Data Pemohon
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Nama Lengkap <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white"
                                placeholder="Sesuai KTP"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Blok / Nomor Rumah <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="block"
                                value={formData.block}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white"
                                placeholder="Misal: Blok A No. 12"
                            />
                        </div>
                    </div>
                </div>

                {/* Specific Fields */}
                <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span className="material-symbols-outlined text-[18px]">{isIzin ? 'description' : 'move_location'}</span>
                        {isIzin ? 'Detail Perizinan' : 'Data Kepindahan'}
                    </h4>

                    {isIzin ? (
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Jenis Izin <span className="text-red-500">*</span></label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-izin-primary focus:border-transparent text-slate-900 dark:text-white appearance-none"
                                >
                                    <option value="">Pilih Jenis Izin</option>
                                    <option value="Renovasi Rumah">Renovasi Rumah</option>
                                    <option value="Acara Terbuka">Acara Terbuka / Pesta</option>
                                    <option value="Penebangan Pohon">Penebangan Pohon</option>
                                    <option value="Lainnya">Lainnya...</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Tanggal Mulai <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-izin-primary focus:border-transparent text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Tanggal Selesai <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-izin-primary focus:border-transparent text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Keterangan / Tujuan <span className="text-red-500">*</span></label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    rows="3"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-izin-primary focus:border-transparent text-slate-900 dark:text-white"
                                    placeholder="Jelaskan secara detail tujuan permohonan izin ini..."
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Jenis Mutasi <span className="text-red-500">*</span></label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="mutasiType"
                                            value="Pindah Keluar"
                                            checked={formData.mutasiType === 'Pindah Keluar'}
                                            onChange={handleChange}
                                            className="text-mutasi-primary focus:ring-mutasi-primary h-4 w-4"
                                        />
                                        Pindah Keluar
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="mutasiType"
                                            value="Pindah Masuk"
                                            checked={formData.mutasiType === 'Pindah Masuk'}
                                            onChange={handleChange}
                                            className="text-mutasi-primary focus:ring-mutasi-primary h-4 w-4"
                                        />
                                        Pindah Masuk
                                    </label>
                                </div>
                            </div>

                            {formData.mutasiType === 'Pindah Keluar' ? (
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Alamat Tujuan Pindah <span className="text-red-500">*</span></label>
                                    <textarea
                                        name="destinationAddress"
                                        value={formData.destinationAddress}
                                        onChange={handleChange}
                                        required
                                        rows="2"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-mutasi-primary focus:border-transparent text-slate-900 dark:text-white"
                                        placeholder="Alamat lengkap tujuan pindah..."
                                    />
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Alamat Asal <span className="text-red-500">*</span></label>
                                    <textarea
                                        name="originAddress"
                                        value={formData.originAddress}
                                        onChange={handleChange}
                                        required
                                        rows="2"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-mutasi-primary focus:border-transparent text-slate-900 dark:text-white"
                                        placeholder="Alamat lengkap tempat tinggal sebelumnya..."
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Alasan Mutasi</label>
                                <textarea
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-mutasi-primary focus:border-transparent text-slate-900 dark:text-white"
                                    placeholder="Opsional"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Dokumen Pendukung <span className="text-slate-400 font-normal">(Opsional)</span></label>
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 w-full px-4 overflow-hidden">
                                <span className={`material-symbols-outlined text-3xl mb-2 ${formData.attachment ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400'}`}>
                                    {formData.attachment ? (typeof formData.attachment === 'string' ? 'description' : 'check_circle') : 'cloud_upload'}
                                </span>
                                <p className="mb-1 text-sm text-slate-500 dark:text-slate-400 text-center truncate max-w-full">
                                    {formData.attachment ? (
                                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                                            {typeof formData.attachment === 'string' ? "File sudah terlampir (Klik untuk mengganti)" : formData.attachment.name}
                                        </span>
                                    ) : (
                                        <><span className="font-semibold">Click to upload</span> atau drag and drop</>
                                    )}
                                </p>
                                {!formData.attachment && <p className="text-xs text-slate-500 dark:text-slate-400">PDF, JPG or PNG (MAX. 5MB)</p>}
                            </div>
                            <input
                                type="file"
                                name="attachment"
                                className="hidden"
                                onChange={handleChange}
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                        </label>
                    </div>
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
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-lg flex items-center gap-2 ${isIzin ? 'bg-izin-primary hover:bg-blue-600 shadow-izin-primary/25' : 'bg-mutasi-primary hover:bg-blue-600 shadow-mutasi-primary/25'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">{isEdit ? 'save' : 'send'}</span>
                        {isEdit ? 'Simpan Perubahan' : 'Kirim Pengajuan'}
                    </button>
                </div>

            </form>
        </Modal>
    );
}

export default AddRequestModal;
