const { createClient } = require('redis');

const client = createClient({
	socket: {
		host: "localhost",
		port: 6379,
	},
	// password: '<password>'
});

client.on('error', err => console.log('Redis Client Error', err));

let redisConnectionPromise;

async function redisConnect() {
	if (!redisConnectionPromise) redisConnectionPromise = client.connect();
	// await client.connect();
	await redisConnectionPromise;
	client.on('connect', function() {
		console.log('Redis Connected!');
	});
	return client;
}

async function redisDisconnect() {
	await client.disconnect();
	return;
}

module.exports = { redisConnect, redisDisconnect };