// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Siswa, OrangTua, Karyawan } = require('../models/ErdModel');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validasi input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username dan password harus diisi'
            });
        }

        // Cari pengguna dengan include model terkait
        const pengguna = await User.findOne({
            where: { username },
            include: [
                { model: Siswa, as: 'siswa' },
                { model: OrangTua, as: 'ortu' },
                { model: Karyawan, as: 'karyawan' }
            ]
        });

        // Validasi pengguna
        if (!pengguna) {
            return res.status(401).json({
                success: false,
                message: 'Username atau password salah'
            });
        }

        // Verifikasi password
        const isMatch = await bcrypt.compare(password, pengguna.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Username atau password salah'
            });
        }

        // Ambil nama_pengguna dari model terkait
        let nama_pengguna = '';
        if (pengguna.role === 'siswa' && pengguna.siswa) {
            nama_pengguna = pengguna.siswa.nama;
        } else if (pengguna.role === 'orang_tua' && pengguna.ortu) {
            nama_pengguna = pengguna.ortu.nama_ayah || pengguna.ortu.nama_ibu;
        } else if (pengguna.role === 'guru' && pengguna.karyawan) {
            nama_pengguna = pengguna.karyawan.nama;
        } else if (['admin', 'kepsek'].includes(pengguna.role)) {
            nama_pengguna = pengguna.username; // Default untuk admin
        }
        let ortu_id = null;
        if (pengguna.role === 'orang_tua' && pengguna.ortu) {
            ortu_id = pengguna.ortu.id || pengguna.ortu.ortu_id;
        }

        // Buat token JWT (pastikan sesuai dengan middleware)
        const token = jwt.sign(
            {
                user_id: pengguna.user_id, // Ubah id_pengguna menjadi user_id
                role: pengguna.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Di response tambahkan user_id
        const userData = {
            user_id: pengguna.user_id,
            username: pengguna.username,
            nama_pengguna,
            role: pengguna.role
        };
        res.status(200).json({
            success: true,
            message: 'Login berhasil',
            token,
            data: userData
        });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
};

exports.me = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Tidak terautentikasi'
            });
        }

        // Cari lagi data User beserta relasi ke tabel OrangTua (as: 'ortu')
        const pengguna = await User.findByPk(req.user.user_id, {
            include: [
                {
                    model: OrangTua,
                    as: 'ortu',
                    attributes: ['ortu_id'] // benar: gunakan kolom PK "ortu_id"
                }
            ]
        });

        if (!pengguna) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        // Ambil ortu_id dari relasi, kalau ada
        const ortu_id = pengguna.ortu ? pengguna.ortu.ortu_id : null;

        const userData = {
            user_id: pengguna.user_id,
            username: pengguna.username,
            nama_pengguna: req.user.nama_pengguna,
            role: pengguna.role,
            ...(ortu_id ? { ortu_id } : {})
        };

        return res.status(200).json({
            success: true,
            data: userData
        });
    } catch (error) {
        console.error('Error in /me:', error);
        return res.status(500).json({
            success: false,
            message: 'Kesalahan server'
        });
    }
};

exports.logout = async (req, res) => {
    try {
        // Client-side: Hapus token dari localStorage
        res.status(200).json({
            success: true,
            message: 'Logout berhasil. Hapus token di client.'
        });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
};