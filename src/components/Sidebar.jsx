import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'

function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Konfirmasi Logout',
            text: "Apakah Anda yakin ingin keluar dari aplikasi?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6', // primary color
            cancelButtonColor: '#ef4444', // red-500
            confirmButtonText: 'Ya, Logout!',
            cancelButtonText: 'Batal',
            customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'rounded-xl',
                cancelButton: 'rounded-xl'
            }
        });

        if (result.isConfirmed) {
            try {
                await logout();
                navigate('/login');
            } catch (error) {
                console.error('Logout failed:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Terjadi kesalahan saat logout.',
                    icon: 'error',
                    customClass: {
                        popup: 'rounded-2xl'
                    }
                });
            }
        }
    };

    const isWarga = user?.role === 'WARGA';

    let navItems = [
        { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
        { icon: 'group', label: isWarga ? 'Keluarga Saya' : 'Warga', path: '/warga' },
        { icon: 'sync_alt', label: 'Mutasi', path: '/mutasi' },
        { icon: 'account_balance_wallet', label: 'IPL', path: '/ipl' },
        { icon: 'description', label: 'Izin', path: '/izin' },
        { icon: 'campaign', label: 'Lapor', path: '/lapor' },
        { icon: 'history', label: 'Log', path: '/log' },
    ]

    if (isWarga) {
        navItems = navItems.filter(item => item.path !== '/log');
    }

    return (
        <aside className="w-64 flex-shrink-0 bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen z-20">
            {/* Logo Area */}
            <div className="px-6 py-8 flex items-center gap-3">
                <div className="bg-primary text-white flex items-center justify-center rounded-xl size-11 shrink-0 shadow-md shadow-primary/20">
                    <span className="material-symbols-outlined text-2xl">apartment</span>
                </div>
                <div className="flex flex-col min-w-0">
                    <h1 className="text-text-main dark:text-white text-base font-bold leading-tight truncate">Gading New Town</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium truncate mt-0.5">{isWarga ? 'Warga Portal' : 'RT Admin Panel'}</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2 no-scrollbar">
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path) || (location.pathname === '/' && item.path === '/dashboard');
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium ${isActive
                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800/50 dark:hover:text-white'
                                }`}
                        >
                            <span
                                className={`material-symbols-outlined text-[20px] transition-colors`}
                                style={isActive ? { fontVariationSettings: "'FILL' 1" } : { fontVariationSettings: "'FILL' 0" }}
                            >
                                {item.icon}
                            </span>
                            <span className="text-sm tracking-wide">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom User Area */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                    <div className="size-10 rounded-full bg-slate-200 overflow-hidden relative border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center">
                        {user?.image ? (
                            <img
                                alt={`${user?.name || 'User'} Profile`}
                                className="object-cover w-full h-full"
                                src={user.image}
                            />
                        ) : (
                            <span className="material-symbols-outlined text-slate-400 text-2xl">person</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{user?.role === 'RT' ? 'Ketua RT' : 'Warga'}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Logout"
                    >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                    </button>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
