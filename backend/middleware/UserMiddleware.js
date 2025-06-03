// middleware/UserMiddleware.js
const jwt = require('jsonwebtoken');
const { User, Siswa, OrangTua, Karyawan } = require('../models/ErdModel');

exports.verifyUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Format token tidak valid'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Perbaikan: Gunakan decoded.user_id sesuai payload token
        const user = await User.findByPk(decoded.user_id, {
            attributes: { exclude: ['password'] },
            include: [
                { model: Siswa, as: 'siswa' },
                { model: OrangTua, as: 'ortu' },
                { model: Karyawan, as: 'karyawan' }
            ]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Akun tidak terdaftar'
            });
        }

        req.user = user.get({ plain: true });
        next();
    } catch (error) {
        console.error('Middleware error:', error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Sesi telah kadaluarsa'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token tidak valid'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Kesalahan server'
        });
    }
};

exports.adminOnly = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Akses terbatas untuk admin'
        });
    }
    next();
};