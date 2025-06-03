// components/FormRegister.js
import React, { useState } from 'react';
import axios from 'axios';
import { FaUser, FaLock, FaIdCard, FaPhone, FaAddressCard, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const FormRegister = () => {
  const [step, setStep] = useState(1);
  const [parentData, setParentData] = useState({
    nama_ayah: '',
    nama_ibu: '',
    pekerjaan_ayah: '',
    pekerjaan_ibu: '',
    no_hp: '',
    alamat: ''
  });
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState({
    username: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleParentDataChange = (e) => {
    setParentData({
      ...parentData,
      [e.target.name]: e.target.value
    });
  };

  const handleUserDataChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitStep1 = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Step 1: Create Parent Data
      const parentResponse = await axios.post(
        `${process.env.REACT_APP_BACKEND}/api/orangtua`,
        parentData
      );

      // Step 2: Create User with parent ID
      const userResponse = await axios.post(
        `${process.env.REACT_APP_BACKEND}/api/users`,
        {
          ...userData,
          role: 'orang_tua',
          ortu_id: parentResponse.data.data.ortu_id
        }
      );

      if (userResponse.data.success) {
        setSuccess('Registrasi berhasil!');
        // Reset form
        setParentData({
          nama_ayah: '',
          nama_ibu: '',
          pekerjaan_ayah: '',
          pekerjaan_ibu: '',
          no_hp: '',
          alamat: ''
        });
        setUserData({ username: '', password: '' });
        setStep(1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
      navigate('/login')
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title text-center mb-4">
                <FaUser className="me-2" />
                Registrasi Orang Tua
              </h3>

              {error && (
                <div className="alert alert-danger d-flex align-items-center">
                  <div>{error}</div>
                </div>
              )}

              {success && (
                <div className="alert alert-success d-flex align-items-center">
                  <div>{success}</div>
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleSubmitStep1}>
                  <div className="row g-3">
                    {/* Data Ayah */}
                    <div className="col-md-6">
                      <h5 className="mb-3"><FaUser className="me-2" />Data Ayah</h5>
                      <div className="mb-3">
                        <label className="form-label">Nama Lengkap</label>
                        <input
                          type="text"
                          className="form-control"
                          name="nama_ayah"
                          value={parentData.nama_ayah}
                          onChange={handleParentDataChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Pekerjaan</label>
                        <input
                          type="text"
                          className="form-control"
                          name="pekerjaan_ayah"
                          value={parentData.pekerjaan_ayah}
                          onChange={handleParentDataChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Data Ibu */}
                    <div className="col-md-6">
                      <h5 className="mb-3"><FaUser className="me-2" />Data Ibu</h5>
                      <div className="mb-3">
                        <label className="form-label">Nama Lengkap</label>
                        <input
                          type="text"
                          className="form-control"
                          name="nama_ibu"
                          value={parentData.nama_ibu}
                          onChange={handleParentDataChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Pekerjaan</label>
                        <input
                          type="text"
                          className="form-control"
                          name="pekerjaan_ibu"
                          value={parentData.pekerjaan_ibu}
                          onChange={handleParentDataChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Kontak dan Alamat */}
                    <div className="col-12">
                      <h5 className="mb-3"><FaPhone className="me-2" />Kontak & Alamat</h5>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Nomor Telepon</label>
                          <input
                            type="tel"
                            className="form-control"
                            name="no_hp"
                            value={parentData.no_hp}
                            onChange={handleParentDataChange}
                            pattern="^\+?[0-9]{10,15}$"
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Alamat</label>
                          <textarea
                            className="form-control"
                            name="alamat"
                            value={parentData.alamat}
                            onChange={handleParentDataChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="d-grid gap-2 mt-4">
                      <button type="submit" className="btn btn-primary">
                        Lanjut ke Step 2
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleFinalSubmit}>
                  <button
                    type="button"
                    className="btn btn-link mb-3"
                    onClick={handleBack}
                  >
                    <FaArrowLeft className="me-2" />
                    Kembali ke Step 1
                  </button>

                  <h5 className="mb-4"><FaLock className="me-2" />Buat Akun</h5>
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Username</label>
                      <input
                        type="text"
                        className="form-control"
                        name="username"
                        value={userData.username}
                        onChange={handleUserDataChange}
                        required
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={userData.password}
                        onChange={handleUserDataChange}
                        required
                      />
                    </div>

                    <div className="d-grid gap-2 mt-4">
                      <button
                        type="submit"
                        className="btn btn-success"
                        disabled={loading}
                      >
                        {loading ? 'Memproses...' : 'Selesaikan Registrasi'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormRegister;