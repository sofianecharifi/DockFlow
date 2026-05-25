const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const db = require('../../config/database');

async function loginUser(req, res) {
    try {
        // Récupération des identifiants depuis le corps de la requête
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe requis' });
        }

        // Recherche de l'utilisateur en base de données
        const user = await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);

        // Sécurité : Si aucun utilisateur trouvé, renvoyer 401
        if (!user) {
            return res.status(401).json({ message: 'Identifiants incorrects' });
        }

        // Vérification de la validité du mot de passe
        const isMatch = await bcrypt.compare(password, user.password);

        // Sécurité : Si la comparaison échoue, renvoie 401
        if (!isMatch) {
            return res.status(401).json({ message: 'Identifiants incorrects' });
        }

        // Génération du jeton JWT
        const token = jsonwebtoken.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Envoi du token au client
        return res.json({ token });
    } catch (error) {
        console.error('Erreur lors du login:', error);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

module.exports = { loginUser };