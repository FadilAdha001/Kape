// pages/DashboardAdmin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useApp } from '../components/AppContext';
import {
  FiUsers,
  FiUser,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertTriangle
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const DashboardAdmin = () => {
  const { user } = useApp();

  // Daftar peran yang diizinkan mengakses dashboard
  const allowedRoles = ['admin', 'guru', 'kepsek', 'wali'];

  const [stats, setStats] = useState({
    totalKaryawan: 0,
    totalSiswa: 0,
    totalPemasukan: 0,
    totalPengeluaran: 0
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const monthNames = {
    '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
    '05': 'Mei', '06': 'Jun', '07': 'Jul', '08': 'Agu',
    '09': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Des'
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Ambil data statistik
        const [
          { data: karyawanData },
          { data: siswaData },
          { data: pemasukanTotalData },
          { data: pengeluaranTotalData }
        ] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BACKEND}/api/karyawan/count`),
          axios.get(`${process.env.REACT_APP_BACKEND}/api/siswa/count`),
          axios.get(`${process.env.REACT_APP_BACKEND}/api/pemasukan/total`),
          axios.get(`${process.env.REACT_APP_BACKEND}/api/pengeluaran/total`)
        ]);

        setStats({
          totalKaryawan: karyawanData.total,
          totalSiswa: siswaData.total,
          totalPemasukan: pemasukanTotalData.total,
          totalPengeluaran: pengeluaranTotalData.total
        });

        // Ambil data untuk chart
        const [resPemasukanList, resPengeluaranList] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BACKEND}/api/pemasukan`),
          axios.get(`${process.env.REACT_APP_BACKEND}/api/pengeluaran`)
        ]);

        const pemasukanList = resPemasukanList.data?.data || [];
        const pengeluaranList = resPengeluaranList.data?.data || [];

        // Generate 6 bulan terakhir
        const now = new Date();
        const lastSixMonths = [];
        for (let i = 5; i >= 0; i--) {
          const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const yyyy = dt.getFullYear();
          const mm = String(dt.getMonth() + 1).padStart(2, '0');
          lastSixMonths.push(`${yyyy}-${mm}`);
        }

        // Proses data untuk chart
        const combined = lastSixMonths.map((ym) => {
          const monthLabel = monthNames[ym.slice(5)];

          // PERBAIKAN 1: Hapus fallback createdAt
          // Untuk pemasukan:
          const pemasukanBulan = pemasukanList
            .filter(item => item.tgl_bayar?.slice(0, 7) === ym)
            .reduce((sum, item) => {
              // parseFloat akan mengubah string "250000.00" menjadi angka 250000
              const nilaiBayar = parseFloat(item.jumlah_bayar) || 0;
              return sum + nilaiBayar;
            }, 0);

          // Untuk pengeluaran:
          const pengeluaranBulan = pengeluaranList
            .filter(item => item.tgl_pengeluaran?.slice(0, 7) === ym)
            .reduce((sum, item) => {
              const nilaiKeluar = parseFloat(item.jumlah) || 0;
              return sum + nilaiKeluar;
            }, 0);
          return {
            month: monthLabel,
            pemasukan: pemasukanBulan,
            pengeluaran: pengeluaranBulan
          };
        });

        setChartData(combined);

        // Debugging
        console.log('Processed Chart Data:', combined);

      } catch (err) {
        console.error('Error:', err);
        setError(err.response?.data?.message || 'Gagal memuat data dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (allowedRoles.includes(user?.role)) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const StatCard = ({ icon, title, value, color, isCurrency }) => (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className={`bg-${color}-subtle p-3 rounded me-3`}>
            {React.cloneElement(icon, { className: `fs-3 text-${color}` })}
          </div>
          <div>
            <h6 className="text-muted mb-1">{title}</h6>
            <h4 className="mb-0">
              {isCurrency
                ? new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR'
                }).format(value)
                : value}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );


  // Cek akses berdasarkan peran
  if (!allowedRoles.includes(user?.role)) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger d-flex align-items-center">
          <FiAlertTriangle className="me-2" />
          Akses ditolak. Hanya admin, guru, kepala sekolah, dan wali siswa yang diizinkan.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <h2 className="my-4 text-capitalize">Dashboard {user.role.replace('_', ' ')}</h2>

      {error && (
        <div className="alert alert-danger d-flex align-items-center">
          <FiAlertTriangle className="me-2" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            {['admin', 'kepsek'].includes(user.role) && (
              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  icon={<FiUsers />}
                  title="Total Karyawan"
                  value={stats.totalKaryawan}
                  color="primary"
                />
              </div>
            )}

            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                icon={<FiUser />}
                title="Total Siswa"
                value={stats.totalSiswa}
                color="success"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                icon={<FiTrendingUp />}
                title="Total Pemasukan"
                value={stats.totalPemasukan}
                color="success"
                isCurrency
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                icon={<FiTrendingDown />}
                title="Total Pengeluaran"
                value={stats.totalPengeluaran}
                color="danger"
                isCurrency
              />
            </div>
          </div>

          {chartData.every(item => item.pemasukan === 0 && item.pengeluaran === 0) ? (
            <div className="alert alert-info">
              Tidak ada data transaksi untuk 6 bulan terakhir.
            </div>
          ) : (
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-4">Statistik Keuangan 6 Bulan Terakhir</h5>
                <div style={{ height: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis
                        tickFormatter={value =>
                          new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            maximumFractionDigits: 0
                          }).format(value)
                        }
                      />
                      <Tooltip
                        formatter={value => [
                          new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR'
                          }).format(value), null
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="pemasukan" name="Pemasukan" fill="#28a745" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#dc3545" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardAdmin;