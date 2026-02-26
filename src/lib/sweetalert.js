import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

export const Toast = {
    fire: (options) => {
        const message = options.title || options.text;
        if (options.icon === 'success') {
            toast.success(message);
        } else if (options.icon === 'error') {
            toast.error(message);
        } else {
            toast(message);
        }
    }
};

export const confirmDialog = (title, text, confirmButtonText = 'Ya, Hapus!') => {
    return Swal.fire({
        title: title || 'Apakah Anda yakin?',
        text: text || "Tindakan ini tidak dapat dibatalkan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: confirmButtonText,
        cancelButtonText: 'Batal'
    });
};
