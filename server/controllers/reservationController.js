const db = require('../config/db');
exports.createReservation = async (req, res) => {
    const client = await db.getClient();
    try {
        const { tour_date_id, tourist_id, spots_reserved } = req.body;

        if (!tour_date_id || !tourist_id || !spots_reserved || spots_reserved <= 0) {
            return res.status(400).json({ error: 'Date de rezervare invalide.' });
        }

        await client.query('BEGIN');
        const dateCheck = await client.query(
            `SELECT available_spots FROM tour_dates WHERE id = $1 FOR UPDATE`,
            [tour_date_id]
        );

        if (dateCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Sesiunea de tur nu a fost găsită.' });
        }

        const currentAvailable = dateCheck.rows[0].available_spots;

        if (currentAvailable < spots_reserved) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: `Ne pare răze, mai sunt doar ${currentAvailable} locuri disponibile.` });
        }
        await client.query(
            `UPDATE tour_dates SET available_spots = available_spots - $1 WHERE id = $2`,
            [spots_reserved, tour_date_id]
        );

        const reservationQuery = `
            INSERT INTO reservations (tour_date_id, tourist_id, spots_reserved, status)
            VALUES ($1, $2, $3, 'pending')
            RETURNING *;
        `;
        const reservationResult = await client.query(reservationQuery, [tour_date_id, tourist_id, spots_reserved]);

        await client.query('COMMIT');

        return res.status(201).json({
            message: 'Rezervare înregistrată cu succes și plasată în așteptare.',
            reservation: reservationResult.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Eroare la crearea rezervării:', error);
        return res.status(500).json({ error: 'Eroare internă de server.' });
    } finally {
        client.release(); 
    }
};

exports.getMyReservations = async (req, res) => {
    try {
        const { tourist_id } = req.params;

        const query = `
            SELECT r.*, td.date_time, t.title, t.meeting_point, t.price
            FROM reservations r
            JOIN tour_dates td ON r.tour_date_id = td.id
            JOIN tours t ON td.tour_id = t.id
            WHERE r.tourist_id = $1
            ORDER BY td.date_time DESC;
        `;
        const result = await db.query(query, [tourist_id]);

        return res.status(200).json(result.rows);

    } catch (error) {
        console.error('Eroare la obținerea rezervărilor:', error);
        return res.status(500).json({ error: 'Eroare internă de server.' });
    }
};
exports.cancelReservation = async (req, res) => {
    const client = await db.getClient();
    try {
        const { id } = req.params; 

        await client.query('BEGIN');
        const resCheck = await client.query(`SELECT * FROM reservations WHERE id = $1 FOR UPDATE`, [id]);
        if (resCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Rezervarea nu a fost găsită.' });
        }

        const reservation = resCheck.rows[0];
        if (reservation.status === 'cancelled') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Rezervarea este deja anulată.' });
        }
        await client.query(`UPDATE reservations SET status = 'cancelled' WHERE id = $1`, [id]);
        await client.query(
            `UPDATE tour_dates SET available_spots = available_spots + $1 WHERE id = $2`,
            [reservation.spots_reserved, reservation.tour_date_id]
        );

        await client.query('COMMIT');

        return res.status(200).json({ message: 'Rezervarea a fost anulată cu succes, iar locurile au fost eliberate.' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Eroare la anularea rezervării:', error);
        return res.status(500).json({ error: 'Eroare internă de server.' });
    } finally {
        client.release();
    }
};