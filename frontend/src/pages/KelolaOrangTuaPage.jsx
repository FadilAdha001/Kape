// src/pages/KelolaOrangTuaPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiPlus, FiEdit, FiTrash2, FiAlertTriangle,
  FiUser, FiKey, FiUserCheck
} from 'react-icons/fi';
import { useApp } from '../components/AppContext';

const KelolaOrangTuaPage = () => {
  const { user } = useApp();
  const [orangTuaList, setOrangTuaList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [formData, setFormData] = useState({
    nama_ayah: '',
    nama_ibu: '',
    no_hp: '',
    ortu_id: null
  });
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    ortu_id: ''
  });
  const [editMode, setEditMode] = useState(false);

  // State untuk sorting
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' atau 'desc'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [orangTuaRes, usersRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BACKEND}/api/orangtua`),
        axios.get(`${process.env.REACT_APP_BACKEND}/api/users`)
      ]);

      setOrangTuaList(orangTuaRes.data.data);
      setUsersList(usersRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(
          `${process.env.REACT_APP_BACKEND}/api/orangtua/${formData.ortu_id}`,
          formData
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_BACKEND}/api/orangtua`,
          formData
        );
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operasi gagal');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND}/api/users`, {
        ...userForm,
        role: 'orang_tua'
      });

      setShowUserModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat akun');
    }
  };

  const handleEdit = (orangTua) => {
    setFormData({
      nama_ayah: orangTua.nama_ayah,
      nama_ibu: orangTua.nama_ibu,
      no_hp: orangTua.no_hp,
      ortu_id: orangTua.ortu_id
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin menghapus data ini?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND}/api/orangtua/${id}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Hapus gagal');
    }
  };

  const getOrangTuaUser = (ortuId) =>
    usersList.find(u => u.ortu_id === ortuId);

  // Meng-handle klik pada header untuk sorting
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle order
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Menghasilkan daftar yang sudah di-sort
  const getSortedData = () => {
    if (!sortField) return [...orangTuaList];

    return [...orangTuaList].sort((a, b) => {
      let aVal = '';
      let bVal = '';

      switch (sortField) {
        case 'nama_ayah':
          aVal = a.nama_ayah || '';
          bVal = b.nama_ayah || '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        case 'nama_ibu':
          aVal = a.nama_ibu || '';
          bVal = b.nama_ibu || '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        case 'no_hp':
          aVal = a.no_hp || '';
          bVal = b.no_hp || '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        default:
          return 0;
      }
    });
  };

  // Tampilkan panah pada header yang sedang di-sort
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
        <h2><FiUser className="me-2" />Kelola Orang Tua</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setFormData({ nama_ayah: '', nama_ibu: '', no_hp: '', ortu_id: null });
            setEditMode(false);
            setShowModal(true);
          }}
        >
          <FiPlus className="me-2" /> Tambah Data
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
                  onClick={() => handleSort('nama_ayah')}
                >
                  Nama Ayah{renderSortIndicator('nama_ayah')}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('nama_ibu')}
                >
                  Nama Ibu{renderSortIndicator('nama_ibu')}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('no_hp')}
                >
                  No. HP{renderSortIndicator('no_hp')}
                </th>
                <th>Akun</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((orangTua) => {
                const userAccount = getOrangTuaUser(orangTua.ortu_id);
                return (
                  <tr key={orangTua.ortu_id}>
                    <td>{orangTua.nama_ayah}</td>
                    <td>{orangTua.nama_ibu}</td>
                    <td>{orangTua.no_hp}</td>
                    <td>
                      {userAccount ? (
                        <span className="text-success">
                          <FiUserCheck className="me-1" />
                          {userAccount.username}
                        </span>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => {
                            setUserForm({
                              username: '',
                              password: '',
                              ortu_id: orangTua.ortu_id
                            });
                            setShowUserModal(true);
                          }}
                        >
                          <FiKey className="me-1" />
                          Buat Akun
                        </button>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(orangTua)}
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(orangTua.ortu_id)}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Data Orang Tua */}
      {showModal && (
        <div className="modal fade show d-block">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editMode ? 'Edit Data Orang Tua' : 'Tambah Data Orang Tua'}
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
                        <label className="form-label">Nama Ayah</label>
                        <input
                          type="text"
                          className="form-control"
                          name="nama_ayah"
                          value={formData.nama_ayah}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">No. HP</label>
                        <input
                          type="tel"
                          className="form-control"
                          name="no_hp"
                          value={formData.no_hp}
                          onChange={handleInputChange}
                          pattern="^\+?[0-9]{10,15}$"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Nama Ibu</label>
                        <input
                          type="text"
                          className="form-control"
                          name="nama_ibu"
                          value={formData.nama_ibu}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
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

      {/* Modal Buat Akun */}
      {showUserModal && (
        <div className="modal fade show d-block">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <FiKey className="me-2" />
                  Buat Akun Orang Tua
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowUserModal(false)}
                />
              </div>
              <form onSubmit={handleCreateUser}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      value={userForm.username}
                      onChange={handleUserInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={userForm.password}
                      onChange={handleUserInputChange}
                      required
                    />
                  </div>
                  <input type="hidden" name="ortu_id" value={userForm.ortu_id} />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowUserModal(false)}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary">
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

export default KelolaOrangTuaPage;
