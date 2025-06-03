// controllers/TagihanController.js
const { Tagihan, Siswa, MasterBiaya, Pemasukan, Kelas } = require('../models/ErdModel');

/**
 * Membuat tagihan baru
 */
exports.createTagihan = async (req, res) => {
    try {
        const { siswa_id, biaya_id, jumlah, tgl_jatuh_tempo, status } = req.body;

        // Validasi input wajib
        if (!siswa_id || !biaya_id || jumlah === undefined || !tgl_jatuh_tempo || !status) {
            return res.status(400).json({
                success: false,
                message: 'Semua field wajib diisi'
            });
        }

        // Validasi format tanggal
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(tgl_jatuh_tempo)) {
            return res.status(400).json({
                success: false,
                message: 'Format tanggal harus YYYY-MM-DD'
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

        // Validasi status
        if (!['lunas', 'belum_lunas'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status harus "lunas" atau "belum_lunas"'
            });
        }

        // Cek apakah siswa_id valid
        const siswa = await Siswa.findByPk(siswa_id);
        if (!siswa) {
            return res.status(400).json({
                success: false,
                message: 'siswa_id tidak ditemukan'
            });
        }

        // Cek apakah biaya_id valid
        const biaya = await MasterBiaya.findByPk(biaya_id);
        if (!biaya) {
            return res.status(400).json({
                success: false,
                message: 'biaya_id tidak ditemukan'
            });
        }

        // Buat tagihan baru
        const newTagihan = await Tagihan.create({
            siswa_id,
            biaya_id,
            jumlah: jumlahFloat,
            tgl_jatuh_tempo,
            status
        });

        // Ambil data dengan relasi
        const createdTagihan = await Tagihan.findByPk(newTagihan.tagihan_id, {
            include: [
                { model: Siswa, as: 'siswa' },
                { model: MasterBiaya, as: 'masterBiaya' }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Tagihan berhasil dibuat',
            data: createdTagihan
        });
    } catch (error) {
        console.error('Error saat membuat tagihan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal membuat tagihan'
        });
    }
};

/**
 * Mengambil semua tagihan
 */
exports.getAllTagihan = async (req, res) => {
    try {
        const { siswa_id } = req.query;

        const whereClause = {};
        if (siswa_id) whereClause.siswa_id = siswa_id;

        const tagihanList = await Tagihan.findAll({
            where: whereClause,
            include: [
                {
                    model: Siswa, as: 'siswa',
                    include: [{
                        model: Kelas,
                        as: 'kelas',
                        attributes: ['nama_kelas']
                    }]
                },
                { model: MasterBiaya, as: 'masterBiaya' }
            ]
        });

        res.status(200).json({
            success: true,
            data: tagihanList
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil tagihan'
        });
    }
};

/**
 * Mengambil tagihan berdasarkan ID
 */
exports.getTagihanById = async (req, res) => {
    try {
        const { id } = req.params;

        const tagihan = await Tagihan.findByPk(id, {
            include: [
                {
                    model: Siswa, as: 'siswa',
                    include: [{  
                        model: Kelas,
                        as: 'kelas',
                        attributes: ['nama_kelas']
                    }]
                },
                { model: MasterBiaya, as: 'masterBiaya' }
            ]
        });

        if (!tagihan) {
            return res.status(404).json({
                success: false,
                message: 'Tagihan tidak ditemukan'
            });
        }

        res.status(200).json({
            success: true,
            data: tagihan
        });
    } catch (error) {
        console.error('Error saat mengambil data tagihan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data tagihan'
        });
    }
};

/**
 * Memperbarui data tagihan
 */
exports.updateTagihan = async (req, res) => {
    try {
        const { id } = req.params;
        const { siswa_id, biaya_id, jumlah, tgl_jatuh_tempo, status } = req.body;

        // Ambil tagihan lama untuk validasi & cek perubahan status
        const tagihan = await Tagihan.findByPk(id);
        if (!tagihan) {
            return res.status(404).json({
                success: false,
                message: 'Tagihan tidak ditemukan'
            });
        }
        const prevStatus = tagihan.status;

        // Validasi & siapkan nilai baru
        // 1. Tanggal jatuh tempo
        let updatedTglJatuhTempo = tagihan.tgl_jatuh_tempo;
        if (tgl_jatuh_tempo && tgl_jatuh_tempo !== tagihan.tgl_jatuh_tempo) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(tgl_jatuh_tempo)) {
                return res.status(400).json({
                    success: false,
                    message: 'Format tanggal harus YYYY-MM-DD'
                });
            }
            updatedTglJatuhTempo = tgl_jatuh_tempo;
        }

        // 2. Jumlah
        let updatedJumlah = tagihan.jumlah;
        if (jumlah !== undefined && jumlah !== tagihan.jumlah) {
            const jumlahFloat = parseFloat(jumlah);
            if (isNaN(jumlahFloat) || jumlahFloat <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'jumlah harus berupa angka positif'
                });
            }
            updatedJumlah = jumlahFloat;
        }

        // 3. Status
        let updatedStatus = tagihan.status;
        if (status && status !== tagihan.status) {
            if (!['lunas', 'belum_lunas'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Status harus "lunas" atau "belum_lunas"'
                });
            }
            updatedStatus = status;
        }

        // 4. Siswa
        let updatedSiswaId = tagihan.siswa_id;
        if (siswa_id && siswa_id !== tagihan.siswa_id) {
            const siswa = await Siswa.findByPk(siswa_id);
            if (!siswa) {
                return res.status(400).json({
                    success: false,
                    message: 'siswa_id tidak ditemukan'
                });
            }
            updatedSiswaId = siswa_id;
        }

        // 5. Biaya
        let updatedBiayaId = tagihan.biaya_id;
        if (biaya_id && biaya_id !== tagihan.biaya_id) {
            const biaya = await MasterBiaya.findByPk(biaya_id);
            if (!biaya) {
                return res.status(400).json({
                    success: false,
                    message: 'biaya_id tidak ditemukan'
                });
            }
            updatedBiayaId = biaya_id;
        }

        // Lakukan update
        await tagihan.update({
            siswa_id: updatedSiswaId,
            biaya_id: updatedBiayaId,
            jumlah: updatedJumlah,
            tgl_jatuh_tempo: updatedTglJatuhTempo,
            status: updatedStatus
        });

        // Ambil kembali tagihan yang sudah di-update, lengkap dengan relasi
        const updatedTagihan = await Tagihan.findByPk(id, {
            include: [
                { model: Siswa, as: 'siswa' },
                { model: MasterBiaya, as: 'masterBiaya' }
            ]
        });

        // Jika status berubah dari bukan 'lunas' → 'lunas', buat entri pemasukan
        if (prevStatus !== 'lunas' && updatedStatus === 'lunas') {
            try {
                // Ambil detail biaya untuk deskripsi
                const biaya = updatedTagihan.masterBiaya;
                await Pemasukan.create({
                    tagihan_id: id,
                    jumlah_bayar: updatedJumlah,
                    tgl_bayar: new Date().toISOString().split('T')[0],
                    metode_pembayaran: 'Transfer Bank',
                    keterangan: `(${biaya.jenis_biaya}) ${biaya.nama_biaya}`
                });
            } catch (err) {
                console.error('Gagal membuat pemasukan otomatis:', err);
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Tagihan berhasil diperbarui',
            data: updatedTagihan
        });
    } catch (error) {
        console.error('Error saat memperbarui tagihan:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal memperbarui tagihan'
        });
    }
};


/**
 * Menghapus tagihan berdasarkan ID
 */
exports.deleteTagihan = async (req, res) => {
    try {
        const { id } = req.params;

        const tagihan = await Tagihan.findByPk(id);

        if (!tagihan) {
            return res.status(404).json({
                success: false,
                message: 'Tagihan tidak ditemukan'
            });
        }

        await tagihan.destroy();

        res.status(200).json({
            success: true,
            message: 'Tagihan berhasil dihapus'
        });
    } catch (error) {
        console.error('Error saat menghapus tagihan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus tagihan'
        });
    }
};