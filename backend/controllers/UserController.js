// controllers/UserController.js
const bcrypt = require('bcrypt');
const { User, Siswa, OrangTua, Karyawan } = require('../models/ErdModel');

/**
 * Membuat pengguna baru
 */
exports.createUser = async (req, res) => {
    try {
        const { username, password, role, siswa_id, ortu_id, karyawan_id } = req.body;

        // Validasi input wajib
        if (!username || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Username, password, dan role harus diisi'
            });
        }

        // Validasi role
        const validRoles = ['admin', 'kepsek', 'guru', 'orang_tua', 'siswa'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Role tidak valid. Harus salah satu dari: ${validRoles.join(', ')}`
            });
        }

        // Inisialisasi objek pengguna
        const userAttributes = {
            username,
            password,
            role,
            siswa_id: null,
            ortu_id: null,
            karyawan_id: null
        };

        // Set foreign key sesuai role
        if (role === 'siswa') {
            userAttributes.siswa_id = siswa_id;
        } else if (role === 'orang_tua') {
            userAttributes.ortu_id = ortu_id;
        } else if (role === 'guru') {
            userAttributes.karyawan_id = karyawan_id;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        userAttributes.password = await bcrypt.hash(password, salt);

        // Buat pengguna baru
        const newUser = await User.create(userAttributes);

        // Hapus password dari response
        const userData = newUser.toJSON();
        delete userData.password;

        res.status(201).json({
            success: true,
            message: 'Pengguna berhasil dibuat',
            data: userData
        });
    } catch (error) {
        console.error('Error saat membuat pengguna:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal membuat pengguna'
        });
    }
};

/**
 * Mengambil semua pengguna
 */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            include: [
                { model: Siswa, as: 'siswa' },
                { model: OrangTua, as: 'ortu' },
                { model: Karyawan, as: 'karyawan' }
            ]
        });

        // Hapus password dari semua pengguna
        const usersWithoutPassword = users.map(user => {
            const userData = user.toJSON();
            delete userData.password;
            return userData;
        });

        res.status(200).json({
            success: true,
            data: usersWithoutPassword
        });
    } catch (error) {
        console.error('Error saat mengambil daftar pengguna:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil daftar pengguna'
        });
    }
};

/**
 * Mengambil pengguna berdasarkan ID
 */
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            include: [
                { model: Siswa, as: 'siswa' },
                { model: OrangTua, as: 'ortu' },
                { model: Karyawan, as: 'karyawan' }
            ]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Pengguna tidak ditemukan'
            });
        }

        const userData = user.toJSON();
        delete userData.password;

        res.status(200).json({
            success: true,
            data: userData
        });
    } catch (error) {
        console.error('Error saat mengambil data pengguna:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data pengguna'
        });
    }
};

/**
 * Memperbarui data pengguna
 */
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, role, siswa_id, ortu_id, karyawan_id } = req.body;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Pengguna tidak ditemukan'
            });
        }

        const updateData = {};
        if (username) updateData.username = username;

        // Validasi role jika diubah
        if (role) {
            const validRoles = ['admin', 'kepsek', 'guru', 'orang_tua', 'siswa'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: `Role tidak valid. Harus salah satu dari: ${validRoles.join(', ')}`
                });
            }
            updateData.role = role;

            // Sesuaikan foreign key sesuai role baru
            if (role === 'siswa') {
                if (!siswa_id) {
                    return res.status(400).json({
                        success: false,
                        message: 'siswa_id diperlukan untuk role siswa'
                    });
                }
                updateData.siswa_id = siswa_id;
                updateData.ortu_id = null;
                updateData.karyawan_id = null;
            } else if (role === 'orang_tua') {
                if (!ortu_id) {
                    return res.status(400).json({
                        success: false,
                        message: 'ortu_id diperlukan untuk role orang tua'
                    });
                }
                updateData.ortu_id = ortu_id;
                updateData.siswa_id = null;
                updateData.karyawan_id = null;
            } else if (role === 'guru') {
                if (!karyawan_id) {
                    return res.status(400).json({
                        success: false,
                        message: 'karyawan_id diperlukan untuk role guru'
                    });
                }
                updateData.karyawan_id = karyawan_id;
                updateData.siswa_id = null;
                updateData.ortu_id = null;
            } else {
                updateData.siswa_id = null;
                updateData.ortu_id = null;
                updateData.karyawan_id = null;
            }
        }

        // Hash password baru jika ada
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        // Update foreign key jika role tetap sama
        const currentRole = role || user.role;
        if (currentRole === 'siswa' && siswa_id) {
            updateData.siswa_id = siswa_id;
        } else if (currentRole === 'orang_tua' && ortu_id) {
            updateData.ortu_id = ortu_id;
        } else if (currentRole === 'guru' && karyawan_id) {
            updateData.karyawan_id = karyawan_id;
        }

        await user.update(updateData);

        const updatedUser = await User.findByPk(id, {
            include: [
                { model: Siswa, as: 'siswa' },
                { model: OrangTua, as: 'ortu' },
                { model: Karyawan, as: 'karyawan' }
            ]
        });

        const userData = updatedUser.toJSON();
        delete userData.password;

        res.status(200).json({
            success: true,
            message: 'Pengguna berhasil diperbarui',
            data: userData
        });
    } catch (error) {
        console.error('Error saat memperbarui pengguna:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui pengguna'
        });
    }
};

/**
 * Menghapus pengguna berdasarkan ID
 */
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Pengguna tidak ditemukan'
            });
        }

        await user.destroy();

        res.status(200).json({
            success: true,
            message: 'Pengguna berhasil dihapus'
        });
    } catch (error) {
        console.error('Error saat menghapus pengguna:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus pengguna'
        });
    }
};