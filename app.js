const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const session = require('express-session');
const bcryptjs = require('bcryptjs');

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

const BOOKINGS_FILE = path.join(__dirname, 'data', 'bookings.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const ROOMS = ['Переговорная А', 'Переговорная Б', 'Конференц-зал'];

async function getBookings() {
    try {
        const data = await fs.readFile(BOOKINGS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function getUsers() {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}


async function saveUsers(users) {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}


async function saveBookings(bookings) {
    await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
}

function isTimeAvailable(bookings, room, date, startTime, duration) {
    const newStart = new Date(`${date}T${startTime}`);
    const newEnd = new Date(newStart.getTime() + duration * 60 * 60 * 1000);

    for (const booking of bookings) {
        if (booking.room !== room) continue;

        const start = new Date(`${booking.date}T${booking.startTime}`);
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
        .filter(b => new Date(`${b.date}T${b.startTime}`) > now)
        .sort((a, b) => new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`));
}

function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

app.get('/', requireAuth, (req, res) => {
    res.render('index', { rooms: ROOMS, error: null, user: req.session.user });
});

app.post('/book', requireAuth, async (req, res) => {
    const { room, date, startTime, duration } = req.body;

    if (!room || !date || !startTime || !duration) {
        return res.render('index', { rooms: ROOMS, error: 'Заполните все поля', user: req.session.user });
    }

    const bookings = await getBookings();
    const hours = parseFloat(duration);

    if (!isTimeAvailable(bookings, room, date, startTime, hours)) {
        return res.render('index', { rooms: ROOMS, error: 'Комната уже занята в это время', user: req.session.user });
    }

    bookings.push({
        id: Date.now(),
        room,
        date,
        startTime,
        duration: hours,
        userId: req.session.user.id,
        username: req.session.user.username
    });
    await saveBookings(bookings);

    res.redirect('/schedule');
});

app.get('/schedule', requireAuth, async (req, res) => {
    const bookings = await getBookings();
    res.render('schedule', { bookings: getUpcoming(bookings), user: req.session.user });
});

app.post('/cancel/:id', requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    const bookings = await getBookings();
    const booking = bookings.find(b => b.id === id);
    if(!booking) {
        return res.status(404).send('Бронирование не найдено');
    }
    if(booking.userId !== req.session.user.id) {
        return res.status(403).send('У вас нет прав на отмену этого бронирования');
    }
    await saveBookings(bookings.filter(b => b.id !== id));
    
    res.redirect('/schedule');
});


app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const users = await getUsers();
    if(users.find(u => u.username === username)) {
        return res.render('register', { error: 'Пользователь уже существует' });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    users.push({ id: Date.now(), username, password: hashedPassword });
    await saveUsers(users);
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const users = await getUsers();
    const user = users.find(u => u.username === username);
    if(!user) {
        return res.render('login', { error: 'Пользователь не найден' });
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if(!isPasswordValid) {
        return res.render('login', { error: 'Неверный пароль' });
    }
    req.session.user = { id: user.id, username: user.username };
    res.redirect('/');
});


app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});



app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
