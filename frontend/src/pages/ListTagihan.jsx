// src/pages/ListTagihan.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useApp } from '../components/AppContext';
import { FiAlertTriangle, FiClock, FiDollarSign, FiInfo } from 'react-icons/fi';

const ListTagihan = () => {
  const { user, isLoading } = useApp();
  const [tagihanList, setTagihanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State untuk sorting
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' atau 'desc'

  useEffect(() => {
    const fetchData = async () => {
      // Jika user belum siap, bukan orang tua, atau tidak ada ortu_id, hentikan loading
      if (!user || user.role !== 'orang_tua' || !user.ortu_id) {
        setLoading(false);
        return;
      }

      try {
        // 1. Ambil siswa_id lewat /api/orangtua/:ortu_id
        const resOrangTua = await axios.get(
          `${process.env.REACT_APP_BACKEND}/api/orangtua/${user.ortu_id}`
        );
        const siswaId = resOrangTua.data.data?.siswaId;
        if (!siswaId) {
          throw new Error('Data siswa tidak ditemukan untuk orang tua ini');
        }

        // 2. Ambil tagihan berdasarkan siswa_id
        const resTagihan = await axios.get(
          `${process.env.REACT_APP_BACKEND}/api/tagihan`,
          { params: { siswa_id: siswaId } }
        );
        setTagihanList(resTagihan.data.data || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message || 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // 1) Tampilkan spinner selama AppContext masih mem‐fetch /me
  if (isLoading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // 2) Jika user tidak ada (belum login) atau bukan role orang_tua, akses ditolak
  if (!user || user.role !== 'orang_tua') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger d-flex align-items-center">
          <FiAlertTriangle className="me-2" />
          Akses ditolak. Hanya orang tua yang diizinkan
        </div>
      </div>
    );
  }

  // Meng-handle klik pada header untuk sorting
  const handleSort = (field) => {
    if (sortField === field) {
      // Jika sudah sorting di field yang sama, toggle order
      setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
    } else {
      // Jika memilih field baru, set field dan urutan default ke ascending
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Menghasilkan array yang sudah di-sort berdasarkan sortField dan sortOrder
  const getSortedData = () => {
    if (!sortField) {
      return [...tagihanList];
    }

    const sorted = [...tagihanList].sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case 'nama_biaya':
          aVal = a.masterBiaya?.nama_biaya || '';
          bVal = b.masterBiaya?.nama_biaya || '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        case 'jumlah':
          aVal = Number(a.jumlah);
          bVal = Number(b.jumlah);
          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
          return 0;

        case 'tgl_jatuh_tempo':
          // Membandingkan tanggal; converting ke milidetik
          aVal = new Date(a.tgl_jatuh_tempo).getTime();
          bVal = new Date(b.tgl_jatuh_tempo).getTime();
          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
          return 0;

        case 'status':
          aVal = a.status || '';
          bVal = b.status || '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        default:
          return 0;
      }
    });

    return sorted;
  };

  const sortedData = getSortedData();

  // Fungsi kecil untuk menampilkan indikator panah pada header yang sedang di-sort
  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  // 3) Kalau sampai sini, user.role === 'orang_tua'
  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <FiDollarSign className="me-2" />
          Tagihan Anak
        </h2>
      </div>

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
        <div className="table-responsive">
          <table className="table table-striped">
            <thead className="table-dark">
              <tr>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('nama_biaya')}
                >
                  Jenis Tagihan{renderSortIndicator('nama_biaya')}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('jumlah')}
                >
                  Jumlah{renderSortIndicator('jumlah')}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('tgl_jatuh_tempo')}
                >
                  Jatuh Tempo{renderSortIndicator('tgl_jatuh_tempo')}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('status')}
                >
                  Status{renderSortIndicator('status')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    <FiInfo className="me-2" />
                    Tidak ada tagihan
                  </td>
                </tr>
              ) : (
                sortedData.map((tagihan) => (
                  <tr key={tagihan.tagihan_id}>
                    <td>{tagihan.masterBiaya?.nama_biaya || 'Tagihan'}</td>
                    <td>
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                      }).format(tagihan.jumlah)}
                    </td>
                    <td>
                      <FiClock className="me-2" />
                      {new Date(tagihan.tgl_jatuh_tempo).toLocaleDateString(
                        'id-ID'
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          tagihan.status === 'lunas' ? 'bg-success' : 'bg-danger'
                        }`}
                      >
                        {tagihan.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListTagihan;
