// src/pages/KelolaGajiPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiAlertTriangle,
  FiDollarSign
} from 'react-icons/fi';
import { useApp } from '../components/AppContext';

const KelolaGajiPage = () => {
  const { user } = useApp();
  const [gajiList, setGajiList] = useState([]);
  const [masterBiayaList, setMasterBiayaList] = useState([]);
  const [guruList, setGuruList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    pengeluaran_id: '',
    biaya_id: '',
    user_id: '',
    jumlah: '',
    tgl_pengeluaran: '',
    bukti_pengeluaran: null
  });

  // State untuk sorting
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' atau 'desc'

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // 1. Ambil daftar pengeluaran (tanpa include)
      const pengRes = await axios.get(
        `${process.env.REACT_APP_BACKEND}/api/pengeluaran`
      );
      // 2. Ambil masterBiaya tipe pengeluaran
      const mbRes = await axios.get(
        `${process.env.REACT_APP_BACKEND}/api/masterbiaya`,
        { params: { jenis_biaya: 'pengeluaran' } }
      );
      // 3. Ambil semua user dengan relasi karyawan
      const userRes = await axios.get(
        `${process.env.REACT_APP_BACKEND}/api/users`,
        { params: { include: 'karyawan' } }
      );

      // Urutkan gaji descending berdasarkan tanggal
      const sortedPeng = pengRes.data.data.sort(
        (a, b) => new Date(b.tgl_pengeluaran) - new Date(a.tgl_pengeluaran)
      );
      setGajiList(sortedPeng);
      setMasterBiayaList(mbRes.data.data);
      // Filter user yang berposisi 'guru' atau 'honorer'
      setGuruList(
        userRes.data.data.filter(u =>
          ['guru', 'honorer'].includes(u.karyawan?.posisi?.toLowerCase() || '')
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = e => {
    const { name, value, files } = e.target;
    if (name === 'biaya_id') {
      const mb = masterBiayaList.find(
        x => x.biaya_id.toString() === value
      );
      setFormData(f => ({
        ...f,
        biaya_id: value,
        jumlah: mb ? mb.jumlah.toString() : ''
      }));
    } else if (name === 'bukti_pengeluaran') {
      setFormData(f => ({
        ...f,
        bukti_pengeluaran: files[0]
      }));
    } else {
      setFormData(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.biaya_id || !formData.user_id || !formData.tgl_pengeluaran) {
      setError('Pastikan semua field sudah terisi');
      return;
    }
    try {
      const payload = new FormData();
      const mb = masterBiayaList.find(
        m => m.biaya_id.toString() === formData.biaya_id
      );
      const guru = guruList.find(
        g => g.user_id.toString() === formData.user_id
      );
      const deskripsi = `${mb ? mb.nama_biaya : ''}${
        guru ? ' untuk ' + guru.karyawan.nama : ''
      }`;

      payload.append('deskripsi', deskripsi);
      payload.append('biaya_id', formData.biaya_id);
      payload.append('user_id', formData.user_id);
      payload.append('jumlah', formData.jumlah);
      payload.append('tgl_pengeluaran', formData.tgl_pengeluaran);
      if (formData.bukti_pengeluaran) {
        payload.append('bukti_pengeluaran', formData.bukti_pengeluaran);
      }

      if (editMode) {
        await axios.put(
          `${process.env.REACT_APP_BACKEND}/api/pengeluaran/${formData.pengeluaran_id}`,
          payload,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_BACKEND}/api/pengeluaran`,
          payload,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operasi gagal');
    }
  };

  const handleEdit = item => {
    setFormData({
      pengeluaran_id: item.pengeluaran_id || '',
      biaya_id: item.biaya_id ? item.biaya_id.toString() : '',
      user_id: item.user_id ? item.user_id.toString() : '',
      jumlah: item.jumlah ? item.jumlah.toString() : '',
      tgl_pengeluaran: item.tgl_pengeluaran
        ? item.tgl_pengeluaran.split('T')[0]
        : '',
      bukti_pengeluaran: null
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('Yakin menghapus data gaji ini?')) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_BACKEND}/api/pengeluaran/${id}`
      );
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Hapus gagal');
    }
  };

  // Sorting
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
      let aVal, bVal;
      switch (sortField) {
        case 'jenis_gaji':
          aVal = a.masterBiaya?.nama_biaya || '';
          bVal = b.masterBiaya?.nama_biaya || '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        case 'guru':
          aVal = a.user?.karyawan?.nama || '';
          bVal = b.user?.karyawan?.nama || '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        case 'jumlah':
          aVal = Number(a.jumlah);
          bVal = Number(b.jumlah);
          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
          return 0;

        case 'tgl_pengeluaran':
          aVal = new Date(a.tgl_pengeluaran).getTime();
          bVal = new Date(b.tgl_pengeluaran).getTime();
          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
          return 0;

        default:
          return 0;
      }
    });
  };

  const renderSortIndicator = field => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  if (!['admin', 'guru'].includes(user?.role)) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Akses ditolak. Hanya administrator yang diizinkan
        </div>
      </div>
    );
  }

  const sortedData = getSortedData();

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <FiDollarSign className="me-2" />
          {user.role === 'admin' && <span>Kelola </span>}
          Gaji Guru
        </h2>
        {user.role === 'admin' && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setFormData({
                pengeluaran_id: '',
                biaya_id: '',
                user_id: '',
                jumlah: '',
                tgl_pengeluaran: '',
                bukti_pengeluaran: null
              });
              setEditMode(false);
              setShowModal(true);
            }}
          >
            <FiPlus className="me-2" /> Tambah Gaji
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center">
          <FiAlertTriangle className="me-2" />
          {error}
        </div>
      )}

      {/* Tabel Data */}
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
                  onClick={() => handleSort('jenis_gaji')}
                >
                  Jenis Gaji{renderSortIndicator('jenis_gaji')}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('guru')}
                >
                  Guru{renderSortIndicator('guru')}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('jumlah')}
                >
                  Jumlah{renderSortIndicator('jumlah')}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('tgl_pengeluaran')}
                >
                  Tanggal{renderSortIndicator('tgl_pengeluaran')}
                </th>
                <th>Bukti</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map(g => (
                <tr key={g.pengeluaran_id}>
                  <td>{g.masterBiaya?.nama_biaya || '-'}</td>
                  <td>{g.user?.karyawan?.nama || '-'}</td>
                  <td>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR'
                    }).format(g.jumlah)}
                  </td>
                  <td>
                    {new Date(g.tgl_pengeluaran).toLocaleDateString('id-ID')}
                  </td>
                  <td>
                    {g.bukti_pengeluaran && (
                      <a
                        href={`${process.env.REACT_APP_BACKEND}${g.bukti_pengeluaran}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        Lihat
                      </a>
                    )}
                  </td>
                  <td>
                    {user.role === 'admin' && (
                      <>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(g)}
                        >
                          <FiEdit />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(g.pengeluaran_id)}
                        >
                          <FiTrash2 />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editMode ? 'Edit Gaji' : 'Tambah Gaji'}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {/* Input Jenis Gaji */}
                  <div className="mb-3">
                    <label className="form-label">Jenis Gaji</label>
                    <select
                      className="form-select"
                      name="biaya_id"
                      value={formData.biaya_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Pilih Jenis Gaji</option>
                      {masterBiayaList.map(mb => (
                        <option key={mb.biaya_id} value={mb.biaya_id}>
                          {mb.nama_biaya} –{' '}
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR'
                          }).format(mb.jumlah)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Input Guru */}
                  <div className="mb-3">
                    <label className="form-label">Guru</label>
                    <select
                      className="form-select"
                      name="user_id"
                      value={formData.user_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Pilih Guru</option>
                      {guruList.map(g => (
                        <option key={g.user_id} value={g.user_id}>
                          {g.karyawan?.nama} ({g.karyawan?.nip || '-'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Input Jumlah (read-only) */}
                  <div className="mb-3">
                    <label className="form-label">Jumlah</label>
                    <input
                      type="text"
                      className="form-control"
                      value={new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR'
                      }).format(formData.jumlah || 0)}
                      readOnly
                    />
                  </div>

                  {/* Input Tanggal */}
                  <div className="mb-3">
                    <label className="form-label">Tanggal Pembayaran</label>
                    <input
                      type="date"
                      className="form-control"
                      name="tgl_pengeluaran"
                      value={formData.tgl_pengeluaran}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Input Bukti */}
                  <div className="mb-3">
                    <label className="form-label">
                      Bukti Pembayaran {!editMode && '(Opsional)'}
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      name="bukti_pengeluaran"
                      accept="image/*,.pdf"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editMode ? 'Simpan Perubahan' : 'Tambah Gaji'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaGajiPage;
