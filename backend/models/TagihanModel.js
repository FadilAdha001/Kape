// models/TagihanModel.js
module.exports = (sequelize, DataTypes) => {
    const Tagihan = sequelize.define('tb_tagihan', {
        tagihan_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        siswa_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        biaya_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        jumlah: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        tgl_jatuh_tempo: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('lunas', 'belum_lunas'),
            allowNull: false
        }
    }, {
        freezeTableName: true,
        timestamps: true
    });

    return Tagihan;
};