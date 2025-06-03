// src/pages/KelolaKaryawanPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiPlus, FiEdit, FiTrash2, FiAlertTriangle,
  FiUser, FiKey, FiUserCheck
} from 'react-icons/fi';
import { useApp } from '../components/AppContext';

const initialFormData = {
  karyawan_id: null,
  nama: '',
  posisi: 'tetap',
  tgl_lahir: '',
  jk: 'L',
  alamat: '',
  no_hp: '',
  gaji: ''
};

const initialUserForm = {
  username: '',
  password: '',
  karyawan_id: null
};

const KelolaKaryawanPage = () => {
  const { user } = useApp();
  const [karyawanList, setKaryawanList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingForm, setLoadingForm] = useState(false);
  const [errorData, setErrorData] = useState('');
  const [errorForm, setErrorForm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [editMode, setEditMode] = useState(false);

  // State untuk sorting
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' atau 'desc'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    setErrorData('');
    try {
      const [karyawanRes, usersRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BACKEND}/api/karyawan`),
        axios.get(`${process.env.REACT_APP_BACKEND}/api/users`)
      ]);
      setKaryawanList(karyawanRes.data.data);
      setUsersList(usersRes.data.data);
    } catch (err) {
      setErrorData(err.response?.data?.message || 'Gagal memuat data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setFormData(initialFormData);
    setEditMode(false);
    setErrorForm('');
    setShowModal(true);
  };

  const handleEdit = (karyawan) => {
    setFormData({
      karyawan_id: karyawan.karyawan_id,
      nama: karyawan.nama,
      posisi: karyawan.posisi,
      tgl_lahir: karyawan.tgl_lahir,
      jk: karyawan.jk,
      alamat: karyawan.alamat,
      no_hp: karyawan.no_hp,
      gaji: karyawan.gaji.toString()
    });
    setEditMode(true);
    setErrorForm('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    setErrorForm('');
    try {
      const payload = {
        nama: formData.nama,
        posisi: formData.posisi,
        tgl_lahir: formData.tgl_lahir,
        jk: formData.jk,
        alamat: formData.alamat,
        no_hp: formData.no_hp,
        gaji: parseFloat(formData.gaji)
      };

      if (editMode) {
        await axios.put(
          `${process.env.REACT_APP_BACKEND}/api/karyawan/${formData.karyawan_id}`,
          payload
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_BACKEND}/api/karyawan`,
          payload
        );
      }
      setShowModal(false);
      await fetchData();
    } catch (err) {
      setErrorForm(err.response?.data?.message || 'Operasi gagal');
    } finally {
      setLoadingForm(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin menghapus data ini?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND}/api/karyawan/${id}`);
      await fetchData();
    } catch (err) {
      setErrorData(err.response?.data?.message || 'Hapus gagal');
    }
  };

  const getKaryawanUser = (karyawanId) =>
    usersList.find(u => u.karyawan_id === karyawanId);

  const openUserModal = (karyawanId) => {
    setUserForm({ ...initialUserForm, karyawan_id: karyawanId });
    setErrorForm('');
    setShowUserModal(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    setErrorForm('');
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND}/api/users`, {
        username: userForm.username,
        password: userForm.password,
        karyawan_id: userForm.karyawan_id,
        role: 'guru'
      });
      setShowUserModal(false);
      await fetchData();
    } catch (err) {
      setErrorForm(err.response?.data?.message || 'Gagal membuat akun');
    } finally {
      setLoadingForm(false);
    }
  };

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
      return [...karyawanList];
    }

    return [...karyawanList].sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case 'nama':
          aVal = a.nama || '';
          bVal = b.nama || '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        case 'posisi':
          aVal = a.posisi || '';
          bVal = b.posisi || '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        case 'jk':
          aVal = a.jk || '';
          bVal = b.jk || '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        case 'tgl_lahir':
          aVal = new Date(a.tgl_lahir).getTime();
          bVal = new Date(b.tgl_lahir).getTime();
          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
          return 0;

        case 'gaji':
          aVal = Number(a.gaji);
          bVal = Number(b.gaji);
          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
          return 0;

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
          Akses ditolak. Hanya administrator yang diizinkan
        </div>
      </div>
    );
  }

  const sortedData = getSortedData();

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><FiUser className="me-2" />Kelola Karyawan</h2>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <FiPlus className="me-2" /> Tambah Karyawan
        </button>
      </div>

      {errorData && (
        <div className="alert alert-danger d-flex align-items-center">
          <FiAlertTriangle className="me-2" /> {errorData}
        </div>
      )}

      {loadingData
        ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )
        : (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead className="table-dark">
                <tr>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('nama')}
                  >
                    Nama{renderSortIndicator('nama')}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('posisi')}
                  >
                    Status{renderSortIndicator('posisi')}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('jk')}
                  >
                    Jenis Kelamin{renderSortIndicator('jk')}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('tgl_lahir')}
                  >
                    Tanggal Lahir{renderSortIndicator('tgl_lahir')}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('gaji')}
                  >
                    Gaji{renderSortIndicator('gaji')}
                  </th>
                  <th>Akun</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map(k => {
                  const userAcc = getKaryawanUser(k.karyawan_id);
                  return (
                    <tr key={k.karyawan_id}>
                      <td>{k.nama}</td>
                      <td className="text-capitalize">{k.posisi}</td>
                      <td>{k.jk === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                      <td>
                        {new Date(k.tgl_lahir).toLocaleDateString('id-ID')}
                      </td>
                      <td>
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency', currency: 'IDR'
                        }).format(k.gaji)}
                      </td>
                      <td>
                        {userAcc
                          ? (
                            <span className="text-success">
                              <FiUserCheck className="me-1" />
                              {userAcc.username}
                            </span>
                          )
                          : (
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => openUserModal(k.karyawan_id)}
                            >
                              <FiKey className="me-1" /> Buat Akun
                            </button>
                          )
                        }
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(k)}
                        ><FiEdit /></button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(k.karyawan_id)}
                        ><FiTrash2 /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      }

      {/* Modal Tambah/Edit Karyawan */}
      {showModal && (
        <div className="modal fade show d-block">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editMode ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}
                </h5>
                <button type="button" className="btn-close"
                  onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {errorForm && (
                    <div className="alert alert-danger">{errorForm}</div>
                  )}
                  <div className="row">
                    <div className="col-md-6">
                      {/* Nama, Posisi, Jenis Kelamin */}
                      <div className="mb-3">
                        <label className="form-label">Nama Lengkap</label>
                        <input type="text" className="form-control"
                          name="nama"
                          value={formData.nama}
                          onChange={handleInputChange}
                          required />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Status</label>
                        <select className="form-control"
                          name="posisi"
                          value={formData.posisi}
                          onChange={handleInputChange}
                          required>
                          <option value="tetap">Tetap</option>
                          <option value="honorer">Honorer</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Jenis Kelamin</label>
                        <select className="form-select"
                          name="jk"
                          value={formData.jk}
                          onChange={handleInputChange}
                          required>
                          <option value="L">Laki-laki</option>
                          <option value="P">Perempuan</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      {/* Tanggal Lahir, No HP, Gaji */}
                      <div className="mb-3">
                        <label className="form-label">Tanggal Lahir</label>
                        <input type="date" className="form-control"
                          name="tgl_lahir"
                          value={formData.tgl_lahir}
                          onChange={handleInputChange}
                          required />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Nomor HP</label>
                        <input type="tel" className="form-control"
                          name="no_hp"
                          value={formData.no_hp}
                          onChange={handleInputChange}
                          pattern="^\+?[0-9]{10,15}$"
                          required />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Gaji</label>
                        <input type="number" className="form-control"
                          name="gaji"
                          value={formData.gaji}
                          onChange={handleInputChange}
                          min="0" step="1000"
                          required />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Alamat</label>
                    <textarea className="form-control"
                      name="alamat"
                      value={formData.alamat}
                      onChange={handleInputChange}
                      rows="3" required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary"
                    onClick={() => setShowModal(false)} disabled={loadingForm}>
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary"
                    disabled={loadingForm}>
                    {editMode ? 'Simpan Perubahan' : 'Tambah Data'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buat Akun Guru */}
      {showUserModal && (
        <div className="modal fade show d-block">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <FiKey className="me-2" /> Buat Akun Guru
                </h5>
                <button type="button" className="btn-close"
                  onClick={() => setShowUserModal(false)} />
              </div>
              <form onSubmit={handleCreateUser}>
                <div className="modal-body">
                  {errorForm && (
                    <div className="alert alert-danger">{errorForm}</div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input type="text" className="form-control"
                      name="username"
                      value={userForm.username}
                      onChange={handleUserInputChange}
                      required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control"
                      name="password"
                      value={userForm.password}
                      onChange={handleUserInputChange}
                      required />
                  </div>
                  {/* karyawan_id sudah di-handle di state, tidak perlu hidden input */}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary"
                    onClick={() => setShowUserModal(false)} disabled={loadingForm}>
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary"
                    disabled={loadingForm}>
                    Buat Akun
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

export default KelolaKaryawanPage;
