// models/KelasModel.js
module.exports = (sequelize, DataTypes) => {
    const Kelas = sequelize.define('tb_kelas', {
        kelas_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nama_kelas: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        kapasitas: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        deskripsi: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        tahun_ajaran: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        karyawan_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        freezeTableName: true,
        timestamps: true
    });

    return Kelas;
};