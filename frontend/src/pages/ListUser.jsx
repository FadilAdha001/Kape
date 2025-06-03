// src/pages/ListUser.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaKey
} from 'react-icons/fa';
import { useApp } from '../components/AppContext';

const ListUser = () => {
  const { user } = useApp();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit]     = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // State untuk sorting
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' atau 'desc'

  // Fetch semua user
  const refreshUsers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND}/api/users`);
      setUsers(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat pengguna');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  // Map related_id → field yang benar
  const mapRelated = (payload) => {
    switch (payload.role) {
      case 'siswa':
        payload.siswa_id = payload.related_id;
        break;
      case 'orang_tua':
        payload.ortu_id  = payload.related_id;
        break;
      case 'guru':
        payload.karyawan_id = payload.related_id;
        break;
      default:
        break;
    }
    delete payload.related_id;
    return payload;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    let payload = Object.fromEntries(form.entries());
    try {
      payload = mapRelated(payload);
      await axios.post(`${process.env.REACT_APP_BACKEND}/api/users`, payload);
      setShowCreate(false);
      setLoading(true);
      refreshUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat pengguna');
    }
  };

  const handleEditClick = (u) => {
    setSelectedUser(u);
    setShowEdit(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    let payload = Object.fromEntries(form.entries());
    try {
      payload = mapRelated(payload);
      await axios.put(
        `${process.env.REACT_APP_BACKEND}/api/users/${selectedUser.user_id}`,
        payload
      );
      setShowEdit(false);
      setLoading(true);
      refreshUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui pengguna');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin menghapus pengguna ini?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND}/api/users/${id}`);
      setLoading(true);
      refreshUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus pengguna');
    }
  };

  // Helper: ambil nilai related_id untuk sorting
  const getRelatedId = (u) => {
    if (u.role === 'siswa') return u.siswa_id ?? '';
    if (u.role === 'orang_tua') return u.ortu_id ?? '';
    if (u.role === 'guru') return u.karyawan_id ?? '';
    return '';
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
      return [...users];
    }

    const sorted = [...users].sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case 'username':
          aVal = a.username || '';
          bVal = b.username || '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        case 'role':
          aVal = a.role || '';
          bVal = b.role || '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        case 'related_id':
          aVal = getRelatedId(a);
          bVal = getRelatedId(b);
          // Convert ke number jika memungkinkan, agar sorting angka lebih tepat
          const aNum = Number(aVal);
          const bNum = Number(bVal);
          if (!isNaN(aNum) && !isNaN(bNum)) {
            if (aNum < bNum) return sortOrder === 'asc' ? -1 : 1;
            if (aNum > bNum) return sortOrder === 'asc' ? 1 : -1;
            return 0;
          }
          // Jika bukan angka, fallback ke string compare
          return sortOrder === 'asc'
            ? String(aVal).localeCompare(String(bVal), 'id-ID', { sensitivity: 'base' })
            : String(bVal).localeCompare(String(aVal), 'id-ID', { sensitivity: 'base' });

        default:
          return 0;
      }
    });

    return sorted;
  };

  if (loading) return <div className="text-center mt-5">Memuat pengguna…</div>;
  if (error)   return <div className="alert alert-danger mt-5">{error}</div>;

  const sortedData = getSortedData();

  // Fungsi kecil untuk menampilkan indikator panah pada header yang sedang di-sort
  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Daftar Pengguna</h2>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <FaPlus className="me-2" /> Tambah
        </button>
      </div>

      <table className="table table-striped">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th
              style={{ cursor: 'pointer' }}
              onClick={() => handleSort('username')}
            >
              Username{renderSortIndicator('username')}
            </th>
            <th
              style={{ cursor: 'pointer' }}
              onClick={() => handleSort('role')}
            >
              Role{renderSortIndicator('role')}
            </th>
            <th
              style={{ cursor: 'pointer' }}
              onClick={() => handleSort('related_id')}
            >
              ID Terkait{renderSortIndicator('related_id')}
            </th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((u, i) => (
            <tr key={u.user_id}>
              <td>{i + 1}</td>
              <td>{u.username}</td>
              <td>{u.role}</td>
              <td>
                {u.role === 'siswa'     ? u.siswa_id :
                 u.role === 'orang_tua' ? u.ortu_id :
                 u.role === 'guru'      ? u.karyawan_id :
                 '-'}
              </td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => handleEditClick(u)}
                >
                  <FaEdit />
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(u.user_id)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Tambah */}
      {showCreate && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tambah Pengguna</h5>
                <button className="btn-close" onClick={() => setShowCreate(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input name="username" className="form-control" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <div className="input-group">
                      <span className="input-group-text"><FaKey /></span>
                      <input
                        type="password"
                        name="password"
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select name="role" className="form-select" required>
                      <option value="">Pilih Role</option>
                      <option value="admin">Admin</option>
                      <option value="kepsek">Kepsek</option>
                      <option value="guru">Guru</option>
                      <option value="orang_tua">Orang Tua</option>
                      <option value="siswa">Siswa</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">ID Terkait</label>
                    <input
                      name="related_id"
                      className="form-control"
                      placeholder="ID siswa/ortu/karyawan"
                    />
                    <small className="text-muted">
                      Isi untuk role siswa, orang_tua, atau guru
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCreate(false)}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {showEdit && selectedUser && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Pengguna</h5>
                <button className="btn-close" onClick={() => setShowEdit(false)}></button>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                      name="username"
                      defaultValue={selectedUser.username}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Password <small className="text-muted">(Kosongkan jika tidak diubah)</small>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text"><FaKey /></span>
                      <input
                        type="password"
                        name="password"
                        className="form-control"
                        // tidak required di edit
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select
                      name="role"
                      defaultValue={selectedUser.role}
                      className="form-select"
                      required
                    >
                      <option value="admin">Admin</option>
                      <option value="kepsek">Kepsek</option>
                      <option value="guru">Guru</option>
                      <option value="orang_tua">Orang Tua</option>
                      <option value="siswa">Siswa</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">ID Terkait</label>
                    <input
                      name="related_id"
                      defaultValue={
                        selectedUser.siswa_id ||
                        selectedUser.ortu_id ||
                        selectedUser.karyawan_id ||
                        ''
                      }
                      className="form-control"
                    />
                    <small className="text-muted">
                      Isi untuk role siswa, orang_tua, atau guru
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEdit(false)}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update
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

export default ListUser;
