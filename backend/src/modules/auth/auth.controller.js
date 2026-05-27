const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const db = require('../../config/database');

async function loginUser(req, res) {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe requis' });
        }

        const user = await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);

        // bad auth
        if (!user) {
            return res.status(401).json({ message: 'Identifiants incorrects' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Identifiants incorrects' });
        }

        const token = jsonwebtoken.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.json({ token });
    } catch (error) {
        console.error('Erreur lors du login:', error);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

module.exports = { loginUser };