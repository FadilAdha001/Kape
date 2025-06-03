// models/KaryawanModel.js
module.exports = (sequelize, DataTypes) => {
    const Karyawan = sequelize.define('tb_karyawan', {
        karyawan_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nama: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        posisi: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        tgl_lahir: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        jk: {
            type: DataTypes.ENUM('L', 'P'),
            allowNull: false
        },
        alamat: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        no_hp: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        gaji: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    }, {
        freezeTableName: true,
        timestamps: true
    });

    return Karyawan;
};