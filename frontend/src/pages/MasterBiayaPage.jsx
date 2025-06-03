// src/pages/MasterBiayaPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { useApp } from '../components/AppContext';

const MasterBiayaPage = () => {
  const { user } = useApp();
  const [masterBiaya, setMasterBiaya] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nama_biaya: '',
    jumlah: '',
    jenis_biaya: 'pengeluaran',
    deskripsi: '',
  });
  const [editMode, setEditMode] = useState(false);

  // State untuk sorting
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' atau 'desc'

  useEffect(() => {
    fetchMasterBiaya();
  }, []);

  const fetchMasterBiaya = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND}/api/masterbiaya`
      );
      setMasterBiaya(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        jumlah: parseFloat(formData.jumlah),
      };

      if (editMode) {
        await axios.put(
          `${process.env.REACT_APP_BACKEND}/api/masterbiaya/${formData.biaya_id}`,
          payload
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_BACKEND}/api/masterbiaya`,
          payload
        );
      }

      setShowModal(false);
      fetchMasterBiaya();
    } catch (err) {
      setError(err.response?.data?.message || 'Operasi gagal');
    }
  };

  const handleEdit = (biaya) => {
    setFormData(biaya);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin menghapus data ini?')) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_BACKEND}/api/masterbiaya/${id}`
        );
        fetchMasterBiaya();
      } catch (err) {
        setError(err.response?.data?.message || 'Hapus gagal');
      }
    }
  };

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
      return [...masterBiaya];
    }

    const sorted = [...masterBiaya].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Untuk field 'jumlah', kita pastikan membandingkan angka
      if (sortField === 'jumlah') {
        aVal = Number(aVal);
        bVal = Number(bVal);
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      }

      // Untuk field teks (nama_biaya, jenis_biaya, deskripsi), gunakan localeCompare
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
          : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });
      }

      // Default fallback (jika bukan number atau string)
      return 0;
    });

    return sorted;
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

  const sortedData = getSortedData();

  // Fungsi kecil untuk menampilkan indikator panah pada header yang sedang di-sort
  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Kelola Master Biaya</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setFormData({
              nama_biaya: '',
              jumlah: '',
              jenis_biaya: 'pengeluaran',
              deskripsi: '',
            });
            setEditMode(false);
            setShowModal(true);
          }}
        >
          <FiPlus className="me-2" /> Tambah Baru
        </button>
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
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((biaya) => (
                <tr key={biaya.biaya_id}>
                  <td>{biaya.nama_biaya}</td>
                  <td>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                    }).format(biaya.jumlah)}
                  </td>
                  <td>
                    <span className="badge bg-primary">
                      {biaya.jenis_biaya}
                    </span>
                  </td>
                  <td>{biaya.deskripsi || '-'}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(biaya)}
                    >
                      <FiEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(biaya.biaya_id)}
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
                  {editMode ? 'Edit Biaya' : 'Tambah Biaya Baru'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nama Biaya</label>
                    <input
                      type="text"
                      className="form-control"
                      name="nama_biaya"
                      value={formData.nama_biaya}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Jumlah</label>
                    <input
                      type="number"
                      className="form-control"
                      name="jumlah"
                      value={formData.jumlah}
                      onChange={handleInputChange}
                      min="0"
                      step="1000"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Jenis Biaya</label>
                    <select
                      className="form-select"
                      name="jenis_biaya"
                      value={formData.jenis_biaya}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="pengeluaran">Pengeluaran</option>
                      <option value="pemasukan">Pemasukan</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Deskripsi</label>
                    <textarea
                      className="form-control"
                      name="deskripsi"
                      value={formData.deskripsi}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
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

export default MasterBiayaPage;
