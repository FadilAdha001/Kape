// controllers/PemasukanController.js
const { Pemasukan, Tagihan } = require('../models/ErdModel');

/**
 * Membuat pemasukan baru
 */
exports.createPemasukan = async (req, res) => {
    try {
        const { tagihan_id, jumlah_bayar, tgl_bayar, metode_pembayaran } = req.body;

        // Validasi input wajib
        if (!tagihan_id || !jumlah_bayar || !tgl_bayar || !metode_pembayaran) {
            return res.status(400).json({
                success: false,
                message: 'tagihan_id, jumlah_bayar, tgl_bayar, dan metode_pembayaran wajib diisi'
            });
        }

        // Validasi format tanggal
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(tgl_bayar)) {
            return res.status(400).json({
                success: false,
                message: 'Format tanggal harus YYYY-MM-DD'
            });
        }

        // Validasi jumlah_bayar positif
        const jumlahBayarFloat = parseFloat(jumlah_bayar);
        if (isNaN(jumlahBayarFloat) || jumlahBayarFloat <= 0) {
            return res.status(400).json({
                success: false,
                message: 'jumlah_bayar harus berupa angka positif'
            });
        }

        // Cek apakah tagihan_id valid
        const tagihan = await Tagihan.findByPk(tagihan_id);
        if (!tagihan) {
            return res.status(400).json({
                success: false,
                message: 'tagihan_id tidak ditemukan'
            });
        }

        // Buat pemasukan baru
        const newPemasukan = await Pemasukan.create({
            tagihan_id,
            jumlah_bayar: jumlahBayarFloat,
            tgl_bayar,
            metode_pembayaran
        });

        // Ambil data dengan relasi tagihan
        const createdPemasukan = await Pemasukan.findByPk(newPemasukan.pemasukan_id, {
            include: [{ model: Tagihan, as: 'tagihan' }]
        });

        res.status(201).json({
            success: true,
            message: 'Pemasukan berhasil dibuat',
            data: createdPemasukan
        });
    } catch (error) {
        console.error('Error saat membuat pemasukan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal membuat pemasukan'
        });
    }
};

exports.countPemasukan = async (req, res) => {
    try {
        const total = await Pemasukan.sum('jumlah_bayar');
        res.status(200).json({ success: true, total: total || 0 });
    } catch (error) {
        console.error('Error count pemasukan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghitung total pemasukan'
        });
    }
};

/**
 * Mengambil semua pemasukan
 */
exports.getAllPemasukan = async (req, res) => {
    try {
        const pemasukanList = await Pemasukan.findAll({
            include: [{ model: Tagihan, as: 'tagihan' }]
        });

        res.status(200).json({
            success: true,
            data: pemasukanList
        });
    } catch (error) {
        console.error('Error saat mengambil daftar pemasukan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil daftar pemasukan'
        });
    }
};

/**
 * Mengambil pemasukan berdasarkan ID
 */
exports.getPemasukanById = async (req, res) => {
    try {
        const { id } = req.params;

        const pemasukan = await Pemasukan.findByPk(id, {
            include: [{ model: Tagihan, as: 'tagihan' }]
        });

        if (!pemasukan) {
            return res.status(404).json({
                success: false,
                message: 'Pemasukan tidak ditemukan'
            });
        }

        res.status(200).json({
            success: true,
            data: pemasukan
        });
    } catch (error) {
        console.error('Error saat mengambil data pemasukan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data pemasukan'
        });
    }
};

/**
 * Memperbarui data pemasukan
 */
exports.updatePemasukan = async (req, res) => {
    try {
        const { id } = req.params;
        const { tagihan_id, jumlah_bayar, tgl_bayar, metode_pembayaran } = req.body;

        const pemasukan = await Pemasukan.findByPk(id);

        if (!pemasukan) {
            return res.status(404).json({
                success: false,
                message: 'Pemasukan tidak ditemukan'
            });
        }

        // Validasi format tanggal jika diubah
        let updatedTglBayar = pemasukan.tgl_bayar;
        if (tgl_bayar) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(tgl_bayar)) {
                return res.status(400).json({
                    success: false,
                    message: 'Format tanggal harus YYYY-MM-DD'
                });
            }
            updatedTglBayar = tgl_bayar;
        }

        // Validasi jumlah_bayar jika diubah
        let updatedJumlahBayar = pemasukan.jumlah_bayar;
        if (jumlah_bayar !== undefined) {
            const jumlahBayarFloat = parseFloat(jumlah_bayar);
            if (isNaN(jumlahBayarFloat) || jumlahBayarFloat <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'jumlah_bayar harus berupa angka positif'
                });
            }
            updatedJumlahBayar = jumlahBayarFloat;
        }

        // Validasi tagihan_id jika diubah
        let updatedTagihanId = pemasukan.tagihan_id;
        if (tagihan_id !== undefined && tagihan_id !== pemasukan.tagihan_id) {
            const tagihan = await Tagihan.findByPk(tagihan_id);
            if (!tagihan) {
                return res.status(400).json({
                    success: false,
                    message: 'tagihan_id tidak ditemukan'
                });
            }
            updatedTagihanId = tagihan_id;
        }

        // Update data
        await pemasukan.update({
            tagihan_id: updatedTagihanId,
            jumlah_bayar: updatedJumlahBayar,
            tgl_bayar: updatedTglBayar,
            metode_pembayaran: metode_pembayaran || pemasukan.metode_pembayaran
        });

        // Ambil data terbaru dengan relasi
        const updatedPemasukan = await Pemasukan.findByPk(id, {
            include: [{ model: Tagihan, as: 'tagihan' }]
        });

        res.status(200).json({
            success: true,
            message: 'Pemasukan berhasil diperbarui',
            data: updatedPemasukan
        });
    } catch (error) {
        console.error('Error saat memperbarui pemasukan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui pemasukan'
        });
    }
};

/**
 * Menghapus pemasukan berdasarkan ID
 */
exports.deletePemasukan = async (req, res) => {
    try {
        const { id } = req.params;

        const pemasukan = await Pemasukan.findByPk(id);

        if (!pemasukan) {
            return res.status(404).json({
                success: false,
                message: 'Pemasukan tidak ditemukan'
            });
        }

        await pemasukan.destroy();

        res.status(200).json({
            success: true,
            message: 'Pemasukan berhasil dihapus'
        });
    } catch (error) {
        console.error('Error saat menghapus pemasukan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus pemasukan'
        });
    }
};