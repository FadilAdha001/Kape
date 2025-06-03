// controllers/OrangTuaController.js
const { OrangTua,Siswa} = require('../models/ErdModel');

/**
 * Membuat data orang tua baru
 */
exports.createOrangTua = async (req, res) => {
    try {
        const {
            nama_ayah,
            nama_ibu,
            no_hp,
        } = req.body;

        // Validasi semua field wajib
        if (!nama_ayah || !nama_ibu || !no_hp) {
            return res.status(400).json({
                success: false,
                message: 'Semua field wajib diisi'
            });
        }

        // Validasi format nomor telepon
        if (!/^\+?[0-9]{10,15}$/.test(no_hp)) {
            return res.status(400).json({
                success: false,
                message: 'Nomor telepon tidak valid'
            });
        }

        // Buat data orang tua baru
        const newOrangTua = await OrangTua.create({
            nama_ayah,
            nama_ibu,
            no_hp,
        });

        res.status(201).json({
            success: true,
            message: 'Data orang tua berhasil dibuat',
            data: newOrangTua
        });
    } catch (error) {
        console.error('Error saat membuat data orang tua:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal membuat data orang tua'
        });
    }
};

/**
 * Mengambil semua data orang tua
 */
exports.getAllOrangTua = async (req, res) => {
    try {
        const orangTuaList = await OrangTua.findAll();

        res.status(200).json({
            success: true,
            data: orangTuaList
        });
    } catch (error) {
        console.error('Error saat mengambil daftar orang tua:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil daftar orang tua'
        });
    }
};

/**
 * Mengambil data orang tua berdasarkan ID
 */
exports.getOrangTuaById = async (req, res) => {
  try {
    const { id } = req.params;

    // Cari OrangTua beserta relasi "siswa"
    const orangTua = await OrangTua.findByPk(id, {
      include: [
        {
          model: Siswa,
          as: 'siswa',
          attributes: ['siswa_id'] // ambil kolom yang benar dari tabel Siswa
        }
      ]
    });

    if (!orangTua) {
      return res.status(404).json({
        success: false,
        message: 'Data orang tua tidak ditemukan'
      });
    }

    // Jika ada array siswa (karena hasMany) kita ambil siswa_id pertama
    let siswaId = null;
    if (Array.isArray(orangTua.siswa) && orangTua.siswa.length > 0) {
      siswaId = orangTua.siswa[0].siswa_id;
    }

    return res.status(200).json({
      success: true,
      data: {
        orangTua,
        siswaId
      }
    });
  } catch (error) {
    console.error('Error saat mengambil data orang tua:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data orang tua'
    });
  }
};

/**
 * Memperbarui data orang tua
 */
exports.updateOrangTua = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nama_ayah,
            nama_ibu,
            no_hp,
        } = req.body;

        const orangTua = await OrangTua.findByPk(id);

        if (!orangTua) {
            return res.status(404).json({
                success: false,
                message: 'Data orang tua tidak ditemukan'
            });
        }

        // Validasi format nomor telepon jika diubah
        if (no_hp && !/^\+?[0-9]{10,15}$/.test(no_hp)) {
            return res.status(400).json({
                success: false,
                message: 'Nomor telepon tidak valid'
            });
        }

        // Update data
        await orangTua.update({
            nama_ayah: nama_ayah || orangTua.nama_ayah,
            nama_ibu: nama_ibu || orangTua.nama_ibu,
            no_hp: no_hp || orangTua.no_hp,
        });

        const updatedOrangTua = await OrangTua.findByPk(id);

        res.status(200).json({
            success: true,
            message: 'Data orang tua berhasil diperbarui',
            data: updatedOrangTua
        });
    } catch (error) {
        console.error('Error saat memperbarui data orang tua:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui data orang tua'
        });
    }
};

/**
 * Menghapus data orang tua berdasarkan ID
 */
exports.deleteOrangTua = async (req, res) => {
    try {
        const { id } = req.params;

        const orangTua = await OrangTua.findByPk(id);

        if (!orangTua) {
            return res.status(404).json({
                success: false,
                message: 'Data orang tua tidak ditemukan'
            });
        }

        await orangTua.destroy();

        res.status(200).json({
            success: true,
            message: 'Data orang tua berhasil dihapus'
        });
    } catch (error) {
        console.error('Error saat menghapus data orang tua:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus data orang tua'
        });
    }
};