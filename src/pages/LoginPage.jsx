import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function LoginPage() {
    const navigate = useNavigate()
    const { login, user, loading: authLoading } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user && !authLoading) {
            navigate('/dashboard')
        }
    }, [user, authLoading, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await login(email, password)
            navigate('/dashboard')
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-[#f6f6f8] dark:bg-[#101622] font-display antialiased text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
            <div className="flex flex-1 min-h-screen overflow-hidden">
                {/* Left Side: Visual Anchor */}
                <div
                    className="hidden lg:flex w-1/2 relative flex-col justify-end p-12 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAAbC55C4ZBVifJO3Z5N7dj6TQZ4Jps4tx5waKZfiCIn7jbgSxsR242CrtQtr-GSeWcPnfhx8KNEUsk_tZ0isYldXdjeE4EedlaGzsCdwXCPqsIu7jX5OzAj2pthm_9VQbPB1nF7baDjQ4qCDOredg7LCyUt4hmPuqOh0YzKY7XnYnl0pXF3ebOg5NsKtbd1ACOO9UJuCsnZo2c0z6OPY4xp8E90XnukkOmp2EfVX3SjjCIt0TSGmLonlHPpn35P8qzxd84vtkzRS2h')",
                    }}
                >
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>

                    {/* Branding Content */}
                    <div className="relative z-10 max-w-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-lg bg-primary-blue flex items-center justify-center text-white">
                                <span className="material-symbols-outlined text-3xl">apartment</span>
                            </div>
                            <h2 className="text-white text-2xl font-bold tracking-wide">Gading New Town</h2>
                        </div>
                        <h1 className="text-white text-4xl font-bold leading-tight mb-4">
                            Smart Living for a Better Community.
                        </h1>
                        <p className="text-slate-200 text-lg leading-relaxed">
                            Experience a harmonious blend of nature and modern architecture. Sign in to manage your
                            residence and connect with your neighborhood.
                        </p>
                        <div className="mt-8 flex gap-4">
                            <div className="flex -space-x-3">
                                <img
                                    alt="Resident"
                                    className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiPax0FapOm73iaIuUGl7VWyVPQ1LfFrApGIVETy5-V7Es3Z8-IO_PamQKuXZkbx0Oq8y5keWfFsfiMMfUQLzjJ4i7EA5u_SU2pHGtN-S4JtzuJbj6Gz5u36EQEGSO8j8msfIHKeSpFfux-c99GSTyX-QOqmTqrKNuC353u60X1gScMBtfftZscKLtBaW6zgEuZe5fwzeI4Ot28vjKyPh7zud2gKmMBb1vWESYlMbYD2zvWxRkLxtt5mmGTOeyt9dVAfbReCk8CxgW"
                                />
                                <img
                                    alt="Resident"
                                    className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCU_UBbKhmjjRbqMbFa5ebHH2jwCgZYfY8egGLVir345DXK7dz-xba_zTbHSh1_G6xGHudhXd6LTCKCku7_8EH2URc767ukjTmvQnymJtmkrkbdaBCYoK4_JwN9snyyuH5jLLY1i-mN3jfRvUeu3_QCZ0ZMpYFZLxUHz6GbaYxq76g4DaU0gJHVVwcUG8hixG0QIJJPBsiQDfgdlHwfBOgYbom4WCWsszEzkvSlO2q_bs4XmGjx-4ts0MnHxlM-1HT6tAp98nBaMx0k"
                                />
                                <img
                                    alt="Resident"
                                    className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCt4GPGB9clSAQIalfpGmWCkWqVqQsNj_QiXOUe9bwUPC0QYw90wZu_WeNIAT7GNOWzL2Vp8ugfltbxtKh1-IhilKhRE-jwNyzxt6N16Ht5bbZhQPlt-E06tYqB4A1x9sjichAC4MIYAfnCMX2FHlskWufG4B7dvLMhcXHWqQZaPxfrOzV6yWEJ73vGNWhKIi5BSCW72k457hJTlXSG8-qaeeEjqJMALiowIz7hTZMkjKKK1bn25ZWEc7A5dQy0ZXpuxdVqLE3PklBv"
                                />
                                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-primary-blue flex items-center justify-center text-xs text-white font-medium">
                                    +2k
                                </div>
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

                {/* Right Side: Login Form */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-white dark:bg-slate-900 p-6 md:p-12 xl:p-24 overflow-y-auto">
                    <div className="w-full max-w-[480px] flex flex-col">
                        {/* Mobile Branding */}
                        <div className="lg:hidden flex items-center gap-2 mb-8">
                            <div className="w-10 h-10 rounded bg-primary-blue flex items-center justify-center text-white">
                                <span className="material-symbols-outlined">apartment</span>
                            </div>
                            <span className="text-slate-900 dark:text-white font-bold text-xl">Gading New Town</span>
                        </div>

                        {/* Header */}
                        <div className="mb-8">
                            <h2 className="text-slate-900 dark:text-white text-[32px] font-bold leading-tight mb-2">
                                Welcome Back
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-base">
                                Please sign in to access your resident dashboard.
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">error</span>
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                            {/* Email Input */}
                            <label className="flex flex-col gap-2">
                                <span className="text-slate-900 dark:text-white text-sm font-medium">Username or Email</span>
                                <div className="relative">
                                    <input
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary-blue focus:ring-1 focus:ring-primary-blue h-12 pl-4 pr-10 text-base placeholder:text-slate-400"
                                        placeholder="Enter your username or email"
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">
                                        person
                                    </span>
                                </div>
                            </label>

                            {/* Password Input */}
                            <label className="flex flex-col gap-2">
                                <span className="text-slate-900 dark:text-white text-sm font-medium">Password</span>
                                <div className="relative">
                                    <input
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary-blue focus:ring-1 focus:ring-primary-blue h-12 pl-4 pr-10 text-base placeholder:text-slate-400"
                                        placeholder="Enter your password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center"
                                        type="button"
                                    >
                                        <span className="material-symbols-outlined text-xl">visibility</span>
                                    </button>
                                </div>
                            </label>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between mt-1">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        className="w-4 h-4 rounded text-primary-blue border-slate-300 dark:border-slate-600 focus:ring-primary-blue focus:ring-offset-0 bg-transparent"
                                        type="checkbox"
                                    />
                                    <span className="text-slate-600 dark:text-slate-400 text-sm group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                                        Remember me
                                    </span>
                                </label>
                                <a className="text-primary-blue hover:text-blue-700 text-sm font-medium transition-colors" href="#">
                                    Forgot Password?
                                </a>
                            </div>

                            {/* Login Button */}
                            <button
                                className="mt-4 w-full bg-primary-blue hover:bg-blue-700 text-white font-semibold h-12 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>
                                ) : (
                                    <>
                                        <span>Login</span>
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Or continue with</span>
                            </div>
                        </div>

                        {/* Social Login */}
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 h-11 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-800">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 h-11 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-800">
                                <svg className="w-5 h-5 text-[#1877F2] fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Facebook</span>
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 text-center">
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Don&apos;t have an account?{' '}
                                <a className="text-primary-blue font-medium hover:underline" href="#">
                                    Contact Admin
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
