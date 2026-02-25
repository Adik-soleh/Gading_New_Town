import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';

function WargaFormModal({ isOpen, onClose, initialData = null, onSave }) {
    const { user } = useAuth();
    const isWarga = user?.role === 'WARGA';

    const isEditing = !!initialData;

    const [formData, setFormData] = useState(initialData || {
        nik: '',
        kkNumber: '',
        name: '',
        role: 'Kepala Keluarga',
        status: 'Active',
        block: 'A',
        houseNumber: '',
        phone: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                nik: '',
                kkNumber: '',
                name: '',
                role: 'Kepala Keluarga',
                status: 'Active',
                block: 'A',
                houseNumber: '',
                phone: ''
            });
        }
    }, [initialData]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (onSave) {
                await onSave(formData);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? "Edit Data Warga" : "Tambah Warga Baru"}
            maxWidth="max-w-2xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Personal Information */}
                <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span className="material-symbols-outlined text-[18px] text-warga-primary">person</span>
                        Informasi Personal
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Nomor Induk Kependudukan (NIK) <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="nik"
                                value={formData.nik}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-warga-primary focus:border-transparent text-slate-900 dark:text-white"
                                placeholder="16 digit NIK"
                            />
                        </div>

                        {!isWarga && (
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Nomor Kartu Keluarga (KK) <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="kkNumber"
                                    value={formData.kkNumber}
                                    onChange={handleChange}
                                    required={!isWarga}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-warga-primary focus:border-transparent text-slate-900 dark:text-white"
                                    placeholder="16 digit No. KK"
                                />
                            </div>
                        )}

                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Nama Lengkap <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-warga-primary focus:border-transparent text-slate-900 dark:text-white"
                                placeholder="Sesuai KTP"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Peran dalam Keluarga</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-warga-primary focus:border-transparent text-slate-900 dark:text-white appearance-none"
                            >
                                <option value="Kepala Keluarga">Kepala Keluarga</option>
                                <option value="Istri">Istri</option>
                                <option value="Anak">Anak</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Status Warga</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-warga-primary focus:border-transparent text-slate-900 dark:text-white appearance-none"
                            >
                                <option value="Active">Aktif</option>
                                <option value="Inactive">Pindah / Tidak Aktif</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Additional Information - Hidden for Warga since they can only add to current household */}
                {!isWarga && (
                    <div>
                        <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                            <span className="material-symbols-outlined text-[18px] text-warga-primary">home</span>
                            Informasi Domisili & Kontak
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Blok Rumah</label>
                                <select
                                    name="block"
                                    value={formData.block}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-warga-primary focus:border-transparent text-slate-900 dark:text-white appearance-none"
                                >
                                    <option value="A">Blok A</option>
                                    <option value="B">Blok B</option>
                                    <option value="C">Blok C</option>
                                    <option value="D">Blok D</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Nomor Rumah <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="houseNumber"
                                    value={formData.houseNumber}
                                    onChange={handleChange}
                                    required={!isWarga}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-warga-primary focus:border-transparent text-slate-900 dark:text-white"
                                    placeholder="Misal: 12"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-1 mt-4">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Nomor Telepon / WhatsApp</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-warga-primary focus:border-transparent text-slate-900 dark:text-white"
                        placeholder="08xxxxxxxxxx"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-white bg-warga-primary rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-warga-primary/25 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Tambah Warga')}
                    </button>
                </div>

            </form>
        </Modal>
    );
}

export default WargaFormModal;
