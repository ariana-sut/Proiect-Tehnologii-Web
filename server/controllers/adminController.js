const db = require('../config/db');

exports.getAllUsers = async (req, res) => {
    try {
        const result = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC;');
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Eroare la obținerea utilizatorilor:', error);
        return res.status(500).json({ error: 'Eroare internă de server.' });
    }
};

exports.deleteTourAsAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const deleteQuery = 'DELETE FROM tours WHERE id = $1 RETURNING *;';
        const result = await db.query(deleteQuery, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Turul nu a fost găsit.' });
        }

        return res.status(200).json({
            message: 'Turul a fost șters cu succes de către administrator.',
            deletedTour: result.rows[0]
        });

    } catch (error) {
        console.error('Eroare la ștergerea turului de către admin:', error);
        return res.status(500).json({ error: 'Eroare internă de server.' });
    }
};

exports.deleteReviewAsAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query('DELETE FROM reviews WHERE id = $1 RETURNING *;', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Recenzia nu a fost găsită.' });
        }

        return res.status(200).json({ message: 'Recenzia a fost eliminată cu succes de administrator.' });

    } catch (error) {
        console.error('Eroare la ștergerea recenziei:', error);
        return res.status(500).json({ error: 'Eroare internă de server.' });
    }
};