import { useLocation } from 'react-router-dom'

const routeTitles = {
    '/dashboard': 'Dashboard',
    '/warga': 'Data Warga',
    '/mutasi': 'Mutasi Warga',
    '/ipl': 'IPL & Keuangan',
    '/izin': 'Perizinan',
    '/lapor': 'Laporan Warga',
    '/log': 'Activity Log'
}

function Header() {
    const location = useLocation()

    let title = 'Dashboard'
    for (const [path, routeTitle] of Object.entries(routeTitles)) {
        if (location.pathname.startsWith(path)) {
            title = routeTitle
            break
        }
    }

    return (
        <header className="h-16 flex items-center justify-between px-8 bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
            {/* Left Title */}
            <div className="flex items-center">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">{title}</h2>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
                {/* Search */}
                <div className="relative group w-64 md:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">search</span>
                    </div>
                    <input
                        className="block w-full pl-10 pr-3 py-2 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm placeholder-slate-400 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm"
                        placeholder="Search residents..."
                        type="text"
                    />
                </div>

                <button className="relative p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-2 right-2 size-2.5 bg-text-main dark:bg-white rounded-full border-2 border-white dark:border-surface-dark"></span>
                </button>
            </div>
        </header>
    )
}

export default Header
