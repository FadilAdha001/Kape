// src/pages/DataGaji.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useApp } from '../components/AppContext';
import { FiDollarSign, FiAlertTriangle } from 'react-icons/fi';

const DataGaji = () => {
  const { user } = useApp();
  const [gajiList, setGajiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Sorting state
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const fetchDataGaji = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND}/api/masterbiaya`
        );
        if (response.data.success) {
          const filtered = response.data.data.filter(item =>
            item.nama_biaya.toLowerCase().includes('gaji')
          );
          setGajiList(filtered);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data gaji');
      } finally {
        setLoading(false);
      }
    };

    if (['admin', 'kepsek', 'guru'].includes(user?.role)) {
      fetchDataGaji();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!['admin', 'kepsek', 'guru'].includes(user?.role)) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger d-flex align-items-center">
          <FiAlertTriangle className="me-2" />
          Akses ditolak. Hanya administrator yang diizinkan.
        </div>
      </div>
    );
  }

  const handleSort = field => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortedData = () => {
    if (!sortField) return [...gajiList];
    return [...gajiList].sort((a, b) => {
      let aVal = '';
      let bVal = '';
      switch (sortField) {
        case 'nama_guru':
          aVal = a.karyawan?.nama || '';
          bVal = b.karyawan?.nama || '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        case 'nama_biaya':
          aVal = a.nama_biaya || '';
          bVal = b.nama_biaya || '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        case 'jumlah':
          aVal = Number(a.jumlah);
          bVal = Number(b.jumlah);
          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
          return 0;

        case 'jenis_biaya':
          aVal = a.jenis_biaya || '';
          bVal = b.jenis_biaya || '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        case 'deskripsi':
          aVal = a.deskripsi || '';
          bVal = b.deskripsi || '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        default:
          return 0;
      }
    });
  };

  const renderSortIndicator = field => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  const sortedData = getSortedData();

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <FiDollarSign className="me-2" />
          Data Gaji Karyawan
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
        <div className="card shadow-sm">
          <div className="card-body">
            {sortedData.length === 0 ? (
              <div className="alert alert-info">
                Data gaji karyawan belum tersedia.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead className="table-dark">
                    <tr>
                      <th
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSort('nama_guru')}
                      >
                        Nama Guru{renderSortIndicator('nama_guru')}
                      </th>
                      <th
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSort('nama_biaya')}
                      >
                        Nama Biaya{renderSortIndicator('nama_biaya')}
                      </th>
                      <th
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSort('jumlah')}
                      >
                        Jumlah{renderSortIndicator('jumlah')}
                      </th>
                      <th
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSort('jenis_biaya')}
                      >
                        Jenis Biaya{renderSortIndicator('jenis_biaya')}
                      </th>
                      <th
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSort('deskripsi')}
                      >
                        Deskripsi{renderSortIndicator('deskripsi')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map(gaji => (
                      <tr key={gaji.biaya_id}>
                        <td>{gaji.karyawan?.nama || '-'}</td>
                        <td>{gaji.nama_biaya}</td>
                        <td>
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR'
                          }).format(gaji.jumlah)}
                        </td>
                        <td className="text-capitalize">{gaji.jenis_biaya}</td>
                        <td>{gaji.deskripsi || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataGaji;
