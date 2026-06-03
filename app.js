const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const BOOKINGS_FILE = path.join(__dirname, 'data', 'bookings.json');
const ROOMS = ['Переговорная А', 'Переговорная Б', 'Конференц-зал'];

async function getBookings() {
    try {
        const data = await fs.readFile(BOOKINGS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
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

app.get('/', (req, res) => {
    res.render('index', { rooms: ROOMS, error: null });
});

app.post('/book', async (req, res) => {
    const { room, date, startTime, duration } = req.body;

    if (!room || !date || !startTime || !duration) {
        return res.render('index', { rooms: ROOMS, error: 'Заполните все поля' });
    }

    const bookings = await getBookings();
    const hours = parseFloat(duration);

    if (!isTimeAvailable(bookings, room, date, startTime, hours)) {
        return res.render('index', { rooms: ROOMS, error: 'Комната уже занята в это время' });
    }

    bookings.push({
        id: Date.now(),
        room,
        date,
        startTime,
        duration: hours
    });
    await saveBookings(bookings);

    res.redirect('/schedule');
});

app.get('/schedule', async (req, res) => {
    const bookings = await getBookings();
    res.render('schedule', { bookings: getUpcoming(bookings) });
});

app.post('/cancel/:id', async (req, res) => {
    const id = Number(req.params.id);
    const bookings = await getBookings();
    await saveBookings(bookings.filter(b => b.id !== id));
    res.redirect('/schedule');
});

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
