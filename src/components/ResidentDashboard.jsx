import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { residents } from '../lib/api';

export default function ResidentDashboard({ user, stats, recentActivity = [] }) {
    const userName = user?.name || 'Ahmad Fauzi';
    const address = user?.address || 'Blok A3 No. 12';

    const [familyMembers, setFamilyMembers] = useState([]);
    const [loadingFamily, setLoadingFamily] = useState(true);

    useEffect(() => {
        async function fetchFamily() {
            try {
                // The backend API already filters this by user's household when role = WARGA
                const res = await residents.list({ limit: 5 });
                setFamilyMembers(res.data || []);
            } catch (err) {
                console.error("Failed to fetch family members:", err);
            } finally {
                setLoadingFamily(false);
            }
        }
        fetchFamily();
    }, []);

    const activityIcons = {
        Finance: { icon: 'check_circle', color: 'green' },
        Permits: { icon: 'home_repair_service', color: 'blue' },
        'Data Entry': { icon: 'person_add', color: 'purple' },
        Security: { icon: 'warning', color: 'amber' },
        System: { icon: 'settings', color: 'slate' },
    };

    function getTimeAgo(dateStr) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    return (
        <div className="flex-1 w-full max-w-7xl mx-auto font-display text-text-main">
            {/* Welcome Banner */}
            <div className="mb-8 flex flex-col gap-2">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Selamat Datang, {userName}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-base font-normal">
                    {address} - Gading New Town
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Stat Card 1 */}
                <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Status IPL Bulan Ini</p>
                            <h3 className={`text-2xl font-bold ${stats?.unpaidIPL > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                                {stats?.unpaidIPL === 0 ? 'Lunas' : `${stats?.unpaidIPL} Bulan Belum Lunas`}
                            </h3>
                        </div>
                        <div className={`rounded-full ${stats?.unpaidIPL > 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-green-100 dark:bg-green-900/30 text-green-600'} p-2`}>
                            <span className="material-symbols-outlined">
                                {stats?.unpaidIPL === 0 ? 'check_circle' : 'warning'}
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <span className={`text-xs font-medium ${stats?.unpaidIPL > 0 ? 'text-red-600 bg-red-50 dark:bg-red-900/30' : 'text-green-600 bg-green-50 dark:bg-green-900/30'} px-2 py-1 rounded-full`}>
                            {stats?.unpaidIPL === 0 ? 'Terbayar' : 'Belum Lunas'}
                        </span>
                        {stats?.unpaidIPL === 0 && <span className="text-xs text-slate-500 dark:text-slate-400">Terima Kasih!</span>}
                    </div>
                </div>

                {/* Stat Card 2 */}
                <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Izin Renovasi</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.pendingPermits || 0} Pending</h3>
                        </div>
                        <div className={`rounded-full ${stats?.pendingPermits > 0 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'bg-green-100 dark:bg-green-900/30 text-green-600'} p-2`}>
                            <span className="material-symbols-outlined">
                                {stats?.pendingPermits > 0 ? 'pending_actions' : 'check_circle'}
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        {stats?.pendingPermits > 0 ? (
                            <>
                                <span className="text-xs font-medium text-orange-600 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                                    Menunggu RT
                                </span>
                                <Link to="/izin" className="text-xs text-primary hover:underline font-medium">Lihat Detail</Link>
                            </>
                        ) : (
                            <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                Tidak ada Izin Pending
                            </span>
                        )}
                    </div>
                </div>

                {/* Stat Card 3 */}
                <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Laporan Aktif</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.activeReports || 0}</h3>
                        </div>
                        <div className="rounded-full bg-primary/10 p-2 text-primary">
                            <span className="material-symbols-outlined">{stats?.activeReports > 0 ? 'report_problem' : 'check_circle'}</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Link to="/lapor" className="text-xs font-medium text-primary hover:underline">{stats?.activeReports > 0 ? 'Pantau Laporan Anda' : 'Buat Laporan Baru'}</Link>
                    </div>
                </div>
            </div>

            {/* Main Layout: Left Column (Content) & Right Column (Sidebar widgets) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Span 2) */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {/* Quick Actions */}
                    <section>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">bolt</span>
                            Aksi Cepat
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link to="/ipl" className="flex items-center gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group text-left">
                                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined">account_balance_wallet</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Bayar IPL</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Pembayaran bulanan</p>
                                </div>
                            </Link>
                            <Link to="/izin" className="flex items-center gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group text-left">
                                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined">edit_document</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Ajukan Izin</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Renovasi, acara, dll</p>
                                </div>
                            </Link>
                        </div>
                    </section>

                    {/* Timeline / Announcements */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">feed</span>
                                Aktivitas Terkini Anda
                            </h3>
                            <button className="text-sm font-medium text-primary hover:text-blue-700 dark:hover:text-blue-400">Lihat Semua</button>
                        </div>
                        <div className="flex flex-col gap-4">
                            {recentActivity.length > 0 ? recentActivity.slice(0, 3).map((item) => {
                                const iconConfig = activityIcons[item.category] || activityIcons.System;
                                return (
                                    <div key={item.id} className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <div className="flex flex-col items-center">
                                            <div className={`h-10 w-10 rounded-full bg-${iconConfig.color}-100 dark:bg-${iconConfig.color}-900 flex items-center justify-center text-${iconConfig.color}-600 dark:text-${iconConfig.color}-400 shrink-0`}>
                                                <span className="material-symbols-outlined">{iconConfig.icon}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 pb-2">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-semibold text-slate-900 dark:text-white text-base leading-tight break-words">{item.action}</h4>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap ml-2">{getTimeAgo(item.createdAt)}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                {item.category} Update
                                            </p>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">history</span>
                                    <p className="text-slate-500 dark:text-slate-400">Belum ada aktivitas yang tercatat.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column (Span 1) */}
                <div className="flex flex-col gap-8">
                    {/* Family Card */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900 dark:text-white">Data Keluarga</h3>
                            <Link to="/warga" className="text-sm font-medium text-primary hover:text-blue-700 dark:hover:text-blue-400">Lihat</Link>
                        </div>
                        <div className="p-2">
                            {loadingFamily ? (
                                <div className="p-4 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2">
                                    <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                                    <span className="text-sm">Memuat Data...</span>
                                </div>
                            ) : familyMembers.length > 0 ? (
                                familyMembers.map((member) => (
                                    <div key={member.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer">
                                        <div className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold shrink-0">
                                            {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{member.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {member.familyRole === 'KEPALA_KELUARGA' ? 'Kepala Keluarga' : member.familyRole === 'ISTRI' ? 'Istri' : 'Anak'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                                    Belum ada data anggota keluarga.
                                </div>
                            )}
                            {(!loadingFamily && familyMembers.length > 0) && (
                                <Link to="/warga" className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                        <span className="material-symbols-outlined">add</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Lihat Semua Anggota</p>
                                    </div>
                                </Link>
                            )}
                        </div>
                    </section>

                    {/* Important Contacts / Quick Info Widget */}
                    <section className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-primary/20 overflow-hidden p-5">
                        <h3 className="font-bold text-primary mb-3">Kontak Darurat</h3>
                        <ul className="flex flex-col gap-3">
                            <li className="flex items-center gap-3 text-slate-900 dark:text-white">
                                <div className="h-8 w-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-primary shadow-sm">
                                    <span className="material-symbols-outlined text-sm">local_police</span>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold">Keamanan (Pos Satpam)</p>
                                    <p className="text-sm font-bold">0812-3456-7890</p>
                                </div>
                            </li>
                            <li className="flex items-center gap-3 text-slate-900 dark:text-white">
                                <div className="h-8 w-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-primary shadow-sm">
                                    <span className="material-symbols-outlined text-sm">medical_services</span>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold">Klinik Gading</p>
                                    <p className="text-sm font-bold">021-555-0199</p>
                                </div>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
