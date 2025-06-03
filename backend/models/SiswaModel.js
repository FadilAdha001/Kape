// models/SiswaModel.js
module.exports = (sequelize, DataTypes) => {
    const Siswa = sequelize.define('tb_siswa', {
        siswa_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nama: {
            type: DataTypes.STRING(100),
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
        kelas_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        ortu_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        freezeTableName: true,
        timestamps: true
    });

    return Siswa;
};