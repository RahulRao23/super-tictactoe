const { redisConnect, redisDisconnect } = require('../../config/redisConnection');
const CONSTANTS = require('../utilities/constants');

const socketHandler = async (io, socket) => {
	
	socket.on('create_room', async data => {
		const { v4 } = require('uuid')
		const { user_name } = data;
		const redis = await redisConnect();
		const user = 'User:' + user_name;

		const userExists = await redis.hGet(user, 'room_id');
		if (userExists) {
			socket.emit('user_exists', { user_name });
			// await redisDisconnect();
			return;
		}

		const passcode = Math.floor(100000 + Math.random() * 900000);
		const roomId = v4();
		
		// const gameBoard = Array(3).fill(Array(3).fill(null));
		// const innerGameBoards = Array(3).fill(Array(3).fill(null));

		const gameBoardStructure = {
			'0-0': null,
			'0-1': null,
			'0-2': null,
			'1-0': null,
			'1-1': null,
			'1-2': null,
			'2-0': null,
			'2-1': null,
			'2-2': null,
		};
		const gameBoard = {
			'0-0': { inner_game_board: gameBoardStructure },
			'0-1': { inner_game_board: gameBoardStructure },
			'0-2': { inner_game_board: gameBoardStructure },
			'1-0': { inner_game_board: gameBoardStructure },
			'1-1': { inner_game_board: gameBoardStructure },
			'1-2': { inner_game_board: gameBoardStructure },
			'2-0': { inner_game_board: gameBoardStructure },
			'2-1': { inner_game_board: gameBoardStructure },
			'2-2': { inner_game_board: gameBoardStructure },
		};
		

		await Promise.all([
			redis.hSet(
				user, 
				{
					room_id: roomId
				}
			),
			redis.hSet(
				'Passcode:' + passcode,
				{
					room_id: roomId
				}
			),
			redis.hSet(
				'Room:' + roomId,
				{
					passcode,
					player_1: user_name,
					game_board: JSON.stringify(gameBoard),
				}
			),
		]);
		// await redisDisconnect();

		socket.emit('room_created', { room_id: roomId, user_name, passcode, socket_id: socket.id });
		return;
	});

	socket.on('join_room', async data => {
		const { passcode, user_name } = data;
		const redis = await redisConnect();

		const user = 'User:' + user_name;

		const userExists = await redis.hGet(user, 'room_id');
		if (userExists) {
			socket.emit('user_exists', { user_name });
			// await redisDisconnect();
			return;
		}

		const passcodeKey = 'Passcode:' + passcode;

		const roomId = await redis.hGet(passcodeKey, 'room_id');
		console.log({roomId});

		if (!roomId) {
			socket.emit('invalid_room_join', { user_name });
			// await redisDisconnect();
			return;
		}

		const roomData = await redis.hGetAll('Room:' + roomId);
		if (roomData.player_1 && roomData.player_2) {
			socket.emit('invalid_room_join', { user_name });
			// await redisDisconnect();
			return;
		}

		await Promise.all([
			redis.del(passcodeKey),
			redis.hSet(
				user,
				{
					room_id: roomId
				}
			),
			redis.hSet(
				'Room:' + roomId,
				{
					player_2: user_name,
				}
			),
		]);
		// await redisDisconnect();

		socket.emit('joining_room', { room_id: roomId, user_name, passcode, socket_id: socket.id });
		return;
	});

	socket.on('get_room', async data => {
		const { room_id } = data;

		const redis = await redisConnect();
		const roomKey = 'Room:' + room_id;
		const roomData = await redis.hGetAll(roomKey);
		if(!roomData) {
			socket.emit('invalid_room_join', { room_id });
			// await redisDisconnect();
			return;
		}

		socket.join(roomKey);

		io.to(roomKey).emit('get_room_response', roomData);
		// await redisDisconnect();
		return;
	});

	socket.on('rooms', () => {
		const roomIds = io.of('/').adapter.rooms;
		const sids = io.of('/').adapter.sids;
		console.log({ roomIds: [...roomIds], sids: [...sids] });
		socket.emit('rooms', { roomIds: [...roomIds], sids: [...sids] });
	});
}

module.exports = socketHandler;