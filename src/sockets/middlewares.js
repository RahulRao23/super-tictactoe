const { redisConnect } = require('../../config/redisConnection');
const CONSTANTS = require('../utilities/constants');

const SocketMiddlewares = {};

SocketMiddlewares.AddUserToRooms = async (socket, next) => {

	const redis = await redisConnect();
	console.log({socket: socket.handshake.query.user_name});

	const user = 'User' + socket.socket_id;
	redis.set(user, 'name')
	// const userData = socket.userData;
	// for (const groupId of userData.chat_groups) {
	// 	console.log({groupId});
	// 	socket.join(CONSTANTS.ROOM_PREFIX + groupId);
	// }
	// /* Update active members count when user log's in */
	// await chatServices.activateUserInChatGroups(userData.chat_groups);
	next();
}

module.exports = SocketMiddlewares;