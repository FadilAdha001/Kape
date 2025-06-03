// models/UserModel.js
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('tb_user', {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('admin', 'kepsek', 'guru', 'orang_tua', 'siswa'),
            allowNull: false
        },
        siswa_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        ortu_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        karyawan_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        freezeTableName: true,
        timestamps: true
    });

    return User;
};