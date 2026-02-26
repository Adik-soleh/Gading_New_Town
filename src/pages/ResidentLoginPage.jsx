import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ResidentLoginPage() {
    const [nik, setNik] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { loginNik } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!nik || nik.length < 16) {
            setError('Masukkan minimal 16 digit NIK yang tertera pada KTP Anda.');
            return;
        }

        try {
            setIsLoading(true);
            await loginNik(nik);
            // Refresh window or navigate to dashboard to ensure state updates everywhere
            navigate('/dashboard');
            window.location.reload();
        } catch (err) {
            setError(err.message || 'Gagal login. Periksa kembali NIK Anda.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#f6f6f8] dark:bg-[#101622] font-sans antialiased text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
            <div className="flex flex-1 min-h-screen overflow-hidden">
                <div className="hidden lg:flex w-1/2 relative flex-col justify-end p-12 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAAbC55C4ZBVifJO3Z5N7dj6TQZ4Jps4tx5waKZfiCIn7jbgSxsR242CrtQtr-GSeWcPnfhx8KNEUsk_tZ0isYldXdjeE4EedlaGzsCdwXCPqsIu7jX5OzAj2pthm_9VQbPB1nF7baDjQ4qCDOredg7LCyUt4hmPuqOh0YzKY7XnYnl0pXF3ebOg5NsKtbd1ACOO9UJuCsnZo2c0z6OPY4xp8E90XnukkOmp2EfVX3SjjCIt0TSGmLonlHPpn35P8qzxd84vtkzRS2h')" }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
                    <div className="relative z-10 max-w-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                                <span className="material-symbols-outlined text-3xl">apartment</span>
                            </div>
                            <h2 className="text-white text-2xl font-bold tracking-wide">Gading New Town</h2>
                        </div>
                        <h1 className="text-white text-4xl font-bold leading-tight mb-4">Smart Living for a Better Community.</h1>
                        <p className="text-slate-200 text-lg leading-relaxed">Experience a harmonious blend of nature and modern architecture. Sign in to manage your residence and connect with your neighborhood.</p>
                        <div className="mt-8 flex gap-4">
                            <div className="flex -space-x-3">
                                <img alt="Resident profile avatar" className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiPax0FapOm73iaIuUGl7VWyVPQ1LfFrApGIVETy5-V7Es3Z8-IO_PamQKuXZkbx0Oq8y5keWfFsfiMMfUQLzjJ4i7EA5u_SU2pHGtN-S4JtzuJbj6Gz5u36EQEGSO8j8msfIHKeSpFfux-c99GSTyX-QOqmTqrKNuC353u60X1gScMBtfftZscKLtBaW6zgEuZe5fwzeI4Ot28vjKyPh7zud2gKmMBb1vWESYlMbYD2zvWxRkLxtt5mmGTOeyt9dVAfbReCk8CxgW" />
                                <img alt="Resident profile avatar" className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCU_UBbKhmjjRbqMbFa5ebHH2jwCgZYfY8egGLVir345DXK7dz-xba_zTbHSh1_G6xGHudhXd6LTCKCku7_8EH2URc767ukjTmvQnymJtmkrkbdaBCYoK4_JwN9snyyuH5jLLY1i-mN3jfRvUeu3_QCZ0ZMpYFZLxUHz6GbaYxq76g4DaU0gJHVVwcUG8hixG0QIJJPBsiQDfgdlHwfBOgYbom4WCWsszEzkvSlO2q_bs4XmGjx-4ts0MnHxlM-1HT6tAp98nBaMx0k" />
                                <img alt="Resident profile avatar" className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCt4GPGB9clSAQIalfpGmWCkWqVqQsNj_QiXOUe9bwUPC0QYw90wZu_WeNIAT7GNOWzL2Vp8ugfltbxtKh1-IhilKhRE-jwNyzxt6N16Ht5bbZhQPlt-E06tYqB4A1x9sjichAC4MIYAfnCMX2FHlskWufG4B7dvLMhcXHWqQZaPxfrOzV6yWEJ73vGNWhKIi5BSCW72k457hJTlXSG8-qaeeEjqJMALiowIz7hTZMkjKKK1bn25ZWEc7A5dQy0ZXpuxdVqLE3PklBv" />
                                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-blue-600 flex items-center justify-center text-xs text-white font-medium">+2k</div>
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-white text-sm font-medium">Joined Residents</span>
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-yellow-400 text-sm">star</span>
                                    <span className="text-slate-300 text-xs">4.9/5 Community Rating</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-white dark:bg-slate-900 p-6 md:p-12 xl:p-24 overflow-y-auto">
                    <div className="w-full max-w-[440px] flex flex-col">
                        <div className="lg:hidden flex items-center gap-2 mb-8">
                            <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center text-white">
                                <span className="material-symbols-outlined">apartment</span>
                            </div>
                            <span className="text-slate-900 dark:text-white font-bold text-xl">Gading New Town</span>
                        </div>
                        <div className="mb-10 text-center lg:text-left">
                            <h2 className="text-slate-900 dark:text-white text-[32px] font-bold leading-tight mb-2">Masuk sebagai Warga</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-base">Silakan masukkan NIK Anda untuk mengakses dashboard.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                            <label className="flex flex-col gap-2">
                                <span className="text-slate-900 dark:text-white text-sm font-semibold">Nomor Induk Kependudukan (NIK)</span>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={nik}
                                        onChange={(e) => setNik(e.target.value)}
                                        className="form-input w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 h-14 pl-12 pr-4 text-lg tracking-wider placeholder:tracking-normal placeholder:text-slate-400"
                                        maxLength="17"
                                        placeholder="Contoh: 3201xxxxxxxxxxxx"
                                        required
                                        disabled={isLoading}
                                    />
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-2xl pointer-events-none">
                                        id_card
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Gunakan 16 digit NIK yang tertera pada KTP Anda.</p>
                            </label>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold h-14 rounded-lg shadow-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 text-lg"
                            >
                                <span>{isLoading ? 'Memproses...' : 'Login'}</span>
                                <span className="material-symbols-outlined text-xl">login</span>
                            </button>
                        </form>
                        <div className="mt-12 text-center">
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Data NIK tidak terdaftar?
                                <a
                                    className="text-blue-600 ml-1 font-semibold hover:underline"
                                    href="https://wa.me/62895360103563?text=Halo%20Admin%20RT/RW%2C%20saya%20ingin%20melakukan%20konfirmasi%20karena%20data%20NIK%20saya%20belum%20terdaftar.%20Mohon%20bantuannya.%20Terima%20kasih."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Hubungi Admin RT/RW
                                </a>
                            </p>
                        </div>
                        {/* <div className="mt-6 text-center">
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Admin / Ketua RT?
                                <button onClick={() => navigate('/admin')} className="text-blue-600 ml-1 font-semibold hover:underline">
                                    Login di sini
                                </button>
                            </p>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
}
