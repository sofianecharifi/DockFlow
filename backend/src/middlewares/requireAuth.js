const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {

    const authHeader = req.headers.authorization;


    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Non Autorisé' });
    }


    const token = authHeader.split(' ')[1];

    try {
        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        

        req.user = decoded; // save decoded id
        next();
    } catch (error) {
        // catch invalid
        return res.status(401).json({ message: 'Non Autorisé' });
    }
};

module.exports = requireAuth;
