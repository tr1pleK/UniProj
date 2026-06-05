const db = require('./db');

const username = process.argv[2];
if (!username) {
    console.log('Использование: node set-admin.js <username>');
    process.exit(1);
}

const result = db.prepare('UPDATE users SET is_admin = 1 WHERE username = ?').run(username);
if (result.changes === 0) {
    console.log('Пользователь не найден:', username);
} else {
    console.log('Теперь администратор:', username);
}
