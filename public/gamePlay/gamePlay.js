let socket, roomId, userName, nextTurn, allowedBoxes = [], intervalId, seconds=30, minutes=0, popupDiv;
const URL = process.env.ENDPOINT;

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
	const modal = document.getElementById("myModal");
	const btn = document.getElementById("startButton");
	popupDiv = document.getElementById('popup');

	// Display the modal on page load
	modal.style.display = "block";
	popupDiv.style.display = 'none';

	// When the user clicks the button, open the modal
	btn.onclick = function() {
		socket.emit('player_ready', { room_id: roomId });
		modal.style.display = "none";
	}

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
			showPopUpMessage('Please start the game by playing your move.');
		}

	});

	socket.on('invalid_data', data => showPopUpMessage(data.msg));

	socket.on('next_turn', data => {
		const { next_turn, allowed_boxes, main_board_position, inner_board_position, inner_board_winner, current_move, is_draw } = data;
		
		const [row, col] = main_board_position.split('-');
		const mainBoardBox = document.getElementsByClassName('inner-board');
		allowedBoxes = allowed_boxes;

		const [innerRow, innerCol] = inner_board_position.split('-');
		const innerBox = 
			mainBoardBox[(Number(row) * 3)+ Number(col)]
			.children[(Number(innerRow) * 3)+ Number(innerCol)];
		innerBox.innerHTML = current_move;
		innerBox.disabled = true;

		if (inner_board_winner || is_draw) {
			const mainBoard = mainBoardBox[(Number(row) * 3)+ Number(col)];
			const overLayDiv = mainBoard.children[mainBoard.children.length - 1];
			overLayDiv.innerHTML = is_draw ? '-' : current_move;
			overLayDiv.style.display = 'flex';
		}

		nextTurn = next_turn;

		// Clear timer for previous turn
		resetTimer();
		// Reset minutes and seconds value for current turn
		seconds=30;
		minutes=0;

		startTimer();
	});

	socket.on('game_win', data => {
		const { winner_name, main_board_position, inner_board_position, current_move } = data;

		if (
			main_board_position &&
			inner_board_position
		) {
			const [row, col] = main_board_position.split('-');
			const mainBoardBox = document.getElementsByClassName('inner-board');
	
			const [innerRow, innerCol] = inner_board_position.split('-');

			const mainBoard = mainBoardBox[(Number(row) * 3)+ Number(col)];
			const innerBox = mainBoard.children[(Number(innerRow) * 3)+ Number(innerCol)];
	
			console.log("Player Won: ", winner_name);
			innerBox.innerHTML = current_move;

			const overLayDiv = mainBoard.children[mainBoard.children.length - 1];
			overLayDiv.innerHTML = current_move;
			overLayDiv.style.display = 'flex';
		}

		alert(`${winner_name} has won the game. Create new room and play again!`);
		window.location.href = URL;
	});

	socket.on('game_draw', data => {
		const { main_board_position, inner_board_position, current_move } = data;

		const [row, col] = main_board_position.split('-');
			const mainBoardBox = document.getElementsByClassName('inner-board');
	
			const [innerRow, innerCol] = inner_board_position.split('-');

			const mainBoard = mainBoardBox[(Number(row) * 3)+ Number(col)];
			const innerBox = mainBoard.children[(Number(innerRow) * 3)+ Number(innerCol)];
	
			// console.log("Player Won: ", winner_name);
			innerBox.innerHTML = current_move;

			const overLayDiv = mainBoard.children[mainBoard.children.length - 1];
			overLayDiv.innerHTML = current_move;
			overLayDiv.style.display = 'flex';

			alert(`Well played! It's a draw. Create new room and play again.`);
			window.location.href = URL;
	});

	socket.on('start_timer', () => startTimer());

	socket.on('game_status', data => showPopUpMessage(data.msg));

	// Reset timer for next turn
	// socket.on('reset_timer', () => {
	// 	// Clear timer for previous turn
	// 	resetTimer();
	// 	// Reset minutes and seconds value for current turn
	// 	seconds=30;
	// 	minutes=0;
	// });
	// // Start timer for next timer
	// startTimer();
});

// Function to handle clicks on the Tic Tac Toe board
function handleClick(boardRow, boardCol, row, col) {
	console.log('Clicked on box:', boardRow, boardCol, row, col);
}

// Function to handle clicks on the parent boxes
function handleBoxClick(mainBoard, innerBoardPosition) {
	const mainBoardPosition = mainBoard.parentNode.getAttribute('board-value');
	console.log('Clicked on parent box:', mainBoardPosition, innerBoardPosition);

	if (nextTurn != userName) {
		showPopUpMessage('Not your turn. Please wait for your opponent to play their turn!');
	}
	else if (allowedBoxes.length && !allowedBoxes.includes(mainBoardPosition)) {
		showPopUpMessage('Invalid move!');
	}
	else {
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
}

function startTimer() {
	let timer = document.getElementById('timer');

	intervalId = setInterval(() => {
		seconds--;
		if (seconds < 0) {
			if (minutes > 0) {
				minutes--;
				seconds = 59;
			} else {
				// Stop the timer when it reaches 0:00
				socket.emit('out_of_time', { user_name: userName, room_id: roomId });
				return;
			}
		}
		console.log({ minutes, seconds });
		timer.textContent = `Timer: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}, 1000);
}

function resetTimer() {
	clearInterval(intervalId);
}

function showPopUpMessage(msg) {
	popupDiv.innerHTML = msg;
	popupDiv.style.display = 'block';

	setTimeout(function() {
		popupDiv.style.display = 'none';
	}, 2000);
}