import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMoneyBillWave, FaClock, FaCalendarTimes, FaCoins } from 'react-icons/fa';
import { useApp } from '../components/AppContext';
import { useNavigate } from 'react-router-dom';

const DashboardOrtu = () => {
    const [tagihanData, setTagihanData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState('');
    const [siswaId, setSiswaId] = useState(null);
    const { user, isLoading } = useApp();
    const navigate = useNavigate();
    useEffect(() => {
        if(!user){
            navigate('/')
            setInterval(300)
            window.location.reload()
        }
        if(!['orang_tua', 'siswa'].includes(user.role) ){
            navigate('/dashboard-admin')
        }

    }, []);


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Ambil data user dari auth (sesuaikan dengan sistem auth Anda)

                setUserRole(user);

                if (user.role === 'siswa') {
                    setSiswaId(user.siswa_id);
                } else if (user.role === 'orang_tua') {
                    // Ambil data siswa berdasarkan ortu_id
                    const resSiswa = await axios.get(`${process.env.REACT_APP_BACKEND}/api/siswa?ortu_id=${user.ortu_id}`);
                    if (resSiswa.data.data.length > 0) {
                        setSiswaId(resSiswa.data.data[0].siswa_id);
                    }
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Gagal memuat data pengguna');
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchTagihan = async () => {
            if (!siswaId) return;

            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND}/api/tagihan?siswa_id=${siswaId}`
                );

                setTagihanData(response.data.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Gagal memuat data tagihan');
                setLoading(false);
            }
        };

        fetchTagihan();
    }, [siswaId]);

    // Hitung statistik
    const totalTagihan = tagihanData.length;
    const totalBelumLunas = tagihanData.filter(t => t.status === 'belum_lunas').length;
    const totalLewatJatuhTempo = tagihanData.filter(t =>
        new Date(t.tgl_jatuh_tempo) < new Date() && t.status === 'belum_lunas'
    ).length;
    const totalJumlah = tagihanData.reduce((sum, t) => sum + parseFloat(t.jumlah), 0);

    const StatCard = ({ icon: Icon, title, value, color }) => (
        <div className={`card border-left-${color} shadow h-100 py-2`}>
            <div className="card-body">
                <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                        <div className={`text-xs font-weight-bold text-${color} text-uppercase mb-1`}>
                            {title}
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                            {value}
                        </div>
                    </div>
                    <div className="col-auto">
                        <Icon className={`fas fa-2x text-${color}`} />
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return <div className="text-center mt-5">Memuat data...</div>;
    }

    if (error) {
        return <div className="alert alert-danger mt-5">{error}</div>;
    }

    return (
        <div className="container-fluid mt-4">
            <h1 className="h3 mb-4 text-gray-800 text-capitalize">Dashboard {user.username.replace('_', ' ')}</h1>

            <div className="row">
                {/* Total Tagihan */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <StatCard
                        icon={FaMoneyBillWave}
                        title="Total Tagihan"
                        value={totalTagihan}
                        color="primary"
                    />
                </div>

                {/* Tagihan Belum Lunas */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <StatCard
                        icon={FaClock}
                        title="Belum Lunas"
                        value={totalBelumLunas}
                        color="warning"
                    />
                </div>

                {/* Lewat Jatuh Tempo */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <StatCard
                        icon={FaCalendarTimes}
                        title="Lewat Jatuh Tempo"
                        value={totalLewatJatuhTempo}
                        color="danger"
                    />
                </div>

                {/* Total Jumlah */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <StatCard
                        icon={FaCoins}
                        title="Total Jumlah (Rp)"
                        value={totalJumlah.toLocaleString()}
                        color="success"
                    />
                </div>
            </div>

            {/* Tabel Tagihan */}
            <div className="card shadow mb-4">
                <div className="card-header bg-primary text-white">
                    <h6 className="m-0 font-weight-bold">Daftar Tagihan</h6>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Deskripsi</th>
                                    <th>Jumlah</th>
                                    <th>Jatuh Tempo</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tagihanData.map(tagihan => (
                                    <tr key={tagihan.tagihan_id}>
                                        <td>{tagihan.masterBiaya?.nama_biaya || 'N/A'}</td>
                                        <td>Rp{parseFloat(tagihan.jumlah).toLocaleString()}</td>
                                        <td>{new Date(tagihan.tgl_jatuh_tempo).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`badge text-black ${tagihan.status === 'lunas' ?
                                                'badge-success' : 'badge-warning'}`}>
                                                {tagihan.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOrtu;