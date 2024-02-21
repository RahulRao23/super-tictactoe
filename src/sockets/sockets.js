const { redisConnect, redisDisconnect } = require('../../config/redisConnection');
const CONSTANTS = require('../utilities/constants');

const socketHandler = async (io, socket) => {
	
	socket.on('create_room', async data => {
		const { v4 } = require('uuid')
		const { user_name } = data;
		const redis = await redisConnect();
		const user = 'User:' + user_name;

		const userExists = await redis.hGet(user, 'user_name');
		if (userExists) {
			socket.emit('user_exists', { user_name });
			// await redisDisconnect();
			return;
		}

		const passcode = Math.floor(100000 + Math.random() * 900000);
		const roomId = v4();
		
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

		const userExists = await redis.hGet(user, 'user_name');
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