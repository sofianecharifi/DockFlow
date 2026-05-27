const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, '../../db/database.db');

// init db
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

// init tables & seed
const initDb = async () => {
    try {
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // check existing
        const row = await db.getAsync(`SELECT * FROM users WHERE email = ?`, ['admin@dockflow.io']);

        if (row) {
            console.log('Compte test déjà existant');
            return;
        }

        // hash pwd
        const hashedPassword = await bcrypt.hash('test1234', 10);

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