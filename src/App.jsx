import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import ResidentLoginPage from './pages/ResidentLoginPage'
import DashboardPage from './pages/DashboardPage'
import WargaPage from './pages/WargaPage'
import MutasiPage from './pages/MutasiPage'
import IPLPage from './pages/IPLPage'
import IzinPage from './pages/IzinPage'
import LaporPage from './pages/LaporPage'
import LogPage from './pages/LogPage'

function App() {
    return (
        <AuthProvider>
            <Toaster position="top-right" />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<ResidentLoginPage />} />
                    <Route path="/admin" element={<LoginPage />} />
                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/warga" element={<WargaPage />} />
                            <Route path="/mutasi" element={<MutasiPage />} />
                            <Route path="/ipl" element={<IPLPage />} />
                            <Route path="/izin" element={<IzinPage />} />
                            <Route path="/lapor" element={<LaporPage />} />
                            <Route path="/log" element={<LogPage />} />
                        </Route>
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
