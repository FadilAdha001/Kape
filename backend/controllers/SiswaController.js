// controllers/SiswaController.js
const { Siswa, OrangTua, Kelas } = require('../models/ErdModel');

/**
 * Membuat siswa baru
 */
exports.createSiswa = async (req, res) => {
    try {
        const {
            nama,
            tgl_lahir,
            jk,
            alamat,
            kelas_id,
            ortu_id
        } = req.body;

        // Validasi input wajib
        if (!nama || !tgl_lahir || !jk || !alamat || !kelas_id || !ortu_id) {
            return res.status(400).json({
                success: false,
                message: 'Semua field wajib diisi'
            });
        }

        // Validasi jenis kelamin
        if (!['L', 'P'].includes(jk)) {
            return res.status(400).json({
                success: false,
                message: 'Jenis kelamin harus L (Laki-laki) atau P (Perempuan)'
            });
        }

        // Validasi format tanggal
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(tgl_lahir)) {
            return res.status(400).json({
                success: false,
                message: 'Format tanggal lahir harus YYYY-MM-DD'
            });
        }

        // Cek apakah kelas_id valid
        const kelas = await Kelas.findByPk(kelas_id);
        if (!kelas) {
            return res.status(400).json({
                success: false,
                message: 'kelas_id tidak ditemukan'
            });
        }

        // Cek apakah ortu_id valid
        const ortu = await OrangTua.findByPk(ortu_id);
        if (!ortu) {
            return res.status(400).json({
                success: false,
                message: 'ortu_id tidak ditemukan'
            });
        }

        // Buat siswa baru
        const newSiswa = await Siswa.create({
            nama,
            tgl_lahir,
            jk,
            alamat,
            kelas_id,
            ortu_id
        });

        // Ambil data dengan relasi
        const createdSiswa = await Siswa.findByPk(newSiswa.siswa_id, {
            include: [
                { model: OrangTua, as: 'orangTua' },
                { model: Kelas, as: 'kelas' }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Siswa berhasil dibuat',
            data: createdSiswa
        });
    } catch (error) {
        console.error('Error saat membuat siswa:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal membuat siswa'
        });
    }
};

exports.countSiswa = async (req, res) => {
    try {
        const total = await Siswa.count();
        res.status(200).json({ success: true, total });
    } catch (error) {
        console.error('Error count siswa:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghitung total siswa'
        });
    }
};

/**
 * Mengambil semua siswa
 */
exports.getAllSiswa = async (req, res) => {
    try {
        const { ortu_id } = req.query;
        const whereClause = {};
        if (ortu_id) whereClause.ortu_id = ortu_id;

        const siswaList = await Siswa.findAll({
            where: whereClause,
            include: [
                { model: OrangTua, as: 'orangTua' },
                { model: Kelas, as: 'kelas' }
            ]
        });

        res.status(200).json({ success: true, data: siswaList });
    } catch (error) {
        console.error('Error saat mengambil daftar siswa:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil daftar siswa'
        });
    }
};

/**
 * Mengambil siswa berdasarkan ID
 */
exports.getSiswaById = async (req, res) => {
    try {
        const { id } = req.params;

        const siswa = await Siswa.findByPk(id, {
            include: [
                { model: OrangTua, as: 'orangTua' },
                { model: Kelas, as: 'kelas' }
            ]
        });

        if (!siswa) {
            return res.status(404).json({
                success: false,
                message: 'Siswa tidak ditemukan'
            });
        }

        res.status(200).json({
            success: true,
            data: siswa
        });
    } catch (error) {
        console.error('Error saat mengambil data siswa:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data siswa'
        });
    }
};

/**
 * Memperbarui data siswa
 */
exports.updateSiswa = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nama,
            tgl_lahir,
            jk,
            alamat,
            kelas_id,
            ortu_id
        } = req.body;

        const siswa = await Siswa.findByPk(id);

        if (!siswa) {
            return res.status(404).json({
                success: false,
                message: 'Siswa tidak ditemukan'
            });
        }

        // Validasi jenis kelamin jika diubah
        let updatedJk = siswa.jk;
        if (jk !== undefined && jk !== siswa.jk) {
            if (!['L', 'P'].includes(jk)) {
                return res.status(400).json({
                    success: false,
                    message: 'Jenis kelamin harus L (Laki-laki) atau P (Perempuan)'
                });
            }
            updatedJk = jk;
        }

        // Validasi format tanggal jika diubah
        let updatedTglLahir = siswa.tgl_lahir;
        if (tgl_lahir && tgl_lahir !== siswa.tgl_lahir) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(tgl_lahir)) {
                return res.status(400).json({
                    success: false,
                    message: 'Format tanggal lahir harus YYYY-MM-DD'
                });
            }
            updatedTglLahir = tgl_lahir;
        }

        // Validasi kelas_id jika diubah
        let updatedKelasId = siswa.kelas_id;
        if (kelas_id && kelas_id !== siswa.kelas_id) {
            const kelas = await Kelas.findByPk(kelas_id);
            if (!kelas) {
                return res.status(400).json({
                    success: false,
                    message: 'kelas_id tidak ditemukan'
                });
            }
            updatedKelasId = kelas_id;
        }

        // Validasi ortu_id jika diubah
        let updatedOrtuId = siswa.ortu_id;
        if (ortu_id && ortu_id !== siswa.ortu_id) {
            const ortu = await OrangTua.findByPk(ortu_id);
            if (!ortu) {
                return res.status(400).json({
                    success: false,
                    message: 'ortu_id tidak ditemukan'
                });
            }
            updatedOrtuId = ortu_id;
        }

        // Update data
        await siswa.update({
            nama: nama || siswa.nama,
            tgl_lahir: updatedTglLahir,
            jk: updatedJk,
            alamat: alamat || siswa.alamat,
            kelas_id: updatedKelasId,
            ortu_id: updatedOrtuId
        });

        // Ambil data terbaru dengan relasi
        const updatedSiswa = await Siswa.findByPk(id, {
            include: [
                { model: OrangTua, as: 'orangTua' },
                { model: Kelas, as: 'kelas' }
            ]
        });

        res.status(200).json({
            success: true,
            message: 'Siswa berhasil diperbarui',
            data: updatedSiswa
        });
    } catch (error) {
        console.error('Error saat memperbarui siswa:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui siswa'
        });
    }
};

/**
 * Menghapus siswa berdasarkan ID
 */
exports.deleteSiswa = async (req, res) => {
    try {
        const { id } = req.params;

        const siswa = await Siswa.findByPk(id);

        if (!siswa) {
            return res.status(404).json({
                success: false,
                message: 'Siswa tidak ditemukan'
            });
        }

        await siswa.destroy();

        res.status(200).json({
            success: true,
            message: 'Siswa berhasil dihapus'
        });
    } catch (error) {
        console.error('Error saat menghapus siswa:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus siswa'
        });
    }
};