import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiLogIn, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { useApp } from '../components/AppContext';

export default function FormRegister() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { user } = useApp();

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND}/api/auth/login`,
                credentials
            );

            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                setInterval(500);
                window.location.reload();
                navigate('/dashboard'); 
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Koneksi ke server gagal';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container pt-5 mt-5" >
            <div className="card shadow-lg col-md-6 mx-auto">
                <div className="card-header bg-primary text-white text-center">
                    <h4 className="mb-0">
                        <FiLogIn className="me-2" />
                        Login Sistem
                    </h4>
                </div>

                <div className="card-body p-4">
                    {error && (
                        <div className="alert alert-danger d-flex align-items-center">
                            <FiLock className="me-2" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        {/* Username Input */}
                        <div className="mb-3">
                            <label className="form-label">Username</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <FiUser />
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Masukkan username"
                                    required
                                    value={credentials.username}
                                    onChange={(e) =>
                                        setCredentials({
                                            ...credentials,
                                            username: e.target.value
                                        })
                                    }
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="mb-4">
                            <label className="form-label">Password</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <FiLock />
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-control"
                                    placeholder="Masukkan password"
                                    required
                                    value={credentials.password}
                                    onChange={(e) =>
                                        setCredentials({
                                            ...credentials,
                                            password: e.target.value
                                        })
                                    }
                                />
                                <span
                                    className="input-group-text"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="d-grid gap-2">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <FiLogIn className="me-2" />
                                        Masuk
                                    </>
                                )}
                            </button>
                            {/*<button
                                type="button"
                                className="btn btn-link"
                                onClick={() => navigate('/register')}
                            >
                                Belum punya akun? Daftar disini
                            </button>*/}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
