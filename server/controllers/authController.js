const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Toate câmpurile (name, email, password) sunt obligatorii.' });
        }
        const userExists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({ error: 'Adresa de e-mail este deja folosită.' });
        }
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const userRole = role && ['tourist', 'guide'].includes(role) ? role : 'tourist';
        const newUserQuery = `
            INSERT INTO users (name, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, email, role, created_at;
        `;
        const newUserData = await db.query(newUserQuery, [name, email, passwordHash, userRole]);
        if (userRole === 'guide') {
            await db.query(
                'INSERT INTO guides (user_id, bio, activity_area) VALUES ($1, $2, $3)',
                [newUserData.rows[0].id, 'Biografie în curs de actualizare...', 'Timișoara']
            );
        }

        return res.status(201).json({
            message: 'Utilizator înregistrat cu succes!',
            user: newUserData.rows[0]
        });

    } catch (error) {
        console.error('Eroare la înregistrare:', error);
        return res.status(500).json({ error: 'Eroare internă de server.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Introduceți e-mailul și parola.' });
        }
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Credențiale invalide.' });
        }

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credențiale invalide.' });
        }
        return res.status(200).json({
            message: 'Autentificare reușită!',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Eroare la login:', error);
        return res.status(500).json({ error: 'Eroare internă de server.' });
    }
};
exports.logout = (req, res) => {
    return res.status(200).json({ message: 'Deconectare reușită.' });
};