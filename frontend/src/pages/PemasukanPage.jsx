// src/pages/PemasukanPage.jsx

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

const PemasukanPage = () => {
  const { user } = useApp();
  const [pemasukanList, setPemasukanList] = useState([]);
  const [tagihanList, setTagihanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    pemasukan_id: '',
    tagihan_id: '',
    jumlah_bayar: '',
    tgl_bayar: '',
    metode_pembayaran: 'transfer'
  });

  // State untuk sorting
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' atau 'desc'

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [pemasukanRes, tagihanRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BACKEND}/api/pemasukan`),
        axios.get(`${process.env.REACT_APP_BACKEND}/api/tagihan`)
      ]);
      setPemasukanList(pemasukanRes.data.data);
      setTagihanList(tagihanRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  // Handler yang diubah untuk mengisi jumlah_bayar otomatis
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'tagihan_id') {
      // Cari objek tagihan berdasarkan ID yang dipilih
      const selectedTagihan = tagihanList.find(
        (t) => t.tagihan_id.toString() === value
      );
      // Ambil properti jumlah (default bayar)
      const defaultJumlah = selectedTagihan ? selectedTagihan.jumlah : '';
      setFormData(prev => ({
        ...prev,
        tagihan_id: value,
        jumlah_bayar: defaultJumlah
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        tagihan_id: parseInt(formData.tagihan_id),
        jumlah_bayar: parseFloat(formData.jumlah_bayar),
        tgl_bayar: formData.tgl_bayar,
        metode_pembayaran: formData.metode_pembayaran
      };

      if (editMode) {
        await axios.put(
          `${process.env.REACT_APP_BACKEND}/api/pemasukan/${formData.pemasukan_id}`,
          payload
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_BACKEND}/api/pemasukan`,
          payload
        );
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operasi gagal');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      pemasukan_id: item.pemasukan_id,
      tagihan_id: item.tagihan_id,
      jumlah_bayar: item.jumlah_bayar,
      tgl_bayar: item.tgl_bayar.split('T')[0],
      metode_pembayaran: item.metode_pembayaran
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin menghapus data ini?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND}/api/pemasukan/${id}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Hapus gagal');
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
      return [...pemasukanList];
    }

    return [...pemasukanList].sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case 'tagihan_id':
          aVal = a.tagihan_id;
          bVal = b.tagihan_id;
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;

        case 'jumlah_bayar':
          aVal = Number(a.jumlah_bayar);
          bVal = Number(b.jumlah_bayar);
          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
          return 0;

        case 'tgl_bayar':
          aVal = new Date(a.tgl_bayar).getTime();
          bVal = new Date(b.tgl_bayar).getTime();
          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
          return 0;

        case 'metode_pembayaran':
          aVal = a.metode_pembayaran || '';
          bVal = b.metode_pembayaran || '';
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

  if (user?.role !== 'admin') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Akses ditolak. Hanya administrator yang diizinkan.
        </div>
      </div>
    );
  }

  const sortedData = getSortedData();

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><FiDollarSign className="me-2" />Kelola Pemasukan</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setFormData({
              pemasukan_id: '',
              tagihan_id: '',
              jumlah_bayar: '',
              tgl_bayar: '',
              metode_pembayaran: 'transfer'
            });
            setEditMode(false);
            setShowModal(true);
          }}
        >
          <FiPlus className="me-2" /> Tambah Baru
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center">
          <FiAlertTriangle className="me-2" />
          {error}
        </div>
      )}

      {/* Tabel Pemasukan */}
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
                  onClick={() => handleSort('tagihan_id')}
                >
                  ID Tagihan{renderSortIndicator('tagihan_id')}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('jumlah_bayar')}
                >
                  Jumlah Bayar{renderSortIndicator('jumlah_bayar')}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('tgl_bayar')}
                >
                  Tanggal Bayar{renderSortIndicator('tgl_bayar')}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('metode_pembayaran')}
                >
                  Metode{renderSortIndicator('metode_pembayaran')}
                </th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map(p => (
                <tr key={p.pemasukan_id}>
                  <td>#{p.tagihan_id}</td>
                  <td>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR'
                    }).format(p.jumlah_bayar)}
                  </td>
                  <td>
                    {new Date(p.tgl_bayar).toLocaleDateString('id-ID')}
                  </td>
                  <td>
                    <span className="badge bg-info text-capitalize">
                      {p.metode_pembayaran}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(p)}
                    ><FiEdit /></button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(p.pemasukan_id)}
                    ><FiTrash2 /></button>
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
                  {editMode ? 'Edit Pemasukan' : 'Tambah Pemasukan'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {/* Dropdown Tagihan */}
                  <div className="mb-3">
                    <label className="form-label">Tagihan</label>
                    <select
                      className="form-select"
                      name="tagihan_id"
                      value={formData.tagihan_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Pilih Tagihan</option>
                      {tagihanList.map(tagihan => (
                        <option
                          key={tagihan.tagihan_id}
                          value={tagihan.tagihan_id}
                        >
                          #{tagihan.tagihan_id} - {tagihan.siswa?.nama} -{' '}
                          {tagihan.masterBiaya?.nama_biaya} -{' '}
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR'
                          }).format(tagihan.jumlah)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Input Jumlah Bayar (otomatis terisi) */}
                  <div className="mb-3">
                    <label className="form-label">Jumlah Bayar</label>
                    <input
                      type="number"
                      className="form-control"
                      name="jumlah_bayar"
                      value={formData.jumlah_bayar}
                      onChange={handleInputChange}
                      min="0"
                      step="1000"
                      required
                    />
                  </div>

                  {/* Input Tanggal Bayar */}
                  <div className="mb-3">
                    <label className="form-label">Tanggal Bayar</label>
                    <input
                      type="date"
                      className="form-control"
                      name="tgl_bayar"
                      value={formData.tgl_bayar}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Dropdown Metode Pembayaran */}
                  <div className="mb-3">
                    <label className="form-label">Metode Pembayaran</label>
                    <select
                      className="form-select"
                      name="metode_pembayaran"
                      value={formData.metode_pembayaran}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="transfer">Transfer Bank</option>
                      <option value="tunai">Tunai</option>
                      <option value="e-wallet">E-Wallet</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >Batal</button>
                  <button type="submit" className="btn btn-primary">
                    {editMode ? 'Simpan' : 'Tambah'}
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

export default PemasukanPage;
