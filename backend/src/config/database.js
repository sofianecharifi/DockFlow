const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, '../../db/database.db');

// connexion à la base
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        return console.error('Erreur SQLite :', err.message);
    }

    console.log('Connecté à SQLite');
});

db.runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this);
            }
        });
    });
};

db.getAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

db.allAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// création de la table + utilisateur de test
const initDb = async () => {
    try {
        // création table users
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // vérifier si le compte existe déjà
        const row = await db.getAsync(`SELECT * FROM users WHERE email = ?`, ['admin@dockflow.io']);

        // si utilisateur déjà existant
        if (row) {
            console.log('Compte test déjà existant');
            return;
        }

        // hash du mot de passe
        const hashedPassword = await bcrypt.hash('test1234', 10);

        // insertion utilisateur
        await db.runAsync(
            `INSERT INTO users(email, password) VALUES(?, ?)`,
            ['admin@dockflow.io', hashedPassword]
        );

        console.log('Compte test créé');

    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données :', error);
    }
};

initDb();

module.exports = db;