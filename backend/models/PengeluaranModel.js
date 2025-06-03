// models/PengeluaranModel.js
module.exports = (sequelize, DataTypes) => {
    const Pengeluaran = sequelize.define('tb_pengeluaran', {
        pengeluaran_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        deskripsi: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        jumlah: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        tgl_pengeluaran: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        bukti_pengeluaran: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        biaya_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        freezeTableName: true,
        timestamps: true
    });

    return Pengeluaran;
};