// Function to handle clicks on the Tic Tac Toe board
function handleClick(boardRow, boardCol, row, col) {
	console.log('Clicked on box:', boardRow, boardCol, row, col);
}

// Function to handle clicks on the parent boxes
function handleBoxClick(button, row, col) {
	const innerBoard = button.parentNode.getAttribute('board-value');
	console.log('Clicked on parent box:', innerBoard, row, col);
}

let socket;

var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("startButton");

// When the user clicks the button, open the modal
btn.onclick = function() {
	
	// Close the modal
	modal.style.display = "none";
}

// Display the modal on page load
window.onload = function() {
	modal.style.display = "block";
}

window.addEventListener('load', function () {
	const urlParams = new URLSearchParams(window.location.search);
	const roomId = urlParams.get('room_id');
	const userName = urlParams.get('user_name');
	const socket_id = urlParams.get('socket_id');
	console.log({socketId: socket_id});
	socket = io.connect({ query: { socket_id } });

	const player1Div = document.getElementById('player1');
	const player2Div = document.getElementById('player2');
	const passcodeDiv = document.getElementById('passcode');
	const roomIdDiv = document.getElementById('roomId');

	roomIdDiv.textContent = 'Room ID: ' + roomId;

	socket.emit('get_room', {
		room_id: roomId,
		user_name: userName,
	});

	socket.on('get_room_response', data => {
		const { passcode, player_1, player_2 } = data;
		
		passcodeDiv.textContent = 'Room Passcode: ' + passcode;
		player1Div.textContent = player_1 + ': X';
		if(player_2) player2Div.textContent = player_2 + ': O';
	});

	socket.on('invalid_room_join', () => {
		alert('Invalid room join!');
	});
});

// Timer
// let timer = document.getElementById('timer');
// let seconds = 0;
// let minutes = 0;
// setInterval(() => {
// 	seconds++;
// 	if (seconds === 60) {
// 			minutes++;
// 			seconds = 0;
// 	}
// 	timer.textContent = `Timer: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
// }, 1000);