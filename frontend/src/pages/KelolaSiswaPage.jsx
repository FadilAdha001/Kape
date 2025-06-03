// src/pages/KelolaSiswaPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiAlertTriangle,
  FiUser,
  FiDollarSign
} from 'react-icons/fi';
import { useApp } from '../components/AppContext';

const KelolaSiswaPage = () => {
  const { user } = useApp();
  const allowedRoles = ['admin', 'kepsek', 'guru', 'orang_tua'];

  const initialForm = {
    nama: '',
    tgl_lahir: '',
    jk: 'L',
    alamat: '',
    kelas_id: '',
    ortu_id: ''
  };

  const [siswaList, setSiswaList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [orangTuaList, setOrangTuaList] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [selectedSiswa, setSelectedSiswa] = useState(null);

  const [formData, setFormData] = useState(initialForm);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // State untuk sorting
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' atau 'desc'

  useEffect(() => {
    const fetchData = async () => {
      try {
        let siswaRes;
        if (user?.role === 'orang_tua') {
          siswaRes = await axios.get(
            `${process.env.REACT_APP_BACKEND}/api/siswa`,
            { params: { ortu_id: user.ortu_id } }
          );
        } else if (allowedRoles.includes(user?.role)) {
          const [siswa, kelas, orangTua] = await Promise.all([
            axios.get(`${process.env.REACT_APP_BACKEND}/api/siswa`),
            axios.get(`${process.env.REACT_APP_BACKEND}/api/kelas`),
            axios.get(`${process.env.REACT_APP_BACKEND}/api/orangtua`)
          ]);
          siswaRes = siswa;
          setKelasList(kelas.data.data || []);
          setOrangTuaList(orangTua.data.data || []);
        } else {
          return;
        }
        setSiswaList(siswaRes.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const fetchPaymentHistory = async (siswaId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND}/api/tagihan`,
        { params: { siswa_id: siswaId } }
      );
      setPaymentHistory(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat riwayat pembayaran');
    }
  };

  const handleShowPayment = (siswa) => {
    setSelectedSiswa(siswa);
    fetchPaymentHistory(siswa.siswa_id);
    setShowPaymentModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = `${process.env.REACT_APP_BACKEND}/api/siswa${editMode ? `/${formData.siswa_id}` : ''}`;
      const method = editMode ? axios.put : axios.post;
      await method(url, formData);
      setShowModal(false);
      setFormData(initialForm);
      setEditMode(false);
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_BACKEND}/api/siswa`);
      setSiswaList(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Operasi gagal');
    }
  };

  const handleEdit = (siswa) => {
    setFormData({
      ...siswa,
      tgl_lahir: siswa.tgl_lahir.split('T')[0]
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin menghapus data ini?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND}/api/siswa/${id}`);
      setSiswaList(prev => prev.filter(s => s.siswa_id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Hapus gagal');
    }
  };

  // Sorting handlers
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortedData = () => {
    if (!sortField) return [...siswaList];

    return [...siswaList].sort((a, b) => {
      let aVal = '';
      let bVal = '';

      switch (sortField) {
        case 'nama':
          aVal = a.nama || '';
          bVal = b.nama || '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        case 'tgl_lahir':
          aVal = new Date(a.tgl_lahir).getTime();
          bVal = new Date(b.tgl_lahir).getTime();
          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
          return 0;

        case 'jk':
          aVal = a.jk || '';
          bVal = b.jk || '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        case 'kelas':
          aVal = a.kelas?.nama_kelas || '';
          bVal = b.kelas?.nama_kelas || '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        case 'orang_tua':
          aVal = `${a.orangTua?.nama_ayah || ''} & ${a.orangTua?.nama_ibu || ''}`;
          bVal = `${b.orangTua?.nama_ayah || ''} & ${b.orangTua?.nama_ibu || ''}`;
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        default:
          return 0;
      }
    });
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  if (!allowedRoles.includes(user?.role)) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger d-flex align-items-center">
          <FiAlertTriangle className="me-2" /> Akses ditolak.
        </div>
      </div>
    );
  }

  const sortedData = getSortedData();

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="d-flex align-items-center">
          <FiUser className="me-2" />
          {user.role === 'orang_tua' ? 'Data Anak Saya' : 'Kelola Siswa'}
        </h2>
        {user.role === 'admin' && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setFormData(initialForm);
              setEditMode(false);
              setShowModal(true);
            }}
          >
            <FiPlus className="me-2" /> Tambah Siswa
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center">
          <FiAlertTriangle className="me-2" /> {error}
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
                  onClick={() => handleSort('nama')}
                >
                  Nama Anak{renderSortIndicator('nama')}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('tgl_lahir')}
                >
                  Tanggal Lahir{renderSortIndicator('tgl_lahir')}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('jk')}
                >
                  Jenis Kelamin{renderSortIndicator('jk')}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('kelas')}
                >
                  Kelas{renderSortIndicator('kelas')}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('orang_tua')}
                >
                  Nama Orang Tua{renderSortIndicator('orang_tua')}
                </th>
                <th>Aksi</th>
                <th>Riwayat</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map(siswa => (
                <tr key={siswa.siswa_id}>
                  <td>{siswa.nama}</td>
                  <td>
                    {new Date(siswa.tgl_lahir).toLocaleDateString('id-ID')}
                  </td>
                  <td>{siswa.jk === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                  <td>{siswa.kelas?.nama_kelas || '-'}</td>
                  <td className="text-capitalize">
                    {siswa.orangTua?.nama_ayah || '-'} &{' '}
                    {siswa.orangTua?.nama_ibu || '-'}
                  </td>
                  <td>
                    {user.role === 'admin' && (
                      <>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(siswa)}
                        >
                          <FiEdit />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(siswa.siswa_id)}
                        >
                          <FiTrash2 />
                        </button>
                      </>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => handleShowPayment(siswa)}
                    >
                      <FiDollarSign className="me-1" /> Riwayat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showPaymentModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Riwayat Pembayaran – {selectedSiswa?.nama}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPaymentModal(false)}
                />
              </div>
              <div className="modal-body">
                {paymentHistory.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="text-muted">
                      Belum ada riwayat pembayaran
                    </div>
                  </div>
                ) : (
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Tanggal Jatuh Tempo</th>
                        <th>Jenis Biaya</th>
                        <th>Jumlah</th>
                        <th>Status</th>
                        <th>Tanggal Bayar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((tagihan) => (
                        <tr key={tagihan.tagihan_id}>
                          <td>
                            {new Date(tagihan.tgl_jatuh_tempo).toLocaleDateString(
                              'id-ID'
                            )}
                          </td>
                          <td>{tagihan.masterBiaya?.nama_biaya}</td>
                          <td>
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR'
                            }).format(tagihan.jumlah)}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                tagihan.status === 'lunas'
                                  ? 'bg-success'
                                  : 'bg-danger'
                              }`}
                            >
                              {tagihan.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td>
                            {tagihan.updatedAt
                              ? new Date(tagihan.updatedAt).toLocaleDateString(
                                  'id-ID'
                                )
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal fade show d-block">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editMode ? 'Edit Siswa' : 'Tambah Siswa Baru'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Nama Lengkap</label>
                        <input
                          type="text"
                          className="form-control"
                          name="nama"
                          value={formData.nama}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Tanggal Lahir</label>
                        <input
                          type="date"
                          className="form-control"
                          name="tgl_lahir"
                          value={formData.tgl_lahir}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Jenis Kelamin</label>
                        <select
                          className="form-select"
                          name="jk"
                          value={formData.jk}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="L">Laki-laki</option>
                          <option value="P">Perempuan</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Kelas</label>
                        <select
                          className="form-select"
                          name="kelas_id"
                          value={formData.kelas_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Pilih Kelas</option>
                          {kelasList.map(k => (
                            <option key={k.kelas_id} value={k.kelas_id}>
                              {k.nama_kelas} ({k.tahun_ajaran})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Orang Tua</label>
                        <select
                          className="form-select"
                          name="ortu_id"
                          value={formData.ortu_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Pilih Orang Tua</option>
                          {orangTuaList.map(ot => (
                            <option key={ot.ortu_id} value={ot.ortu_id}>
                              {ot.nama_ayah} & {ot.nama_ibu}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Alamat</label>
                    <textarea
                      className="form-control"
                      name="alamat"
                      rows="3"
                      value={formData.alamat}
                      onChange={handleInputChange}
                      required
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

export default KelolaSiswaPage;
