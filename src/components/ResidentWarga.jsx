import React from 'react';

function getInitials(name) {
    return name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??';
}

function ResidentWarga({ user, data, loading, meta, onAddMember, onEditMember, onDeleteMember, onPrintKK }) {
    // `data` from Warga fetching `residents.list()` is an array of Residents.
    const residents = Array.isArray(data) ? data : [];
    const firstResident = residents.length > 0 ? residents[0] : null;
    const householdInfo = firstResident?.household;

    const headOfFamily = residents.find(r => r.familyRole === 'KEPALA_KELUARGA');
    const headName = headOfFamily?.name || user?.name || 'Loading...';
    const kkNumber = householdInfo?.kkNumber || 'Loading...';
    const blockAddress = householdInfo ? `Blok ${householdInfo.block} No. ${householdInfo.houseNumber}` : 'Loading...';
    const membersCount = residents.length;

    return (
        <div className="max-w-6xl mx-auto w-full font-display text-slate-900 dark:text-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-lg text-primary">
                        <span className="material-symbols-outlined">badge</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No. Kartu Keluarga</p>
                        <p className="font-bold text-slate-900 dark:text-white">{loading ? '...' : kkNumber}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                    <div className="bg-green-50 dark:bg-green-900/20 p-2.5 rounded-lg text-green-600">
                        <span className="material-symbols-outlined">home</span>
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lokasi Properti</p>
                        <p className="font-bold text-slate-900 dark:text-white truncate">{loading ? '...' : blockAddress}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-2.5 rounded-lg text-amber-600">
                        <span className="material-symbols-outlined">group</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Anggota</p>
                        <p className="font-bold text-slate-900 dark:text-white">{loading ? '...' : `${membersCount} Orang`}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Daftar Anggota Keluarga</h2>
                        <p className="text-xs text-slate-500">Kelola data penghuni tetap di unit properti Anda.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onPrintKK}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">download</span>
                            Cetak KK
                        </button>
                        <button
                            onClick={onAddMember}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-md shadow-primary/20 hover:bg-blue-600 transition-all active:scale-95"
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                            Tambah Anggota
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Hubungan</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">NIK / No HP</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-slate-400">
                                        <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                                        <p className="mt-2 text-sm">Loading data...</p>
                                    </td>
                                </tr>
                            ) : residents.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-slate-400">
                                        <span className="material-symbols-outlined text-4xl">group_off</span>
                                        <p className="mt-2 text-sm">Belum ada detail anggota keluarga (atau API belum expand data residents).</p>
                                    </td>
                                </tr>
                            ) : (
                                residents.map((member) => (
                                    <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                                    {getInitials(member.name)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{member.name}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase">{member.gender === 'MALE' ? 'Laki-Laki' : member.gender === 'FEMALE' ? 'Perempuan' : '-'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {member.familyRole === 'KEPALA_KELUARGA' ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-primary text-[10px] font-bold uppercase">Kepala Keluarga</span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase">{member.familyRole || 'Anggota'}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{member.nik || '-'}</div>
                                            <div className="text-[10px] text-slate-500">{member.phone || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {member.status === 'ACTIVE' ? (
                                                <span className="text-sm text-green-600 font-medium">Aktif</span>
                                            ) : (
                                                <span className="text-sm text-slate-500 font-medium">{member.status}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => onEditMember && onEditMember(member)}
                                                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                                                    title="Edit"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                {member.familyRole !== 'KEPALA_KELUARGA' && (
                                                    <button
                                                        onClick={() => onDeleteMember && onDeleteMember(member)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400 text-lg">info</span>
                    <p className="text-xs text-slate-500">
                        Pastikan data NIK sesuai dengan dokumen fisik. Untuk perubahan alamat utama, silakan hubungi <a href="#" className="text-primary font-bold hover:underline">Customer Service GNT</a>.
                    </p>
                </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg text-primary shadow-sm">
                        <span className="material-symbols-outlined">help_center</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Butuh bantuan pembaharuan data?</h4>
                        <p className="text-xs text-slate-500">Pelajari panduan pengisian formulir digital keluarga di sini.</p>
                    </div>
                </div>
                <button className="text-primary font-bold text-sm hover:underline">Lihat Panduan</button>
            </div>
        </div>
    );
}

export default ResidentWarga;
