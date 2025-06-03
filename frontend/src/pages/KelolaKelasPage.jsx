// src/pages/KelolaKelasPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiAlertTriangle,
  FiUsers,
  FiBook
} from 'react-icons/fi';
import { useApp } from '../components/AppContext';

const KelolaKelasPage = () => {
  const { user } = useApp();
  const [kelasList, setKelasList] = useState([]);
  const [karyawanList, setKaryawanList] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [studentsList, setStudentsList] = useState([]); // siswa per kelas
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedKelasName, setSelectedKelasName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nama_kelas: '',
    kapasitas: '',
    deskripsi: '',
    tahun_ajaran: '',
    karyawan_id: ''
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
      const [kelasRes, karyawanRes, siswaRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BACKEND}/api/kelas`),
        axios.get(`${process.env.REACT_APP_BACKEND}/api/karyawan`),
        axios.get(`${process.env.REACT_APP_BACKEND}/api/siswa`)
      ]);

      setKelasList(kelasRes.data.data);
      setKaryawanList(karyawanRes.data.data);
      setAllStudents(siswaRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        kapasitas: parseInt(formData.kapasitas, 10)
      };

      if (editMode) {
        await axios.put(
          `${process.env.REACT_APP_BACKEND}/api/kelas/${formData.kelas_id}`,
          payload
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_BACKEND}/api/kelas`,
          payload
        );
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operasi gagal');
    }
  };

  const handleShowStudents = kelas => {
    const filtered = allStudents.filter(
      s => s.kelas_id === kelas.kelas_id
    );
    setStudentsList(filtered);
    setSelectedKelasName(kelas.nama_kelas);
    setShowStudentsModal(true);
  };

  const handleEdit = kelas => {
    setFormData({
      ...kelas,
      kapasitas: kelas.kapasitas.toString()
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('Apakah Anda yakin menghapus data ini?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND}/api/kelas/${id}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Hapus gagal');
    }
  };

  if (!['admin', 'guru', 'kepsek'].includes(user?.role)) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Akses ditolak. Hanya administrator yang diizinkan
        </div>
      </div>
    );
  }

  // Sorting handlers
  const handleSort = field => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortedData = () => {
    if (!sortField) return [...kelasList];
    return [...kelasList].sort((a, b) => {
      let aVal, bVal;
      switch (sortField) {
        case 'nama_kelas':
          aVal = a.nama_kelas || '';
          bVal = b.nama_kelas || '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });
        case 'kapasitas':
          aVal = a.kapasitas;
          bVal = b.kapasitas;
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        case 'tahun_ajaran':
          aVal = a.tahun_ajaran || '';
          bVal = b.tahun_ajaran || '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });
        case 'wali_kelas':
          aVal = a.karyawan?.nama || '';
          bVal = b.karyawan?.nama || '';
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
          <FiBook className="me-2" />Kelola Kelas
        </h2>
        {['admin', 'kepsek'].includes(user.role) && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setFormData({
                nama_kelas: '',
                kapasitas: '',
                deskripsi: '',
                tahun_ajaran: '',
                karyawan_id: ''
              });
              setEditMode(false);
              setShowModal(true);
            }}
          >
            <FiPlus className="me-2" /> Tambah Kelas
          </button>
        )}
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
                  onClick={() => handleSort('nama_kelas')}
                >
                  Nama Kelas{renderSortIndicator('nama_kelas')}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('kapasitas')}
                >
                  Kapasitas{renderSortIndicator('kapasitas')}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('tahun_ajaran')}
                >
                  Tahun Ajaran{renderSortIndicator('tahun_ajaran')}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('wali_kelas')}
                >
                  Wali Kelas{renderSortIndicator('wali_kelas')}
                </th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map(kelas => (
                <tr key={kelas.kelas_id}>
                  <td>{kelas.nama_kelas}</td>
                  <td>{kelas.kapasitas}</td>
                  <td>{kelas.tahun_ajaran}</td>
                  <td>{kelas.karyawan?.nama || '-'}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-info me-2"
                      onClick={() => handleShowStudents(kelas)}
                    >
                      <FiUsers />
                    </button>
                    {['admin', 'kepsek'].includes(user.role) && (
                      <>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(kelas)}
                        >
                          <FiEdit />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(kelas.kelas_id)}
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
        <div className="modal fade show d-block">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editMode ? 'Edit Kelas' : 'Tambah Kelas Baru'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Nama Kelas</label>
                        <input
                          type="text"
                          className="form-control"
                          name="nama_kelas"
                          value={formData.nama_kelas}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Kapasitas</label>
                        <input
                          type="number"
                          className="form-control"
                          name="kapasitas"
                          value={formData.kapasitas}
                          onChange={handleInputChange}
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Tahun Ajaran</label>
                        <input
                          type="text"
                          className="form-control"
                          name="tahun_ajaran"
                          value={formData.tahun_ajaran}
                          onChange={handleInputChange}
                          placeholder="Contoh: 2023/2024"
                          pattern="\d{4}\/\d{4}"
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Wali Kelas</label>
                        <select
                          className="form-select"
                          name="karyawan_id"
                          value={formData.karyawan_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Pilih Wali Kelas</option>
                          {karyawanList.map(karyawan => (
                            <option
                              key={karyawan.karyawan_id}
                              value={karyawan.karyawan_id}
                            >
                              {karyawan.nama} – {karyawan.posisi}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
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

      {/* Modal Daftar Siswa di Kelas */}
      {showStudentsModal && (
        <div className="modal fade show d-block">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Siswa di Kelas: {selectedKelasName}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowStudentsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {studentsList.length === 0 ? (
                  <p>Tidak ada siswa terdaftar.</p>
                ) : (
                  <ul className="list-group">
                    {studentsList.map(s => (
                      <li key={s.siswa_id} className="list-group-item">
                        {s.nama} — {s.kelas?.nama_kelas}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowStudentsModal(false)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaKelasPage;
