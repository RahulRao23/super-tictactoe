const constants = {};

constants.USER_STATUS = {
	ACTIVE: 1,
	DELETED: 2,
	LOGGED_OUT: 3,
};

constants.FRIEND_REQUEST_STATUS = {
	SENT: 1,
	ACCEPTED: 3,
	DECLINED: 4,
};

constants.EVENT_NAMES = {
	DOES_NOT_EXIST: 'does-not-exist',
	NOTIFY_USER: 'notify-user',
	ROOM_ADD: 'room-add',
	INVALID_SOCKET: 'invalid-socket',
	FRIEND_REQUEST_SENT: 'friend-request-sent',
	FRIEND_REQUEST_RECEIVED: 'friend-request-received',
	FRIEND_ADDED: 'friend-added',
	FRIEND_REQUEST_DECLINE: 'friend-request-decline',
	NEW_MESSAGE: 'new-message',
	DISCONNECTING: 'disconnecting',
	DISCONNECT: 'disconnect',
	DISCONNECT_RESPONSE: 'disconnect-response',
};

constants.ROOM = {
	ADD_TO_ROOM: 'add-to-room',
	USER_ADDED: 'user-added',
};

constants.USER_ROLES = {
	GROUP_ADMIN: 1,
	PARTICIPANT: 2
};

constants.PLAYER_SIGN = {
	X: 1,
	O: 2,
}

module.exports = constants;
