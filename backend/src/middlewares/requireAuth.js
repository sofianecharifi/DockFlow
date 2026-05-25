const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
    // Récupération de l'en-tête Authorization
    const authHeader = req.headers.authorization;

    // Vérification de la présence et du format du token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Non Autorisé' });
    }

    // Extraction du token de l'en-tête
    const token = authHeader.split(' ')[1];

    try {
        // Vérification du token avec la clé secrète
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Autorisation accordée, passage au middleware suivant
        req.user = decoded; // On stocke l'ID utilisateur au cas où
        next();
    } catch (error) {
        // Gestion des tokens invalides ou expirés
        return res.status(401).json({ message: 'Non Autorisé' });
    }
};

module.exports = requireAuth;
