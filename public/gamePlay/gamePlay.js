let socket, roomId, userName, nextTurn;

// var modal = document.getElementById("myModal");

// // Get the button that opens the modal
// var btn = document.getElementById("startButton");

// // When the user clicks the button, open the modal
// btn.onclick = function() {
	
// 	// Close the modal
// 	modal.style.display = "none";
// }

// // Display the modal on page load
// window.onload = function() {
// 	modal.style.display = "block";
// }

window.addEventListener('load', function () {
	const urlParams = new URLSearchParams(window.location.search);
	roomId = urlParams.get('room_id');
	userName = urlParams.get('username');
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
		const { passcode, player_1, player_2, next_turn } = data;
		nextTurn = next_turn;
		passcodeDiv.textContent = 'Room Passcode: ' + passcode;
		player1Div.textContent = player_1 + ': X';
		if (player_2) player2Div.textContent = player_2 + ': O';

		if (nextTurn == userName && player_2) {
			alert('Please start the game by playing your move.');
		}
	});

	socket.on('invalid_room_join', () => {
		alert('Invalid room join!');
	});

	socket.on('invalid_data', data => {
		alert(data.msg);
	})

	socket.on('next_turn', data => {
		const { next_turn, allowed_boxes, main_board_position, inner_board_position } = data;
		
		const [row, col] = main_board_position.split('-');
		const mainBoardBox = document.getElementsByClassName('inner-board');

		const [innerRow, innerCol] = inner_board_position.split('-');
		const innerBox = 
			mainBoardBox[(Number(row) * 3)+ Number(col)]
			.children[(Number(innerRow) * 3)+ Number(innerCol)];
		innerBox.innerHTML = nextTurn;

		nextTurn = next_turn;
	});

	socket.on('game_win', data => {
		const { winner_name, main_board_position, inner_board_position } = data;

		const [row, col] = main_board_position.split('-');
		const mainBoardBox = document.getElementsByClassName('inner-board');

		const [innerRow, innerCol] = inner_board_position.split('-');
		const innerBox = 
			mainBoardBox[(Number(row) * 3)+ Number(col)]
			.children[(Number(innerRow) * 3)+ Number(innerCol)];

		console.log("Player Won: ", winner_name);
		innerBox.innerHTML = nextTurn;
	});
});

// Function to handle clicks on the Tic Tac Toe board
function handleClick(boardRow, boardCol, row, col) {
	console.log('Clicked on box:', boardRow, boardCol, row, col);
}

// Function to handle clicks on the parent boxes
function handleBoxClick(mainBoard, innerBoardPosition) {
	const mainBoardPosition = mainBoard.parentNode.getAttribute('board-value');
	console.log('Clicked on parent box:', mainBoardPosition, innerBoardPosition);

	socket.emit(
		'player_turn',
		{ 
			room_id: roomId,
			username: userName,
			mainBoardPosition,
			innerBoardPosition,
		}
	);
}

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