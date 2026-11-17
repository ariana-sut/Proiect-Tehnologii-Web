const db = require('../config/db');
exports.getAllTours = async (req, res) => {
    try {
        const { theme, max_price } = req.query;
        let queryStr = `
            SELECT t.*, g.bio AS guide_bio, u.name AS guide_name 
            FROM tours t
            JOIN guides g ON t.guide_id = g.id
            JOIN users u ON g.user_id = u.id
            WHERE 1=1
        `;
        const queryParams = [];

        if (theme) {
            queryParams.push(theme);
            queryStr += ` AND t.theme = $${queryParams.length}`;
        }

        if (max_price) {
            queryParams.push(max_price);
            queryStr += ` AND t.price <= $${queryParams.length}`;
        }

        queryStr += ` ORDER BY t.created_at DESC;`;

        const result = await db.query(queryStr, queryParams);
        return res.status(200).json(result.rows);

    } catch (error) {
        console.error('Eroare la obținerea tururilor:', error);
        return res.status(500).json({ error: 'Eroare internă de server.' });
    }
};
exports.getTourById = async (req, res) => {
    try {
        const { id } = req.params;
        const tourQuery = `
            SELECT t.*, g.id AS guide_id, u.name AS guide_name, g.bio, g.avatar_url, g.activity_area
            FROM tours t
            JOIN guides g ON t.guide_id = g.id
            JOIN users u ON g.user_id = u.id
            WHERE t.id = $1;
        `;
        const tourResult = await db.query(tourQuery, [id]);

        if (tourResult.rows.length === 0) {
            return res.status(404).json({ error: 'Turul negăsit.' });
        }
        const datesQuery = `
            SELECT id, date_time, max_spots, available_spots 
            FROM tour_dates 
            WHERE tour_id = $1 AND date_time > NOW()
            ORDER BY date_time ASC;
        `;
        const datesResult = await db.query(datesQuery, [id]);

        const tourData = tourResult.rows[0];
        tourData.available_dates = datesResult.rows;

        return res.status(200).json(tourData);

    } catch (error) {
        console.error('Eroare la detaliile turului:', error);
        return res.status(500).json({ error: 'Eroare internă de server.' });
    }
};
exports.createTour = async (req, res) => {
    try {
        const { guide_id, title, description, theme, price, duration, meeting_point, dates } = req.body;

        if (!title || !description || !theme || !meeting_point || !dates || !Array.isArray(dates)) {
            return res.status(400).json({ error: 'Date incomplete pentru crearea turului.' });
        }
        const insertTourQuery = `
            INSERT INTO tours (guide_id, title, description, theme, price, duration, meeting_point)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const tourResult = await db.query(insertTourQuery, [guide_id, title, description, theme, price || 0, duration, meeting_point]);
        const newTour = tourResult.rows[0];
        for (const session of dates) {
            await db.query(
                `INSERT INTO tour_dates (tour_id, date_time, max_spots, available_spots) VALUES ($1, $2, $3, $4)`,
                [newTour.id, session.date_time, session.max_spots, session.max_spots]
            );
        }

        return res.status(201).json({ message: 'Tur creat cu succes!', tour: newTour });

    } catch (error) {
        console.error('Eroare la crearea turului:', error);
        return res.status(500).json({ error: 'Eroare internă de server.' });
    }
};