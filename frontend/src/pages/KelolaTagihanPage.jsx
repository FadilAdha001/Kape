// src/pages/KelolaTagihanPage.jsx

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

const KelolaTagihanPage = () => {
  const { user } = useApp();
  const [tagihanList, setTagihanList] = useState([]);
  const [siswaList, setSiswaList]     = useState([]);
  const [biayaList, setBiayaList]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [editMode, setEditMode]       = useState(false);

  const [formData, setFormData] = useState({
    tagihan_id:      '',
    siswa_id:        '',
    kelas:           '',
    biaya_id:        '',
    jumlah:          '',
    tgl_jatuh_tempo: '',
    status:          'belum_lunas'
  });

  // State untuk sorting
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' atau 'desc'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tagRes, sisRes, byRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BACKEND}/api/tagihan`),
        axios.get(`${process.env.REACT_APP_BACKEND}/api/siswa`),
        axios.get(`${process.env.REACT_APP_BACKEND}/api/masterbiaya`)
      ]);
      setTagihanList(tagRes.data.data);
      setSiswaList(sisRes.data.data);
      setBiayaList(byRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Jika memilih siswa, ambil sekaligus nama kelasnya
    if (name === 'siswa_id') {
      const sis = siswaList.find(s => s.siswa_id.toString() === value);
      setFormData(prev => ({
        ...prev,
        siswa_id: value,
        kelas:    sis?.kelas?.nama_kelas || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        siswa_id:        formData.siswa_id,
        biaya_id:        formData.biaya_id,
        jumlah:          parseFloat(formData.jumlah),
        tgl_jatuh_tempo: formData.tgl_jatuh_tempo,
        status:          formData.status
      };

      if (editMode) {
        await axios.put(
          `${process.env.REACT_APP_BACKEND}/api/tagihan/${formData.tagihan_id}`,
          payload
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_BACKEND}/api/tagihan`,
          payload
        );
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operasi gagal');
    }
  };

  const handleEdit = (tagihan) => {
    setFormData({
      tagihan_id:      tagihan.tagihan_id,
      siswa_id:        tagihan.siswa_id,
      kelas:           tagihan.siswa?.kelas?.nama_kelas || '',
      biaya_id:        tagihan.biaya_id,
      jumlah:          tagihan.jumlah.toString(),
      tgl_jatuh_tempo: tagihan.tgl_jatuh_tempo.split('T')[0],
      status:          tagihan.status
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin menghapus tagihan ini?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND}/api/tagihan/${id}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Hapus gagal');
    }
  };

  const formatCurrency = (amt) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amt);

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
      return [...tagihanList];
    }

    return [...tagihanList].sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case 'siswa':
          aVal = a.siswa?.nama || '';
          bVal = b.siswa?.nama || '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        case 'kelas':
          aVal = a.siswa?.kelas?.nama_kelas || '';
          bVal = b.siswa?.kelas?.nama_kelas || '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        case 'jenis_biaya':
          aVal = a.masterBiaya?.nama_biaya || '';
          bVal = b.masterBiaya?.nama_biaya || '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        case 'jumlah':
          aVal = Number(a.jumlah);
          bVal = Number(b.jumlah);
          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
          return 0;

        case 'tgl_jatuh_tempo':
          aVal = new Date(a.tgl_jatuh_tempo).getTime();
          bVal = new Date(b.tgl_jatuh_tempo).getTime();
          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
          return 0;

        case 'status':
          aVal = a.status || '';
          bVal = b.status || '';
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

  if (!user) return null;

  const sortedData = getSortedData();

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><FiDollarSign className="me-2" />Kelola Tagihan Siswa</h2>
        {user.role === 'admin' && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setFormData({
                tagihan_id:      '',
                siswa_id:        '',
                kelas:           '',
                biaya_id:        '',
                jumlah:          '',
                tgl_jatuh_tempo: '',
                status:          'belum_lunas'
              });
              setEditMode(false);
              setShowModal(true);
            }}
          >
            <FiPlus className="me-2" /> Tambah Tagihan
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center">
          <FiAlertTriangle className="me-2" />{error}
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
                  onClick={() => handleSort('siswa')}
                >
                  Siswa{renderSortIndicator('siswa')}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('kelas')}
                >
                  Kelas{renderSortIndicator('kelas')}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('jenis_biaya')}
                >
                  Jenis Biaya{renderSortIndicator('jenis_biaya')}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('jumlah')}
                >
                  Jumlah{renderSortIndicator('jumlah')}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('tgl_jatuh_tempo')}
                >
                  Jatuh Tempo{renderSortIndicator('tgl_jatuh_tempo')}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('status')}
                >
                  Status{renderSortIndicator('status')}
                </th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map(t => (
                <tr key={t.tagihan_id}>
                  <td>{t.siswa?.nama || '-'}</td>
                  <td>{t.siswa?.kelas?.nama_kelas || '-'}</td>
                  <td>{t.masterBiaya?.nama_biaya || '-'}</td>
                  <td>{formatCurrency(t.jumlah)}</td>
                  <td>{new Date(t.tgl_jatuh_tempo).toLocaleDateString('id-ID')}</td>
                  <td>
                    <span className={`badge ${t.status === 'lunas' ? 'bg-success' : 'bg-danger'}`}>
                      {t.status === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'}
                    </span>
                  </td>
                  <td>
                    {user.role === 'admin' && (
                      <>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(t)}
                        >
                          <FiEdit />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(t.tagihan_id)}
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

      {showModal && (
        <div className="modal fade show d-block">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editMode ? 'Edit Tagihan' : 'Tambah Tagihan Baru'}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    {/* Kolom Siswa */}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Siswa</label>
                        <select
                          className="form-select"
                          name="siswa_id"
                          value={formData.siswa_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Pilih Siswa</option>
                          {siswaList.map(s => (
                            <option key={s.siswa_id} value={s.siswa_id}>
                              {s.nama} – {s.kelas?.nama_kelas}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Kelas</label>
                        <input
                          type="text"
                          className="form-control"
                          name="kelas"
                          value={formData.kelas}
                          readOnly
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Jenis Biaya</label>
                        <select
                          className="form-select"
                          name="biaya_id"
                          value={formData.biaya_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Pilih Jenis Biaya</option>
                          {biayaList.map(b => (
                            <option key={b.biaya_id} value={b.biaya_id}>
                              {b.nama_biaya}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Kolom Detail Tagihan */}
                    <div className="col-md-6">
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
                        <label className="form-label">Tanggal Jatuh Tempo</label>
                        <input
                          type="date"
                          className="form-control"
                          name="tgl_jatuh_tempo"
                          value={formData.tgl_jatuh_tempo}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="belum_lunas">Belum Lunas</option>
                          <option value="lunas">Lunas</option>
                        </select>
                      </div>
                    </div>
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
                  <button className="btn btn-primary" type="submit">
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

export default KelolaTagihanPage;
