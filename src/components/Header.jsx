import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { notifications } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const routeTitles = {
    '/dashboard': 'Dashboard',
    '/warga': 'Data Warga',
    '/mutasi': 'Mutasi Warga',
    '/ipl': 'IPL & Keuangan',
    '/izin': 'Perizinan',
    '/lapor': 'Laporan Warga',
    '/log': 'Activity Log'
}

const typeIcons = {
    IPL_PAYMENT: { icon: 'payments', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
    PERMIT_REQUEST: { icon: 'gavel', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    MUTATION_REQUEST: { icon: 'swap_horiz', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30' },
    REPORT: { icon: 'flag', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/30' },
}

const typeRoutes = {
    IPL_PAYMENT: '/ipl',
    PERMIT_REQUEST: '/izin',
    MUTATION_REQUEST: '/mutasi',
    REPORT: '/lapor',
}

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Baru saja'
    if (mins < 60) return `${mins} menit lalu`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} jam lalu`
    const days = Math.floor(hours / 24)
    return `${days} hari lalu`
}

function Header() {
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const [notifList, setNotifList] = useState([])
    const [loading, setLoading] = useState(false)
    const dropdownRef = useRef(null)

    let title = 'Dashboard'
    for (const [path, routeTitle] of Object.entries(routeTitles)) {
        if (location.pathname.startsWith(path)) {
            title = routeTitle
            break
        }
    }

    // Fetch unread count periodically
    useEffect(() => {
        if (!user) return
        fetchUnreadCount()
        const interval = setInterval(fetchUnreadCount, 30000) // every 30s
        return () => clearInterval(interval)
    }, [user])

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    async function fetchUnreadCount() {
        try {
            const res = await notifications.unreadCount()
            setUnreadCount(res.count || 0)
        } catch (err) {
            // silently fail
        }
    }

    async function fetchNotifications() {
        setLoading(true)
        try {
            const res = await notifications.list({ limit: 10 })
            setNotifList(res.data || [])
        } catch (err) {
            console.error('Failed to load notifications:', err)
        }
        setLoading(false)
    }

    function toggleDropdown() {
        if (!isOpen) {
            fetchNotifications()
        }
        setIsOpen(!isOpen)
    }

    async function handleMarkAllRead() {
        try {
            await notifications.markAllAsRead()
            setUnreadCount(0)
            setNotifList(prev => prev.map(n => ({ ...n, isRead: true })))
        } catch (err) {
            console.error('Failed to mark all as read:', err)
        }
    }

    async function handleNotifClick(notif) {
        // Mark as read
        if (!notif.isRead) {
            try {
                await notifications.markAsRead(notif.id)
                setUnreadCount(prev => Math.max(0, prev - 1))
                setNotifList(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n))
            } catch (err) { /* ignore */ }
        }
        // Navigate to related page
        const route = typeRoutes[notif.type]
        if (route) {
            navigate(route)
            setIsOpen(false)
        }
    }

    const isRT = user?.role === 'RT'

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

                {/* Notification Bell */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={toggleDropdown}
                        className="relative p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined">notifications</span>
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 border-2 border-white dark:border-surface-dark">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Dropdown Panel */}
                    {isOpen && (
                        <div className="absolute right-0 top-12 w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* Header */}
                            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[20px]">notifications</span>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifikasi</h3>
                                    {unreadCount > 0 && (
                                        <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="text-xs font-medium text-primary hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                    >
                                        Tandai Semua Dibaca
                                    </button>
                                )}
                            </div>

                            {/* Notification List */}
                            <div className="max-h-[400px] overflow-y-auto">
                                {loading ? (
                                    <div className="py-12 text-center text-slate-400">
                                        <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                                        <p className="mt-2 text-sm">Memuat...</p>
                                    </div>
                                ) : notifList.length === 0 ? (
                                    <div className="py-12 text-center text-slate-400">
                                        <span className="material-symbols-outlined text-4xl mb-2 block">notifications_off</span>
                                        <p className="text-sm">Belum ada notifikasi</p>
                                    </div>
                                ) : (
                                    notifList.map((notif) => {
                                        const style = typeIcons[notif.type] || { icon: 'info', color: 'text-slate-600', bg: 'bg-slate-50' }
                                        return (
                                            <button
                                                key={notif.id}
                                                onClick={() => handleNotifClick(notif)}
                                                className={`w-full text-left px-5 py-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0 ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                            >
                                                <div className={`w-9 h-9 rounded-full ${style.bg} ${style.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                                    <span className="material-symbols-outlined text-[18px]">{style.icon}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm leading-snug ${!notif.isRead ? 'font-semibold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                                                        {notif.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 mt-1">
                                                        {timeAgo(notif.createdAt)}
                                                    </p>
                                                </div>
                                                {!notif.isRead && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                                )}
                                            </button>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header
