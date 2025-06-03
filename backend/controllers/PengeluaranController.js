// controllers/PengeluaranController.js
const { Pengeluaran, User, Karyawan, MasterBiaya } = require('../models/ErdModel');
const fs = require('fs');
const path = require('path');

/**
 * Membuat pengeluaran baru dengan upload file
 */
exports.createPengeluaran = async (req, res) => {
    try {
        const { deskripsi, jumlah, tgl_pengeluaran, biaya_id, user_id: guruId } = req.body;

        // 1) Validasi wajib semua field
        if (!deskripsi || jumlah === undefined || !tgl_pengeluaran || !biaya_id || !guruId) {
            return res.status(400).json({
                success: false,
                message: 'deskripsi, jumlah, tgl_pengeluaran, biaya_id, dan user_id (guru) wajib diisi'
            });
        }

        // 2) Validasi format tanggal (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(tgl_pengeluaran)) {
            return res.status(400).json({
                success: false,
                message: 'Format tanggal harus YYYY-MM-DD'
            });
        }

        // 3) Validasi jumlah positif
        const jumlahFloat = parseFloat(jumlah);
        if (isNaN(jumlahFloat) || jumlahFloat <= 0) {
            return res.status(400).json({
                success: false,
                message: 'jumlah harus berupa angka positif'
            });
        }

        // 4) Validasi MasterBiaya.findByPk(biaya_id) dan ensure jenis_biaya === 'pengeluaran'
        const mb = await MasterBiaya.findByPk(biaya_id);
        if (!mb || mb.jenis_biaya !== 'pengeluaran') {
            return res.status(400).json({
                success: false,
                message: 'biaya_id tidak valid atau bukan tipe pengeluaran'
            });
        }

        // 5) Validasi user (guru) ada dan punya relasi karyawan
        const guruUser = await User.findByPk(guruId, {
            include: [{ model: Karyawan, as: 'karyawan', attributes: ['nama', 'posisi'] }]
        });
        if (!guruUser || !guruUser.karyawan) {
            return res.status(400).json({
                success: false,
                message: 'User (guru) tidak valid'
            });
        }

        // 6) Handle file upload (opsional)
        let buktiPath = null;
        if (req.file) {
            buktiPath = `/document/${req.file.filename}`;
        }

        // 7) Simpan record ke tabel Pengeluaran
        const newPengeluaran = await Pengeluaran.create({
            deskripsi,
            jumlah: jumlahFloat,
            tgl_pengeluaran,
            bukti_pengeluaran: buktiPath,
            biaya_id: parseInt(biaya_id, 10),
            user_id: parseInt(guruId, 10)
        });

        // 8) Ambil kembali yang baru dibuat beserta relasi lengkap untuk response
        const createdPengeluaran = await Pengeluaran.findByPk(newPengeluaran.pengeluaran_id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    include: [
                        { model: Karyawan, as: 'karyawan', attributes: ['nama', 'posisi'] }
                    ]
                },
                {
                    model: MasterBiaya,
                    as: 'masterBiaya',
                    attributes: ['nama_biaya', 'jenis_biaya']
                }
            ]
        });

        return res.status(201).json({
            success: true,
            message: 'Pengeluaran berhasil dibuat',
            data: createdPengeluaran
        });
    } catch (error) {
        console.error('Error create pengeluaran:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal membuat pengeluaran'
        });
    }
};

/**
 * Update pengeluaran dengan handle file upload
 */
exports.updatePengeluaran = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            deskripsi,
            jumlah,
            tgl_pengeluaran,
            biaya_id: newBiayaId,
            user_id: newGuruId
        } = req.body;

        // 1. Cari record lama
        const pengeluaran = await Pengeluaran.findByPk(id);
        if (!pengeluaran) {
            return res.status(404).json({
                success: false,
                message: 'Pengeluaran tidak ditemukan'
            });
        }

        // 2. Validasi biaya_id jika disertakan
        let updatedBiayaId = pengeluaran.biaya_id;
        if (newBiayaId) {
            const mb = await MasterBiaya.findByPk(newBiayaId);
            if (!mb || mb.jenis_biaya !== 'pengeluaran') {
                return res.status(400).json({
                    success: false,
                    message: 'biaya_id tidak valid atau bukan tipe pengeluaran'
                });
            }
            updatedBiayaId = parseInt(newBiayaId, 10);
        }

        // 3. Validasi guru (user_id) jika disertakan
        let updatedUserId = pengeluaran.user_id;
        if (newGuruId) {
            const guruUser = await User.findByPk(newGuruId, {
                include: [{ model: Karyawan, as: 'karyawan', attributes: ['nama', 'posisi'] }]
            });
            if (!guruUser || !guruUser.karyawan) {
                return res.status(400).json({
                    success: false,
                    message: 'User (guru) tidak valid'
                });
            }
            updatedUserId = parseInt(newGuruId, 10);
        }

        // 4. Validasi jumlah
        let updatedJumlah = pengeluaran.jumlah;
        if (jumlah !== undefined) {
            const jm = parseFloat(jumlah);
            if (isNaN(jm) || jm <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'jumlah harus berupa angka positif'
                });
            }
            updatedJumlah = jm;
        }

        // 5. Validasi tanggal
        let updatedTgl = pengeluaran.tgl_pengeluaran;
        if (tgl_pengeluaran) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(tgl_pengeluaran)) {
                return res.status(400).json({
                    success: false,
                    message: 'Format tanggal invalid'
                });
            }
            updatedTgl = tgl_pengeluaran;
        }

        // 6. Handle file baru
        let updatedBukti = pengeluaran.bukti_pengeluaran;
        if (req.file) {
            // Hapus file lama jika ada
            if (pengeluaran.bukti_pengeluaran) {
                const oldFilePath = path.join(__dirname, '../public', pengeluaran.bukti_pengeluaran);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            updatedBukti = `/document/${req.file.filename}`;
        }

        // 7. Update record
        await pengeluaran.update({
            deskripsi: deskripsi || pengeluaran.deskripsi,
            jumlah: updatedJumlah,
            tgl_pengeluaran: updatedTgl,
            bukti_pengeluaran: updatedBukti,
            biaya_id: updatedBiayaId,
            user_id: updatedUserId
        });

        // 8. Ambil ulang untuk response
        const updatedData = await Pengeluaran.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    include: [{ model: Karyawan, as: 'karyawan', attributes: ['nama', 'posisi'] }]
                },
                {
                    model: MasterBiaya,
                    as: 'masterBiaya',
                    attributes: ['nama_biaya', 'jenis_biaya']
                }
            ]
        });

        return res.status(200).json({
            success: true,
            message: 'Pengeluaran berhasil di‐update',
            data: updatedData
        });
    } catch (error) {
        console.error('Error update pengeluaran:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal update pengeluaran'
        });
    }
};

exports.countPengeluaran = async (req, res) => {
    try {
        const total = await Pengeluaran.sum('jumlah');
        res.status(200).json({ success: true, total: total || 0 });
    } catch (error) {
        console.error('Error count pengeluaran:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghitung total pengeluaran'
        });
    }
};

/**
 * Mengambil semua pengeluaran
 */
exports.getAllPengeluaran = async (req, res) => {
    try {
        const pengeluaranList = await Pengeluaran.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    include: [
                        {
                            model: Karyawan,
                            as: 'karyawan',
                            attributes: ['nama', 'posisi']
                        }
                    ]
                },
                {
                    model: MasterBiaya,
                    as: 'masterBiaya',
                    attributes: ['nama_biaya', 'jenis_biaya']
                }
            ]
        });

        res.status(200).json({
            success: true,
            data: pengeluaranList
        });
    } catch (error) {
        console.error('Error get pengeluaran:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data'
        });
    }
};

/**
 * Mengambil pengeluaran by ID
 */
exports.getPengeluaranById = async (req, res) => {
    try {
        const { id } = req.params;
        const pengeluaran = await Pengeluaran.findByPk(id, {
            include: [{ model: User, as: 'user' }]
        });

        if (!pengeluaran) {
            return res.status(404).json({
                success: false,
                message: 'Data tidak ditemukan'
            });
        }

        res.status(200).json({
            success: true,
            data: pengeluaran
        });
    } catch (error) {
        console.error('Error get detail:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail'
        });
    }
};

/**
 * Menghapus pengeluaran
 */
exports.deletePengeluaran = async (req, res) => {
    try {
        const { id } = req.params;
        const pengeluaran = await Pengeluaran.findByPk(id);

        if (!pengeluaran) {
            return res.status(404).json({
                success: false,
                message: 'Data tidak ditemukan'
            });
        }

        // Hapus file terkait jika ada
        if (pengeluaran.bukti_pengeluaran) {
            const filePath = path.join(__dirname, '../public', pengeluaran.bukti_pengeluaran);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await pengeluaran.destroy();

        res.status(200).json({
            success: true,
            message: 'Data terhapus'
        });
    } catch (error) {
        console.error('Error delete:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus'
        });
    }
};
