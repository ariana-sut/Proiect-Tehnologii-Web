const db = require('../config/db');
exports.createReview = async (req, res) => {
    try {
        const { tour_id, tourist_id, rating, comment } = req.body;
        if (!tour_id || !tourist_id || !rating) {
            return res.status(400).json({ error: 'Câmpurile tour_id, tourist_id și rating sunt obligatorii.' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating-ul trebuie să fie un număr între 1 și 5.' });
        }
        const query = `
            INSERT INTO reviews (tour_id, tourist_id, rating, comment)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await db.query(query, [tour_id, tourist_id, rating, comment]);

        return res.status(201).json({
            message: 'Recenzie adăugată cu succes!',
            review: result.rows[0]
        });

    } catch (error) {
        console.error('Eroare la crearea recenziei:', error);
        return res.status(500).json({ error: 'Eroare internă de server.' });
    }
};
exports.getReviewsByTour = async (req, res) => {
    try {
        const { tour_id } = req.params;

        const query = `
            SELECT r.*, u.name AS tourist_name
            FROM reviews r
            JOIN users u ON r.tourist_id = u.id
            WHERE r.tour_id = $1
            ORDER BY r.created_at DESC;
        `;
        const result = await db.query(query, [tour_id]);
        const avgQuery = `SELECT COALESCE(AVG(rating), 0)::numeric(10,1) AS average_rating, COUNT(*) AS total_reviews FROM reviews WHERE tour_id = $1;`;
        const avgResult = await db.query(avgQuery, [tour_id]);

        return res.status(200).json({
            stats: avgResult.rows[0],
            reviews: result.rows.relevance || result.rows
        });

    } catch (error) {
        console.error('Eroare la obținerea recenziilor:', error);
        return res.status(500).json({ error: 'Eroare internă de server.' });
    }
};