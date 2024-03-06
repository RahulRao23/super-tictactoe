function countdown() {
	let seconds = 10; // 2 minutes
	let countdownElement = document.getElementById('countdown');
	const socket = io();

	socket.emit('ping', {nodata: 'data'});
	socket.on('pong', data => {console.log({data})});
	var interval = setInterval(function() {
		var minutes = Math.floor(seconds / 60);
		var remainderSeconds = seconds % 60;

		countdownElement.textContent = minutes + ':' + (remainderSeconds < 10 ? '0' : '') + remainderSeconds;

		if (seconds <= 0) {
			clearInterval(interval);
			countdownElement.textContent = '0:00';
			// Optionally, you can add further actions when the countdown reaches 0:00
			// For example, redirecting the user or displaying a message.
		} else {
			seconds--;
		}
	}, 1000);
	console.log('data');
}

// Start the countdown when the page loads
window.onload = function() {
	countdown();
};