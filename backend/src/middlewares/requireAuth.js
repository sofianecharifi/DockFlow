const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
    // La fouille : récupération de l'en-tête Authorization
    const authHeader = req.headers.authorization;

    // Le contrôle : token absent ou mal formaté
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Non Autorisé' });
    }

    // Découpage pour récupérer uniquement le token pur (après "Bearer ")
    const token = authHeader.split(' ')[1];

    try {
        // Vérification du token avec la clé secrète
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Si succès : le feu vert pour continuer vers la route
        req.user = decoded; // On stocke l'ID utilisateur au cas où
        next();
    } catch (error) {
        // Si le token est trafiqué ou expiré
        return res.status(401).json({ message: 'Non Autorisé' });
    }
};

module.exports = requireAuth;
