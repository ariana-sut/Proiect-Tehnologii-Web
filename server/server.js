const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const tourRoutes = require('./routes/tourRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const guideRoutes = require('./routes/guideRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const app = express();
app.use(cors()); 
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/guide', guideRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Serverul LocalGuide funcționează cu succes!' });
});
app.use((err, req, res, next) => {
    console.error('Eroare neprinsă de server:', err.stack);
    res.status(500).json({ error: 'Eroare internă de server.' });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serverul rulează pe portul ${PORT}`);
});