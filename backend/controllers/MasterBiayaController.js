// controllers/MasterBiayaController.js
const { Op } = require('sequelize');
const { MasterBiaya, Karyawan } = require('../models/ErdModel');

/**
 * Membuat master biaya baru
 */
exports.createMasterBiaya = async (req, res) => {
    try {
        const { nama_biaya, jumlah, jenis_biaya, deskripsi } = req.body;

        // Validasi input wajib
        if (!nama_biaya || jumlah === undefined || !jenis_biaya) {
            return res.status(400).json({
                success: false,
                message: 'nama_biaya, jumlah, dan jenis_biaya wajib diisi'
            });
        }

        // Validasi jenis_biaya
        const validJenisBiaya = ['pengeluaran', 'pemasukan'];
        if (!validJenisBiaya.includes(jenis_biaya)) {
            return res.status(400).json({
                success: false,
                message: `jenis_biaya harus salah satu dari: ${validJenisBiaya.join(', ')}`
            });
        }

        // Validasi jumlah positif
        const jumlahFloat = parseFloat(jumlah);
        if (isNaN(jumlahFloat) || jumlahFloat <= 0) {
            return res.status(400).json({
                success: false,
                message: 'jumlah harus berupa angka positif'
            });
        }

        // Buat master biaya baru
        const newMasterBiaya = await MasterBiaya.create({
            nama_biaya,
            jumlah: jumlahFloat,
            jenis_biaya,
            deskripsi: deskripsi || null
        });

        res.status(201).json({
            success: true,
            message: 'Master biaya berhasil dibuat',
            data: newMasterBiaya
        });
    } catch (error) {
        console.error('Error saat membuat master biaya:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal membuat master biaya'
        });
    }
};

/**
 * Mengambil semua master biaya
 */
exports.getAllMasterBiaya = async (req, res) => {
    try {
        const { nama_biaya } = req.query;
        const whereClause = {};

        if (nama_biaya) {
            whereClause.nama_biaya = {
                [Op.like]: `%${nama_biaya}%`
            };
        }

        const biayaList = await MasterBiaya.findAll({
            include: [{
                model: Karyawan, // Diubah dari Karyawan ke User
                as: 'karyawan', // Sesuaikan dengan alias yang benar
                attributes: ['karyawan_id', 'nama']
            }],
            where: whereClause
        });

        res.status(200).json({
            success: true,
            data: biayaList
        });
    } catch (error) {
        console.error('Error saat mengambil daftar master biaya:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil daftar master biaya'
        });
    }
};

/**
 * Mengambil master biaya berdasarkan ID
 */
exports.getMasterBiayaById = async (req, res) => {
    try {
        const { id } = req.params;

        const biaya = await MasterBiaya.findByPk(id);

        if (!biaya) {
            return res.status(404).json({
                success: false,
                message: 'Master biaya tidak ditemukan'
            });
        }

        res.status(200).json({
            success: true,
            data: biaya
        });
    } catch (error) {
        console.error('Error saat mengambil data master biaya:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data master biaya'
        });
    }
};

/**
 * Memperbarui data master biaya
 */
exports.updateMasterBiaya = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_biaya, jumlah, jenis_biaya, deskripsi } = req.body;

        const biaya = await MasterBiaya.findByPk(id);

        if (!biaya) {
            return res.status(404).json({
                success: false,
                message: 'Master biaya tidak ditemukan'
            });
        }

        // Validasi jenis_biaya jika diubah
        let updatedJenisBiaya = biaya.jenis_biaya;
        if (jenis_biaya !== undefined) {
            const validJenisBiaya = ['pengeluaran', 'pemasukan'];
            if (!validJenisBiaya.includes(jenis_biaya)) {
                return res.status(400).json({
                    success: false,
                    message: `jenis_biaya harus salah satu dari: ${validJenisBiaya.join(', ')}`
                });
            }
            updatedJenisBiaya = jenis_biaya;
        }

        // Validasi jumlah jika diubah
        let updatedJumlah = biaya.jumlah;
        if (jumlah !== undefined) {
            const jumlahFloat = parseFloat(jumlah);
            if (isNaN(jumlahFloat) || jumlahFloat <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'jumlah harus berupa angka positif'
                });
            }
            updatedJumlah = jumlahFloat;
        }

        // Update data
        await biaya.update({
            nama_biaya: nama_biaya || biaya.nama_biaya,
            jumlah: updatedJumlah,
            jenis_biaya: updatedJenisBiaya,
            deskripsi: deskripsi !== undefined ? deskripsi : biaya.deskripsi
        });

        const updatedBiaya = await MasterBiaya.findByPk(id);

        res.status(200).json({
            success: true,
            message: 'Master biaya berhasil diperbarui',
            data: updatedBiaya
        });
    } catch (error) {
        console.error('Error saat memperbarui master biaya:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui master biaya'
        });
    }
};

/**
 * Menghapus master biaya berdasarkan ID
 */
exports.deleteMasterBiaya = async (req, res) => {
    try {
        const { id } = req.params;

        const biaya = await MasterBiaya.findByPk(id);

        if (!biaya) {
            return res.status(404).json({
                success: false,
                message: 'Master biaya tidak ditemukan'
            });
        }

        await biaya.destroy();

        res.status(200).json({
            success: true,
            message: 'Master biaya berhasil dihapus'
        });
    } catch (error) {
        console.error('Error saat menghapus master biaya:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus master biaya'
        });
    }
};