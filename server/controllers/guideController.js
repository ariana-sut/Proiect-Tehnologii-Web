const db = require("../config/db");

exports.getGuideReservations = async (req, res) => {
  try {
    const userId = req.user.id; // ID-ul utilizatorului logat din verifyToken

    const guideResult = await db.query(
      "SELECT id FROM guides WHERE user_id = $1",
      [userId],
    );

    if (guideResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Profilul de ghid nu a fost găsit." });
    }

    const guideId = guideResult.rows[0].id;

    const query = `
            SELECT 
                r.id AS reservation_id,
                r.spots_reserved,
                r.status,
                r.created_at AS reservation_date,
                td.date_time AS tour_date,
                t.title AS tour_title,
                t.price AS tour_price,
                u.name AS tourist_name,
                u.email AS tourist_email
            FROM reservations r
            JOIN tour_dates td ON r.tour_date_id = td.id
            JOIN tours t ON td.tour_id = t.id
            JOIN users u ON r.tourist_id = u.id
            WHERE t.guide_id = $1
            ORDER BY td.date_time ASC;
        `;

    const result = await db.query(query, [guideId]);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Eroare la obținerea rezervărilor ghidului:", error);
    return res.status(500).json({ error: "Eroare internă de server." });
  }
};

exports.updateReservationStatus = async (req, res) => {
  const client = await db.getClient();
  try {
    const { id } = req.params; // ID-ul rezervării
    const { status } = req.body; // 'confirmed' sau 'cancelled'
    const userId = req.user.id;

    if (!["confirmed", "cancelled"].includes(status)) {
      return res
        .status(400)
        .json({
          error: 'Status invalid. Folosiți "confirmed" sau "cancelled".',
        });
    }

    await client.query("BEGIN");

    const checkQuery = `
            SELECT r.*, td.id AS date_id, g.user_id AS owner_id
            FROM reservations r
            JOIN tour_dates td ON r.tour_date_id = td.id
            JOIN tours t ON td.tour_id = t.id
            JOIN guides g ON t.guide_id = g.id
            WHERE r.id = $1
            FOR UPDATE;
        `;
    const checkResult = await client.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Rezervarea nu a fost găsită." });
    }

    const reservation = checkResult.rows[0];

    if (reservation.owner_id !== userId) {
      await client.query("ROLLBACK");
      return res
        .status(403)
        .json({
          error: "Nu aveți permisiunea să modificați această rezervare.",
        });
    }

    if (reservation.status === "cancelled") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Rezervarea este deja anulată." });
    }

    const updateResult = await client.query(
      "UPDATE reservations SET status = $1 WHERE id = $2 RETURNING *;",
      [status, id],
    );

    if (status === "cancelled") {
      await client.query(
        "UPDATE tour_dates SET available_spots = available_spots + $1 WHERE id = $2;",
        [reservation.spots_reserved, reservation.date_id],
      );
    }

    await client.query("COMMIT");

    return res.status(200).json({
      message: `Rezervarea a fost actualizată cu statusul: ${status}.`,
      reservation: updateResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Eroare la actualizarea statusului rezervării:", error);
    return res.status(500).json({ error: "Eroare internă de server." });
  } finally {
    client.release();
  }
};
