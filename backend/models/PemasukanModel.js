// models/PemasukanModel.js
module.exports = (sequelize, DataTypes) => {
    const Pemasukan = sequelize.define('tb_pemasukan', {
        pemasukan_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tagihan_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        jumlah_bayar: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        tgl_bayar: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        metode_pembayaran: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        keterangan: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        freezeTableName: true,
        timestamps: true
    });

    return Pemasukan;
};