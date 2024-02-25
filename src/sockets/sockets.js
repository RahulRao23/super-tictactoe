const { redisConnect, redisDisconnect } = require('../../config/redisConnection');
const CONSTANTS = require('../utilities/constants');

const socketHandler = (io) => {
	
	function checkWinner(board, boardPosition, move) {
		const [row, col] = boardPosition.split('-');
		board[`${row}-${col}`] = move;
		if (
			(board[`${row}-0`] == board[`${row}-1`] && board[`${row}-1`] == board[`${row}-2`]) ||	// Horizontal line
			(board[`0-${col}`] == board[`1-${col}`] && board[`1-${col}`] == board[`2-${col}`])	// Vertical line
		) {
			return true;
		}
		// Diagonal line
		// Check diagonal match only on entering corner or middle box
		if (
			(row !== 1 && col !== 1) ||	
			(row == col)
		) {
			if (
				(board['0-0'] == move && board['1-1'] == move && board['2-2']) == move ||
				(board['0-2'] == move && board['1-1'] == move && board['2-0']) == move
			) {
				return true;
			}
		}
		return false;
	}

	function nextAllowedBoxes(board, boardPosition) {
		const [row, col] = boardPosition.split('-');
		let allowedBoxes;
		// If current box is already completed then opponent can insert in any available boxes
		if (board[`${row}-${col}`].winner) {
			allowedBoxes = Object.entries(board).map(([box, gameData]) => {
				if (!gameData.winner) return box;
			});
		}
		return [`${row}-${col}`];
	}

	io.on('connection', async socket => {
		console.log('Socket connected: ', socket.id);
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
						next_turn: user_name,
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
	
			io.to(roomKey).emit(
				'get_room_response', 
				{
					passcode: roomData.passcode,
					player_1: roomData.player_1,
					player_2: roomData.player_2,
					next_turn: roomData.player_1 
				}
			);
			// await redisDisconnect();
			return;
		});
	
		socket.on('player_turn', async data => {
			const { room_id, username, mainBoardPosition, innerBoardPosition } = data;
	
			const redis = await redisConnect();
			const roomKey = 'Room:' + room_id;
			const roomData = await redis.hGetAll(roomKey);
			if(!roomData) {
				socket.emit('invalid_room_join', { room_id });
				// await redisDisconnect();
				return;
			}
			if (!roomData.player_1 || !roomData.player_2) {
				socket.emit('invalid_data', { msg: 'Can not start the game. Please wait till your opponent joins the game!' });
				return;
			}
	
			if (roomData.next_turn !== username) {
				socket.emit('invalid_data', { msg: 'Not your turn. Please wait for your opponent to play their turn!' });
				return;
			}
	
			const gameBoard = JSON.parse(roomData.game_board);
			const innerBoard = gameBoard[mainBoardPosition];
	
			if (innerBoard.winner) {
				socket.emit('invalid_data', { msg: 'Board is already completed. Please try other board.' });
				return;
			}
			const move = roomData.player_1 == username ? CONSTANTS.PLAYER_SIGN.X : CONSTANTS.PLAYER_SIGN.O;
	
			const isWinnerOfInnerBoard = checkWinner(innerBoard.inner_game_board, innerBoardPosition, move);
	
			if (isWinnerOfInnerBoard) {
				innerBoard.winner = move;
	
				const mainBoard = {};
				Object.entries(gameBoard).map(([key, gameData]) => mainBoard[key] = gameData.winner ? gameData.winner : null);
	
				const isGameWinner = checkWinner(mainBoard, mainBoardPosition);
				if (isGameWinner) {
					io.to(roomKey).emit(
						'game_win',
						{
							winner_name: username,
							main_board_position: mainBoardPosition,
							inner_board_position: innerBoardPosition,
						}
					);
					await redis.hSet(roomKey, { final_winner: username });
					return;
				}
			}
	
			const allowedBoxes = nextAllowedBoxes(gameBoard, mainBoardPosition);
	
			const nextTurn = username == roomData.player_1 ? roomData.player_2 : roomData.player_1;
			await redis.hSet(roomKey, { next_turn: nextTurn, game_board: JSON.stringify(gameBoard) });
			io.to(roomKey).emit(
				'next_turn', 
				{
					next_turn: nextTurn,
					allowed_boxes: allowedBoxes,
					main_board_position: mainBoardPosition,
					inner_board_position: innerBoardPosition,
				}
			);
			return;
		});
	
		socket.on('rooms', () => {
			const roomIds = io.of('/').adapter.rooms;
			const sids = io.of('/').adapter.sids;
			console.log({ roomIds: [...roomIds], sids: [...sids] });
			socket.emit('rooms', { roomIds: [...roomIds], sids: [...sids] });
		});

	});

}

module.exports = socketHandler;