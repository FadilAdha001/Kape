// models/MasterBiayaModel.js
module.exports = (sequelize, DataTypes) => {
    const MasterBiaya = sequelize.define('tb_master_biaya', {
        biaya_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nama_biaya: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        jumlah: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        jenis_biaya: {
            type: DataTypes.ENUM('pengeluaran', 'pemasukan'),
            allowNull: false
        },
        deskripsi: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        karyawan_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'tb_karyawan', key: 'karyawan_id' }
        }
    }, {
        freezeTableName: true,
        timestamps: true
    });

    return MasterBiaya;
};