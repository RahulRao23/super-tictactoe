express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const minify = require('express-minify');

const { dbConnect } = require('./config/dbConnect');

const router = require('./src/routes/index.routes');
const socketHandler = require('./src/sockets/sockets');

/* Get all routes */
const userRouter = require('./src/routes/user.routes');

const PORT = 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

/* Establish DB connection */
dbConnect();

app.enable('trust proxy');
app.set('io', io);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(minify());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);
app.use('/user', userRouter);

io.on('connection', async socket => {
	console.log('Socket connected: ', socket.id);
	// console.log("Socket data:", socket.handshake.query);

	socket.on('debug', () => {
		io.emit('debug', 'socket successful');
	});

	await socketHandler(io, socket);
});

server.listen(PORT, () => { 
	console.log(`Server running at http://localhost:${PORT}`) 
});

global.io = io;