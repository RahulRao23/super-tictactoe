document.getElementById("createRoomBtn").addEventListener("click", function() {
	document.getElementById("createRoomForm").style.display = "block";
	document.getElementById("joinRoomForm").style.display = "none";
});

document.getElementById("joinRoomBtn").addEventListener("click", function() {
	document.getElementById("joinRoomForm").style.display = "block";
	document.getElementById("createRoomForm").style.display = "none";
});

document.getElementById("createRoomForm").addEventListener("submit", function(event) {

	event.preventDefault();
	var username = document.getElementById("usernameCreate").value;
	const socket = io();

	socket.emit('create_room', {
		user_name: username,
	});

	socket.on('user_exists', data => {
		alert("Username not available: " + data.user_name );
	});

	socket.on('room_created', data => {
		const { user_name, passcode, room_id, socket_id } = data;
		window.location.href = 'http://localhost:3000/gamePlayPage' + `?username=${user_name}&room_id=${room_id}&passcode=${passcode}&socket_id=${socket_id}`;
	});

	// Make API call here with username to create room
	console.log("Creating room with username:", username);
	alert("Creating room with username: " + username);
});

document.getElementById("joinRoomForm").addEventListener("submit", function(event) {
	event.preventDefault();
	const socket = io();
	
	var username = document.getElementById("usernameJoin").value;
	var passcode = document.getElementById("passcodeJoin").value;
	// Make API call here with username and passcode to join room
	console.log("Joining room with username:", username, "and passcode:", passcode);
	alert("Joining room with username: " + username + " and passcode: " + passcode);

	socket.on('user_exists', data => {
		alert("Username not available: " + data.user_name );
	});

	socket.emit('join_room', {
		passcode,
		user_name: username,
	});

	socket.on('invalid_data', data => {
		alert(data.msg);
	})
	
	socket.on('joining_room', data => {
		const { user_name, passcode, room_id, socket_id } = data;
		window.location.href = 'http://localhost:3000/gamePlayPage' + `?username=${user_name}&room_id=${room_id}&passcode=${passcode}&socket_id=${socket_id}`;
	});
});