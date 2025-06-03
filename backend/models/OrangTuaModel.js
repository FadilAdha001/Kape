// models/OrangTuaModel.js
module.exports = (sequelize, DataTypes) => {
    const OrangTua = sequelize.define('tb_ortu', {
        ortu_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nama_ayah: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        nama_ibu: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        no_hp: {
            type: DataTypes.STRING(20),
            allowNull: false
        }
    }, {
        freezeTableName: true,
        timestamps: true
    });

    return OrangTua;
};