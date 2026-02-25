import { useState, useEffect } from 'react';
import Modal from './Modal';

function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Konfirmasi Aksi",
    message = "Apakah Anda yakin ingin melanjutkan aksi ini?",
    confirmText = "Ya, Lanjutkan",
    cancelText = "Batal",
    type = "warning", // 'warning', 'danger', 'success', 'info'
    isLoading = false,
    showInput = false,
    inputLabel = "Catatan",
    inputPlaceholder = "Masukkan alasan..."
}) {
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        if (isOpen) {
            setInputValue("");
        }
    }, [isOpen]);

    const handleConfirm = () => {
        if (showInput) {
            onConfirm(inputValue);
        } else {
            onConfirm();
        }
    };

    const getColors = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: 'text-red-500 bg-red-100 dark:bg-red-900/20',
                    button: 'bg-red-600 hover:bg-red-700 shadow-red-600/25',
                    iconName: 'warning'
                };
            case 'success':
                return {
                    icon: 'text-green-500 bg-green-100 dark:bg-green-900/20',
                    button: 'bg-green-600 hover:bg-green-700 shadow-green-600/25',
                    iconName: 'check_circle'
                };
            case 'info':
                return {
                    icon: 'text-blue-500 bg-blue-100 dark:bg-blue-900/20',
                    button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25',
                    iconName: 'info'
                };
            case 'warning':
            default:
                return {
                    icon: 'text-amber-500 bg-amber-100 dark:bg-amber-900/20',
                    button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25',
                    iconName: 'error'
                };
        }
    };

    const colors = getColors();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            maxWidth="max-w-md"
        >
            <div className="flex flex-col items-center text-center space-y-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${colors.icon}`}>
                    <span className="material-symbols-outlined text-[32px]">{colors.iconName}</span>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{message}</p>

                    {showInput && (
                        <div className="w-full text-left mt-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{inputLabel}</label>
                            <input
                                type="text"
                                className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-primary focus:border-primary text-sm"
                                placeholder={inputPlaceholder}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <div className="flex w-full items-center justify-center gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading || (showInput && !inputValue.trim())}
                        className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors shadow-lg ${colors.button} disabled:opacity-50 flex justify-center items-center gap-2`}
                    >
                        {isLoading && (
                            <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                        )}
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default ConfirmationModal;
