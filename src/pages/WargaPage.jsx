import { useState, useEffect } from 'react';
import WargaFormModal from '../components/WargaFormModal';
import { households, residents } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import ResidentWarga from '../components/ResidentWarga';
import { Toast, confirmDialog } from '../lib/sweetalert';
const avatarColors = ['blue', 'purple', 'amber', 'emerald', 'pink', 'red', 'teal', 'cyan'];

function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function getAvatarColor(index) {
    return avatarColors[index % avatarColors.length];
}

function WargaPage() {
    const { user } = useAuth();
    const [isWargaModalOpen, setIsWargaModalOpen] = useState(false);
    const [selectedWarga, setSelectedWarga] = useState(null);
    const [data, setData] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [block, setBlock] = useState('');
    const isWarga = user?.role === 'WARGA';

    useEffect(() => {
        loadData();
    }, [meta.page, search, block]);

    async function loadData() {
        setLoading(true);
        try {
            if (isWarga) {
                // Fetch only the Warga's household members
                const res = await residents.list();
                setData(res.data || []);
            } else {
                const params = { page: meta.page, limit: 10 };
                if (search) params.search = search;
                if (block) params.block = block;
                const res = await households.list(params);
                setData(res.data || []);
                setMeta(res.meta || meta);
            }
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleOpenModal = (warga = null) => {
        setSelectedWarga(warga);
        setIsWargaModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsWargaModalOpen(false);
        setSelectedWarga(null);
        loadData(); // Refresh after modal closes
    };

    const handleSaveHousehold = async (formData) => {
        try {
            if (isWarga) {
                // WARGA uses the residents API directly to manage their household members
                let householdId = data.length > 0 ? data[0].householdId : null;

                if (!householdId && !formData.id) {
                    // Note: If the Warga has no household, they shouldn't realistically reach here
                    // without RT first making one, but fallback just in case
                    console.error("Household ID not found.");
                    return;
                }

                const payload = {
                    nik: formData.nik,
                    name: formData.name,
                    phone: formData.phone || undefined,
                    familyRole: formData.role === 'Kepala Keluarga' ? 'KEPALA_KELUARGA' :
                        formData.role === 'Istri' ? 'ISTRI' :
                            formData.role === 'Anak' ? 'ANAK' : 'LAINNYA',
                    status: formData.status === 'Active' ? 'ACTIVE' : 'INACTIVE',
                    householdId: householdId || formData.householdId
                };

                if (formData.id) {
                    await residents.update(formData.id, payload);
                    Toast.fire({
                        icon: 'success',
                        title: 'Data anggota keluarga berhasil diperbarui!'
                    });
                } else {
                    await residents.create(payload);
                    Toast.fire({
                        icon: 'success',
                        title: 'Anggota keluarga baru berhasil ditambahkan!'
                    });
                }
            } else {
                // RT handles full household creation/updates via households API
                if (formData.id) {
                    await households.update(formData.id, {
                        kkNumber: formData.kkNumber,
                        block: formData.block,
                        houseNumber: formData.houseNumber,
                    });
                } else {
                    const hh = await households.create({
                        kkNumber: formData.kkNumber,
                        address: `Blok ${formData.block} No. ${formData.houseNumber}`,
                        block: formData.block,
                        houseNumber: formData.houseNumber,
                        ownershipType: 'OWNER'
                    });

                    const res = await residents.create({
                        nik: formData.nik,
                        name: formData.name,
                        phone: formData.phone,
                        familyRole: 'KEPALA_KELUARGA',
                        status: 'ACTIVE',
                        householdId: hh.id
                    });

                    await households.update(hh.id, {
                        headOfFamilyId: res.id
                    });
                }
            }
            handleCloseModal();
        } catch (err) {
            console.error('Failed to save data:', err);
            Toast.fire({
                icon: 'error',
                title: 'Gagal menyimpan data!',
                text: err.response?.data?.message || 'Terjadi kesalahan pada server'
            });
        }
    };

    const handleDeleteWarga = async (member) => {
        const result = await confirmDialog(
            'Hapus Anggota Keluarga?',
            `Yakin ingin menghapus ${member.name} dari anggota keluarga?`
        );

        if (!result.isConfirmed) return;

        try {
            await residents.delete(member.id);
            Toast.fire({
                icon: 'success',
                title: 'Anggota keluarga berhasil dihapus!'
            });
            loadData();
        } catch (err) {
            console.error('Failed to delete member:', err);
            Toast.fire({
                icon: 'error',
                title: 'Gagal menghapus data!',
                text: err.response?.data?.message || 'Terjadi kesalahan pada server'
            });
        }
    };

    if (isWarga) {
        return (
            <>
                <ResidentWarga
                    user={user}
                    data={data}
                    loading={loading}
                    meta={meta}
                    onAddMember={() => handleOpenModal()}
                    onEditMember={(member) => handleOpenModal({
                        ...member,
                        role: member.familyRole === 'KEPALA_KELUARGA' ? 'Kepala Keluarga' :
                            member.familyRole === 'ISTRI' ? 'Istri' :
                                member.familyRole === 'ANAK' ? 'Anak' : 'Lainnya',
                        status: member.status === 'ACTIVE' ? 'Active' : 'Inactive',
                    })}
                    onDeleteMember={handleDeleteWarga}
                    onPrintKK={() => alert('Fitur cetak KK sedang dalam pengembangan.')}
                />

                <WargaFormModal
                    isOpen={isWargaModalOpen}
                    onClose={handleCloseModal}
                    initialData={selectedWarga}
                    onSave={handleSaveHousehold}
                />
            </>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Data Kependudukan</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage household heads and resident information for RT 05.</p>
                </div>
                {user?.role !== 'WARGA' && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="px-4 py-2.5 bg-warga-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-warga-primary/25 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span>Tambah Warga</span>
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900">
                    <div className="relative w-full sm:w-80">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </span>
                        <input
                            className="pl-10 pr-4 py-2.5 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-warga-primary focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400"
                            placeholder="Search by name or KK number..."
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setMeta(m => ({ ...m, page: 1 }));
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-48">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <span className="material-symbols-outlined text-[20px]">location_on</span>
                            </span>
                            <select
                                className="pl-10 pr-8 py-2.5 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-warga-primary focus:border-transparent text-slate-900 dark:text-white appearance-none cursor-pointer"
                                value={block}
                                onChange={(e) => {
                                    setBlock(e.target.value);
                                    setMeta(m => ({ ...m, page: 1 }));
                                }}
                            >
                                <option value="">All Blocks</option>
                                <option value="A">Block A</option>
                                <option value="B">Block B</option>
                                <option value="C">Block C</option>
                                <option value="D">Block D</option>
                            </select>
                            <span className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-slate-400">
                                <span className="material-symbols-outlined text-[20px]">expand_more</span>
                            </span>
                        </div>
                        <button className="p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex-shrink-0" title="Filter Options">
                            <span className="material-symbols-outlined text-[20px]">filter_list</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-16">No</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">KK Number</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Kepala Keluarga</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Block / No</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">Members</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-slate-400">
                                        <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                                        <p className="mt-2 text-sm">Loading data...</p>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-slate-400">
                                        <span className="material-symbols-outlined text-4xl">search_off</span>
                                        <p className="mt-2 text-sm">No households found</p>
                                    </td>
                                </tr>
                            ) : data.map((household, idx) => {
                                const headName = household.headOfFamily?.name || 'N/A';
                                const color = getAvatarColor(idx);
                                const ownerType = household.ownershipType === 'OWNER' ? 'Owner' : 'Tenant';
                                const isActive = household.headOfFamily?.status !== 'INACTIVE';
                                const rowNum = (meta.page - 1) * meta.limit + idx + 1;
                                return (
                                    <tr key={household.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="py-4 px-6 text-sm text-slate-500">{rowNum}</td>
                                        <td className="py-4 px-6 text-sm font-medium text-slate-900 dark:text-white">{household.kkNumber}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full bg-${color}-100 text-${color}-600 flex items-center justify-center text-xs font-bold`}>
                                                    {getInitials(headName)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{headName}</div>
                                                    <div className="text-xs text-slate-500">{ownerType}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300">Block {household.block} - {household.houseNumber}</td>
                                        <td className="py-4 px-6 text-sm text-center">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium">
                                                {household._count?.residents || 0}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            {isActive ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            {user?.role !== 'WARGA' && (
                                                <button
                                                    onClick={() => handleOpenModal(household)}
                                                    className="text-slate-400 hover:text-warga-primary transition-colors p-1"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        Showing <span className="font-medium text-slate-900 dark:text-white">{data.length > 0 ? (meta.page - 1) * meta.limit + 1 : 0}</span> to{' '}
                        <span className="font-medium text-slate-900 dark:text-white">{Math.min(meta.page * meta.limit, meta.total)}</span> of{' '}
                        <span className="font-medium text-slate-900 dark:text-white">{meta.total}</span> results
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={meta.page <= 1}
                            onClick={() => setMeta(m => ({ ...m, page: m.page - 1 }))}
                        >
                            Previous
                        </button>
                        <button
                            className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={meta.page >= meta.totalPages}
                            onClick={() => setMeta(m => ({ ...m, page: m.page + 1 }))}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <WargaFormModal
                isOpen={isWargaModalOpen}
                onClose={handleCloseModal}
                initialData={selectedWarga}
                onSave={handleSaveHousehold}
            />
        </div>
    )
}

export default WargaPage
