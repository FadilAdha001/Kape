// models/ErdModel.js
const db = require('../config/database.js');

// Import semua model
const Siswa = require('./SiswaModel')(db, db.Sequelize.DataTypes);
const OrangTua = require('./OrangTuaModel')(db, db.Sequelize.DataTypes);
const Kelas = require('./KelasModel')(db, db.Sequelize.DataTypes);
const Karyawan = require('./KaryawanModel')(db, db.Sequelize.DataTypes);
const User = require('./UserModel')(db, db.Sequelize.DataTypes);
const Tagihan = require('./TagihanModel')(db, db.Sequelize.DataTypes);
const Pemasukan = require('./PemasukanModel')(db, db.Sequelize.DataTypes);
const Pengeluaran = require('./PengeluaranModel')(db, db.Sequelize.DataTypes);
const MasterBiaya = require('./MasterBiayaModel')(db, db.Sequelize.DataTypes);

// Relasi
Siswa.belongsTo(OrangTua, {
    foreignKey: 'ortu_id',
    as: 'orangTua'
});

OrangTua.hasMany(Siswa, {
    foreignKey: 'ortu_id',
    as: 'siswa'
});

Siswa.belongsTo(Kelas, {
    foreignKey: 'kelas_id',
    as: 'kelas'
});

Kelas.belongsTo(Karyawan, {
    foreignKey: 'karyawan_id',
    as: 'karyawan'
});

Tagihan.belongsTo(Siswa, {
    foreignKey: 'siswa_id',
    as: 'siswa'
});

Tagihan.belongsTo(MasterBiaya, {
    foreignKey: 'biaya_id',
    as: 'masterBiaya'
});

Pemasukan.belongsTo(Tagihan, {
    foreignKey: 'tagihan_id',
    as: 'tagihan'
});

Pengeluaran.belongsTo(MasterBiaya, {
  foreignKey: 'biaya_id',
  as: 'masterBiaya'
});

// Relasi Pengeluaran → User
Pengeluaran.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

MasterBiaya.hasMany(Pengeluaran, {
    foreignKey:'biaya_id',
})

User.belongsTo(Siswa, {
    foreignKey: 'siswa_id',
    as: 'siswa',
    onDelete: 'CASCADE'
});

User.belongsTo(OrangTua, {
    foreignKey: 'ortu_id',
    as: 'ortu',
    onDelete: 'CASCADE'
});

User.belongsTo(Karyawan, {
    foreignKey: 'karyawan_id',
    as: 'karyawan',
    onDelete: 'CASCADE'
});

MasterBiaya.belongsTo(Karyawan, {
    foreignKey: 'karyawan_id',
    as: 'karyawan',
});

Karyawan.hasMany(MasterBiaya, {
    foreignKey: 'karyawan_id',
    as: 'masterBiaya'
});

module.exports = {
    Siswa,
    OrangTua,
    Kelas,
    Karyawan,
    User,
    Tagihan,
    Pemasukan,
    Pengeluaran,
    MasterBiaya
};