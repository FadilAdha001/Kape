import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { AppProvider } from './components/AppContext';
import FormLogin from './pages/FormLogin'
import FormRegister from './pages/FormRegister';
import KelolaTagihanPage from './pages/KelolaTagihanPage';
import MasterBiayaPage from './pages/MasterBiayaPage';
import PemasukanPage from './pages/PemasukanPage';
import PengeluaranPage from './pages/PengeluaranPage';
import KelolaKaryawanPage from './pages/KelolaKaryawanPage';
import KelolaOrangTuaPage from './pages/KelolaOrangTuaPage';
import KelolaKelasPage from './pages/KelolaKelasPage';
import KelolaSiswaPage from './pages/KelolaSiswaPage';
import ListTagihan from './pages/ListTagihan';
import DashboardAdmin from './pages/DashboardAdmin';
import DataGaji from './pages/DataGaji';
import ListUser from './pages/ListUser';
import LaporanPage from './pages/LaporanPage';
import DashboardOrtu from './pages/DashboardOrtu';
import KelolaGajiPage from './pages/KelolaGajiPage';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<FormLogin />} />
          <Route path="/register" element={<FormRegister />} />
          <Route path="/" element={<Layout />}>
            <Route path="/dashboard-admin" element={<DashboardAdmin />} />
            <Route path="/dashboard" element={<DashboardOrtu />} />
            <Route path="/kelola-tagihan" element={<KelolaTagihanPage />} />
            <Route path="/kelola-biaya" element={<MasterBiayaPage />} />
            <Route path="/kelola-pemasukan" element={<PemasukanPage />} />
            <Route path="/kelola-pengeluaran" element={<PengeluaranPage />} />
            <Route path="/kelola-laporan" element={<LaporanPage />} />
            <Route path="/kelola-karyawan" element={<KelolaKaryawanPage />} />
            <Route path="/kelola-akun" element={<ListUser />} />
            <Route path="/kelola-orangtua" element={<KelolaOrangTuaPage />} />
            <Route path="/kelola-siswa" element={<KelolaSiswaPage />} />
            <Route path="/kelola-kelas" element={<KelolaKelasPage />} />

            <Route path="/gaji" element={<KelolaGajiPage />} />
            {/* Orang tua */}
            <Route path="/list-tagihan" element={<ListTagihan />} />


          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
