const express = require('express');
const path = require('path');
const session = require('express-session');
const bcryptjs = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'ksjdahgsldgiugui2j349slkjgshpp2j2llsj',
    resave: false,
    saveUninitialized: false
}));

const ROOMS = ['Переговорная А', 'Переговорная Б', 'Конференц-зал'];

function isTimeAvailable(bookings, room, date, startTime, duration) {
    const newStart = new Date(`${date}T${startTime}`);
    const newEnd = new Date(newStart.getTime() + duration * 60 * 60 * 1000);

    for (const booking of bookings) {
        if (booking.room !== room) continue;

        const start = new Date(`${booking.date}T${booking.start_time}`);
        const end = new Date(start.getTime() + booking.duration * 60 * 60 * 1000);

        if (newStart < end && newEnd > start) {
            return false;
        }
    }
    return true;
}

function getUpcoming(bookings) {
    const now = new Date();
    return bookings
        .filter(b => new Date(`${b.date}T${b.start_time}`) > now)
        .sort((a, b) => new Date(`${a.date}T${a.start_time}`) - new Date(`${b.date}T${b.start_time}`));
}

function groupByDay(bookings) {
    const days = {};
    for (const booking of bookings) {
        if (!days[booking.date]) {
            days[booking.date] = [];
        }
        days[booking.date].push(booking);
    }
    return Object.keys(days).sort().map(date => ({ date, items: days[date] }));
}

function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

function requireAdmin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    if (!req.session.user.is_admin) {
        return res.status(403).send('Доступ только для администратора');
    }
    next();
}

app.get('/', requireAuth, (req, res) => {
    res.render('index', { rooms: ROOMS, error: null, user: req.session.user });
});

app.post('/book', requireAuth, (req, res) => {
    const { room, date, startTime, duration } = req.body;

    if (!room || !date || !startTime || !duration) {
        return res.render('index', { rooms: ROOMS, error: 'Заполните все поля', user: req.session.user });
    }

    const hours = parseFloat(duration);
    const bookings = db.prepare('SELECT * FROM bookings WHERE room = ?').all(room);

    if (!isTimeAvailable(bookings, room, date, startTime, hours)) {
        return res.render('index', { rooms: ROOMS, error: 'Комната уже занята в это время', user: req.session.user });
    }

    db.prepare('INSERT INTO bookings (room, date, start_time, duration, user_id, user_name) VALUES (?, ?, ?, ?, ?, ?)')
        .run(room, date, startTime, hours, req.session.user.id, req.session.user.username);

    res.redirect('/schedule');
});

app.get('/schedule', requireAuth, (req, res) => {
    let bookings;
    if (req.session.user.is_admin) {
        bookings = db.prepare('SELECT * FROM bookings').all();
    } else {
        bookings = db.prepare('SELECT * FROM bookings WHERE user_id = ?').all(req.session.user.id);
    }

    const days = groupByDay(getUpcoming(bookings));
    res.render('schedule', { days, user: req.session.user });
});

app.post('/cancel/:id', requireAuth, (req, res) => {
    const id = Number(req.params.id);
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);

    if (!booking) {
        return res.status(404).send('Запись не найдена');
    }
    if (!req.session.user.is_admin && booking.user_id !== req.session.user.id) {
        return res.status(403).send('Нельзя удалить чужую запись');
    }

    db.prepare('DELETE FROM bookings WHERE id = ?').run(id);
    res.redirect('/schedule');
});

app.get('/stats', requireAdmin, (req, res) => {
    const { from, to } = req.query;
    let rows = [];

    if (from && to) {
        rows = db.prepare('SELECT date, COUNT(*) AS count FROM bookings WHERE date >= ? AND date <= ? GROUP BY date ORDER BY date')
            .all(from, to);
    }

    res.render('stats', { rows, from: from || '', to: to || '', user: req.session.user });
});

app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);

    if (existing) {
        return res.render('register', { error: 'Пользователь уже существует' });
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);
    db.prepare('INSERT INTO users (username, password, is_admin) VALUES (?, ?, 0)').run(username, hashedPassword);

    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
        return res.render('login', { error: 'Пользователь не найден' });
    }
    if (!bcryptjs.compareSync(password, user.password)) {
        return res.render('login', { error: 'Неверный пароль' });
    }

    req.session.user = { id: user.id, username: user.username, is_admin: !!user.is_admin };
    res.redirect('/');
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
