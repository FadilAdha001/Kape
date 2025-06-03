// controllers/KaryawanController.js
const { Karyawan } = require('../models/ErdModel');

/**
 * Membuat karyawan baru
 */
exports.createKaryawan = async (req, res) => {
    try {
        const { nama, posisi, tgl_lahir, jk, alamat, no_hp, gaji } = req.body;

        // Validasi input wajib
        if (!nama || !posisi || !tgl_lahir || !jk || !alamat || !no_hp || !gaji) {
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

        // Validasi nomor telepon
        if (!/^\+?[0-9]{10,15}$/.test(no_hp)) {
            return res.status(400).json({
                success: false,
                message: 'Nomor telepon tidak valid'
            });
        }

        // Validasi gaji
        const gajiFloat = parseFloat(gaji);
        if (isNaN(gajiFloat) || gajiFloat <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Gaji harus berupa angka positif'
            });
        }

        // Buat karyawan baru
        const newKaryawan = await Karyawan.create({
            nama,
            posisi,
            tgl_lahir,
            jk,
            alamat,
            no_hp,
            gaji: gajiFloat
        });

        res.status(201).json({
            success: true,
            message: 'Karyawan berhasil dibuat',
            data: newKaryawan
        });
    } catch (error) {
        console.error('Error saat membuat karyawan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal membuat karyawan'
        });
    }
};

exports.countKaryawan = async (req, res) => {
    try {
        const total = await Karyawan.count();
        res.status(200).json({ success: true, total });
    } catch (error) {
        console.error('Error count karyawan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghitung total karyawan'
        });
    }
};

/**
 * Mengambil semua karyawan
 */
exports.getAllKaryawan = async (req, res) => {
    try {
        const karyawanList = await Karyawan.findAll();

        res.status(200).json({
            success: true,
            data: karyawanList
        });
    } catch (error) {
        console.error('Error saat mengambil daftar karyawan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil daftar karyawan'
        });
    }
};

/**
 * Mengambil karyawan berdasarkan ID
 */
exports.getKaryawanById = async (req, res) => {
    try {
        const { id } = req.params;

        const karyawan = await Karyawan.findByPk(id);

        if (!karyawan) {
            return res.status(404).json({
                success: false,
                message: 'Karyawan tidak ditemukan'
            });
        }

        res.status(200).json({
            success: true,
            data: karyawan
        });
    } catch (error) {
        console.error('Error saat mengambil data karyawan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data karyawan'
        });
    }
};

/**
 * Memperbarui data karyawan
 */
exports.updateKaryawan = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, posisi, tgl_lahir, jk, alamat, no_hp, gaji } = req.body;

        const karyawan = await Karyawan.findByPk(id);

        if (!karyawan) {
            return res.status(404).json({
                success: false,
                message: 'Karyawan tidak ditemukan'
            });
        }

        // Validasi jenis kelamin
        if (jk && !['L', 'P'].includes(jk)) {
            return res.status(400).json({
                success: false,
                message: 'Jenis kelamin harus L (Laki-laki) atau P (Perempuan)'
            });
        }

        // Validasi format tanggal
        if (tgl_lahir) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(tgl_lahir)) {
                return res.status(400).json({
                    success: false,
                    message: 'Format tanggal lahir harus YYYY-MM-DD'
                });
            }
        }

        // Validasi nomor telepon
        if (no_hp && !/^\+?[0-9]{10,15}$/.test(no_hp)) {
            return res.status(400).json({
                success: false,
                message: 'Nomor telepon tidak valid'
            });
        }

        // Validasi gaji
        let gajiFloat = karyawan.gaji;
        if (gaji !== undefined) {
            gajiFloat = parseFloat(gaji);
            if (isNaN(gajiFloat) || gajiFloat <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Gaji harus berupa angka positif'
                });
            }
        }

        // Update data
        await karyawan.update({
            nama: nama || karyawan.nama,
            posisi: posisi || karyawan.posisi,
            tgl_lahir: tgl_lahir || karyawan.tgl_lahir,
            jk: jk || karyawan.jk,
            alamat: alamat || karyawan.alamat,
            no_hp: no_hp || karyawan.no_hp,
            gaji: gajiFloat
        });

        const updatedKaryawan = await Karyawan.findByPk(id);

        res.status(200).json({
            success: true,
            message: 'Karyawan berhasil diperbarui',
            data: updatedKaryawan
        });
    } catch (error) {
        console.error('Error saat memperbarui karyawan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui karyawan'
        });
    }
};

/**
 * Menghapus karyawan berdasarkan ID
 */
exports.deleteKaryawan = async (req, res) => {
    try {
        const { id } = req.params;

        const karyawan = await Karyawan.findByPk(id);

        if (!karyawan) {
            return res.status(404).json({
                success: false,
                message: 'Karyawan tidak ditemukan'
            });
        }

        await karyawan.destroy();

        res.status(200).json({
            success: true,
            message: 'Karyawan berhasil dihapus'
        });
    } catch (error) {
        console.error('Error saat menghapus karyawan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus karyawan'
        });
    }
};