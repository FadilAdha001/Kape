// controllers/KelasController.js
const { Kelas, Karyawan } = require('../models/ErdModel');

/**
 * Membuat kelas baru
 */
exports.createKelas = async (req, res) => {
    try {
        const { nama_kelas, kapasitas, deskripsi, tahun_ajaran, karyawan_id } = req.body;

        // Validasi input wajib
        if (!nama_kelas || !kapasitas || !tahun_ajaran || !karyawan_id) {
            return res.status(400).json({
                success: false,
                message: 'nama_kelas, kapasitas, tahun_ajaran, dan karyawan_id wajib diisi'
            });
        }

        // Validasi kapasitas
        if (typeof kapasitas !== 'number' || kapasitas <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Kapasitas harus berupa angka positif'
            });
        }

        // Validasi tahun ajaran (format: YYYY/YYYY)
        const tahunAjaranRegex = /^\d{4}\/\d{4}$/;
        if (!tahunAjaranRegex.test(tahun_ajaran)) {
            return res.status(400).json({
                success: false,
                message: 'Format tahun_ajaran harus seperti "2023/2024"'
            });
        }

        // Cek apakah karyawan_id valid
        const karyawan = await Karyawan.findByPk(karyawan_id);
        if (!karyawan) {
            return res.status(400).json({
                success: false,
                message: 'karyawan_id tidak ditemukan'
            });
        }

        // Buat kelas baru
        const newKelas = await Kelas.create({
            nama_kelas,
            kapasitas,
            deskripsi: deskripsi || null,
            tahun_ajaran,
            karyawan_id
        });

        // Ambil kelas dengan relasi karyawan
        const createdKelas = await Kelas.findByPk(newKelas.kelas_id, {
            include: [{ model: Karyawan, as: 'karyawan' }]
        });

        res.status(201).json({
            success: true,
            message: 'Kelas berhasil dibuat',
            data: createdKelas
        });
    } catch (error) {
        console.error('Error saat membuat kelas:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal membuat kelas'
        });
    }
};

/**
 * Mengambil semua kelas
 */
exports.getAllKelas = async (req, res) => {
    try {
        const kelasList = await Kelas.findAll({
            include: [{ model: Karyawan, as: 'karyawan' }]
        });

        res.status(200).json({
            success: true,
            data: kelasList
        });
    } catch (error) {
        console.error('Error saat mengambil daftar kelas:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil daftar kelas'
        });
    }
};

/**
 * Mengambil kelas berdasarkan ID
 */
exports.getKelasById = async (req, res) => {
    try {
        const { id } = req.params;

        const kelas = await Kelas.findByPk(id, {
            include: [{ model: Karyawan, as: 'karyawan' }]
        });

        if (!kelas) {
            return res.status(404).json({
                success: false,
                message: 'Kelas tidak ditemukan'
            });
        }

        res.status(200).json({
            success: true,
            data: kelas
        });
    } catch (error) {
        console.error('Error saat mengambil data kelas:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data kelas'
        });
    }
};

/**
 * Memperbarui data kelas
 */
exports.updateKelas = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_kelas, kapasitas, deskripsi, tahun_ajaran, karyawan_id } = req.body;

        const kelas = await Kelas.findByPk(id);

        if (!kelas) {
            return res.status(404).json({
                success: false,
                message: 'Kelas tidak ditemukan'
            });
        }

        // Validasi kapasitas jika diubah
        let updatedKapasitas = kelas.kapasitas;
        if (kapasitas !== undefined) {
            if (typeof kapasitas !== 'number' || kapasitas <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Kapasitas harus berupa angka positif'
                });
            }
            updatedKapasitas = kapasitas;
        }

        // Validasi tahun_ajaran jika diubah
        let updatedTahunAjaran = kelas.tahun_ajaran;
        if (tahun_ajaran !== undefined) {
            const tahunAjaranRegex = /^\d{4}\/\d{4}$/;
            if (!tahunAjaranRegex.test(tahun_ajaran)) {
                return res.status(400).json({
                    success: false,
                    message: 'Format tahun_ajaran harus seperti "2023/2024"'
                });
            }
            updatedTahunAjaran = tahun_ajaran;
        }

        // Validasi karyawan_id jika diubah
        let updatedKaryawanId = kelas.karyawan_id;
        if (karyawan_id !== undefined) {
            const karyawan = await Karyawan.findByPk(karyawan_id);
            if (!karyawan) {
                return res.status(400).json({
                    success: false,
                    message: 'karyawan_id tidak ditemukan'
                });
            }
            updatedKaryawanId = karyawan_id;
        }

        // Update data
        await kelas.update({
            nama_kelas: nama_kelas || kelas.nama_kelas,
            kapasitas: updatedKapasitas,
            deskripsi: deskripsi !== undefined ? deskripsi : kelas.deskripsi,
            tahun_ajaran: updatedTahunAjaran,
            karyawan_id: updatedKaryawanId
        });

        // Ambil data terbaru dengan relasi
        const updatedKelas = await Kelas.findByPk(id, {
            include: [{ model: Karyawan, as: 'karyawan' }]
        });

        res.status(200).json({
            success: true,
            message: 'Kelas berhasil diperbarui',
            data: updatedKelas
        });
    } catch (error) {
        console.error('Error saat memperbarui kelas:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui kelas'
        });
    }
};

/**
 * Menghapus kelas berdasarkan ID
 */
exports.deleteKelas = async (req, res) => {
    try {
        const { id } = req.params;

        const kelas = await Kelas.findByPk(id);

        if (!kelas) {
            return res.status(404).json({
                success: false,
                message: 'Kelas tidak ditemukan'
            });
        }

        await kelas.destroy();

        res.status(200).json({
            success: true,
            message: 'Kelas berhasil dihapus'
        });
    } catch (error) {
        console.error('Error saat menghapus kelas:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus kelas'
        });
    }
};