const db = require('./config/database');
const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const AuthRoute = require('./routes/AuthRoute');
const KaryawanRoute = require('./routes/KaryawanRoute');
const KelasRoute = require('./routes/KelasRoute');
const MasterBiayaRoute = require('./routes/MasterBiayaRoute');
const OrangTuaRoute = require('./routes/OrangTuaRoute');
const PemasukanRoute = require('./routes/PemasukanRoute');
const PengeluaranRoute = require('./routes/PengeluaranRoute');
const SiswaRoute = require('./routes/SiswaRoute');
const TagihanRoute = require('./routes/TagihanRoute');
const UserRoute = require('./routes/UserRoute');

dotenv.config();

const app = express();
// (async () => {
//     try {
//         await db.sync({ alter: true });
//         console.log("Database synchronized");
//     } catch (error) {
//         console.error("Database sync failed:", error);
//     }
// })();

app.use(cors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());
app.use(express.json());
app.use('/document', express.static(path.join(__dirname, 'public/document')));

const router = express.Router();
app.use('/api', router);
router.use('/auth', AuthRoute);
router.use('/karyawan', KaryawanRoute);
router.use('/kelas', KelasRoute);
router.use('/masterbiaya', MasterBiayaRoute);
router.use('/orangtua', OrangTuaRoute);
router.use('/pemasukan', PemasukanRoute);
router.use('/pengeluaran', PengeluaranRoute);
router.use('/siswa', SiswaRoute);
router.use('/tagihan', TagihanRoute);
router.use('/users', UserRoute);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
