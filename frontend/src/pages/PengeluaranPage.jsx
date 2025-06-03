// src/pages/PengeluaranPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiAlertTriangle,
  FiActivity
} from 'react-icons/fi';
import { useApp } from '../components/AppContext';

const PengeluaranPage = () => {
  const { user } = useApp();
  const [pengeluaranList, setPengeluaranList] = useState([]);
  const [masterBiayaList, setMasterBiayaList] = useState([]);
  const [guruList, setGuruList] = useState([]); // Daftar semua guru
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    pengeluaran_id: '',
    biaya_id: '',
    user_id: '',       // ID guru penanggung jawab
    deskripsi: '',
    jumlah: '',
    tgl_pengeluaran: ''
  });

  // State untuk sorting
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' atau 'desc'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Mengambil data pengeluaran, daftar masterBiaya, dan daftar guru dari backend
      const [pengeluaranRes, mbRes, guruRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BACKEND}/api/pengeluaran`),
        axios.get(`${process.env.REACT_APP_BACKEND}/api/masterbiaya`),
        axios.get(`${process.env.REACT_APP_BACKEND}/api/users?role=guru`)
      ]);

      setPengeluaranList(pengeluaranRes.data.data);

      // Filter hanya masterBiaya dengan jenis_biaya === 'pengeluaran'
      setMasterBiayaList(
        mbRes.data.data.filter(mb => mb.jenis_biaya === 'pengeluaran')
      );

      // Simpan semua guru yang di‐return API (bisa saja ada guru tanpa nama, nanti kita filter di UI)
      setGuruList(guruRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Jika dropdown MasterBiaya berubah, kita auto‐fill deskripsi dan jumlah
    if (name === 'biaya_id') {
      const mb = masterBiayaList.find(x => x.biaya_id.toString() === value);
      setFormData(prev => ({
        ...prev,
        biaya_id: value,
        deskripsi: mb?.nama_biaya || '',
        jumlah: mb ? mb.jumlah : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formPayload = new FormData();
      formPayload.append('deskripsi', formData.deskripsi);
      formPayload.append('jumlah', formData.jumlah);
      formPayload.append('tgl_pengeluaran', formData.tgl_pengeluaran);
      formPayload.append('biaya_id', formData.biaya_id);
      formPayload.append('user_id', formData.user_id);

      if (file) {
        formPayload.append('bukti_pengeluaran', file);
      }

      if (editMode) {
        // Update data pengeluaran
        await axios.put(
          `${process.env.REACT_APP_BACKEND}/api/pengeluaran/${formData.pengeluaran_id}`,
          formPayload,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
      } else {
        // Tambah pengeluaran baru
        await axios.post(
          `${process.env.REACT_APP_BACKEND}/api/pengeluaran`,
          formPayload,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operasi gagal');
    }
  };

  const handleEdit = (p) => {
    setFormData({
      pengeluaran_id: p.pengeluaran_id,
      biaya_id: p.biaya_id || '',
      user_id: p.user_id || '',
      deskripsi: p.deskripsi,
      jumlah: p.jumlah,
      tgl_pengeluaran: p.tgl_pengeluaran.split('T')[0]
    });
    setFile(null);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin menghapus data ini?')) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_BACKEND}/api/pengeluaran/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Hapus gagal');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Akses ditolak. Hanya administrator yang diizinkan
        </div>
      </div>
    );
  }

  // Filter guruList agar hanya menampilkan entri valid (nama tidak kosong/null)
  const daftarGuruValid = guruList.filter(guru => {
    const nama =
      typeof guru.karyawan?.nama === 'string'
        ? guru.karyawan.nama
        : typeof guru.nama === 'string'
        ? guru.nama
        : '';
    return nama.trim() !== '';
  });

  // Meng-handle klik pada header untuk sorting
  const handleSort = (field) => {
    if (sortField === field) {
      // Jika sudah sorting di field yang sama, toggle order
      setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
    } else {
      // Jika memilih field baru, set field dan urutan default ke ascending
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Menghasilkan array yang sudah di-sort berdasarkan sortField dan sortOrder
  const getSortedData = () => {
    if (!sortField) {
      return [...pengeluaranList];
    }

    return [...pengeluaranList].sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case 'deskripsi':
          aVal = a.deskripsi || '';
          bVal = b.deskripsi || '';
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

        case 'guru':
          aVal =
            a.user?.karyawan?.nama?.trim() ||
            a.user?.nama ||
            '';
          bVal =
            b.user?.karyawan?.nama?.trim() ||
            b.user?.nama ||
            '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        default:
          return 0;
      }
    });
  };

  // Fungsi kecil untuk menampilkan indikator panah pada header yang sedang di-sort
  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  const sortedData = getSortedData();

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><FiActivity className="me-2" />Kelola Pengeluaran</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setFormData({
              pengeluaran_id: '',
              biaya_id: '',
              user_id: '',
              deskripsi: '',
              jumlah: '',
              tgl_pengeluaran: ''
            });
            setFile(null);
            setEditMode(false);
            setShowModal(true);
          }}
        >
          <FiPlus className="me-2" /> Tambah Baru
        </button>
      </div>

      {/* Pesan Error */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center">
          <FiAlertTriangle className="me-2" />
          {error}
        </div>
      )}

      {/* Tabel Pengeluaran */}
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
                  onClick={() => handleSort('deskripsi')}
                >
                  Nama Pengeluaran{renderSortIndicator('deskripsi')}
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
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('guru')}
                >
                  Guru{renderSortIndicator('guru')}
                </th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map(p => (
                <tr key={p.pengeluaran_id}>
                  <td>{p.deskripsi}</td>
                  <td>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR'
                    }).format(p.jumlah)}
                  </td>
                  <td>
                    {new Date(p.tgl_pengeluaran).toLocaleDateString('id-ID')}
                  </td>
                  <td>
                    {p.bukti_pengeluaran && (
                      <a
                        href={`${process.env.REACT_APP_BACKEND}${p.bukti_pengeluaran}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Lihat Bukti
                      </a>
                    )}
                  </td>
                  <td>
                    {p.user?.karyawan?.nama || p.user?.nama || '-'}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(p)}
                    >
                      <FiEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(p.pengeluaran_id)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="modal fade show d-block">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editMode ? 'Edit Pengeluaran' : 'Tambah Pengeluaran Baru'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {/* Dropdown MasterBiaya (jenis pengeluaran) */}
                  <div className="mb-3">
                    <label className="form-label">Jenis Pengeluaran</label>
                    <select
                      className="form-select"
                      name="biaya_id"
                      value={formData.biaya_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Pilih Jenis Pengeluaran</option>
                      {masterBiayaList.map(mb => (
                        <option key={mb.biaya_id} value={mb.biaya_id}>
                          {mb.nama_biaya}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dropdown Guru Penanggung Jawab */}
                  <div className="mb-3">
                    <label className="form-label">Guru Penanggung Jawab</label>
                    <select
                      className="form-select"
                      name="user_id"
                      value={formData.user_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Pilih Guru</option>
                      {daftarGuruValid.map(guru => {
                        const namaGuru =
                          guru.karyawan?.nama?.trim() !== ''
                            ? guru.karyawan.nama
                            : guru.nama;
                        return (
                          <option key={guru.user_id} value={guru.user_id}>
                            {namaGuru}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Deskripsi (auto‐filled oleh MasterBiaya, tapi tetap editable) */}
                  <div className="mb-3">
                    <label className="form-label">Deskripsi</label>
                    <input
                      type="text"
                      className="form-control"
                      name="deskripsi"
                      value={formData.deskripsi}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Input Jumlah (auto‐filled oleh MasterBiaya, tapi bisa diedit) */}
                  <div className="mb-3">
                    <label className="form-label">Jumlah</label>
                    <input
                      type="number"
                      className="form-control"
                      name="jumlah"
                      value={formData.jumlah}
                      onChange={handleInputChange}
                      min="0"
                      required
                    />
                  </div>

                  {/* Tanggal Pengeluaran */}
                  <div className="mb-3">
                    <label className="form-label">Tanggal Pengeluaran</label>
                    <input
                      type="date"
                      className="form-control"
                      name="tgl_pengeluaran"
                      value={formData.tgl_pengeluaran}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Upload Bukti Pengeluaran */}
                  <div className="mb-3">
                    <label className="form-label">Bukti Pengeluaran</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={handleFileChange}
                      accept="image/*, .pdf, .doc, .docx"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editMode ? 'Simpan Perubahan' : 'Tambah Data'}
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

export default PengeluaranPage;
