const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const db = require('../../config/database');

async function loginUser(req, res) {
    try {
        // Extraction : Récupère l'email et le password depuis la requête
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe requis' });
        }

        // Recherche en BDD : chercher l'utilisateur
        const user = await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);

        // Sécurité : Si aucun utilisateur trouvé, renvoyer 401
        if (!user) {
            return res.status(401).json({ message: 'Identifiants incorrects' });
        }

        // Le crash-test du mot de passe : comparaison du mot de passe
        const isMatch = await bcrypt.compare(password, user.password);

        // Sécurité : Si la comparaison échoue, renvoie 401
        if (!isMatch) {
            return res.status(401).json({ message: 'Identifiants incorrects' });
        }

        // La fabrication du pass (JWT)
        const token = jsonwebtoken.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // La livraison : Renvoie le token au frontend
        return res.json({ token });
    } catch (error) {
        console.error('Erreur lors du login:', error);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

module.exports = { loginUser };