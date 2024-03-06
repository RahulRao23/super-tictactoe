document.getElementById("login-form").addEventListener("submit", function(event) {
	event.preventDefault();
	const socket = io();

	// Retrieve username and password
	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;

	socket.emit('ping', {
		user_name: username,
		password: password,
	});

	socket.on('pong', data => {
		console.log({data});
		window.location.href = 'http://localhost:3000/homePage' + `?username=${data.user_name}`
	})
	// You can make your API call here using fetch or XMLHttpRequest
	// Example:
	// fetch("http://localhost:3000/user/createUser", {
	// 		method: "POST",
	// 		body: JSON.stringify({ user_name: username, password: password }),
	// 		headers: {
	// 				"Content-Type": "application/json"
	// 		}
	// })
	// .then(response => response.json())
	// .then(data => {
	// 	console.log({data});
	// 	// window.location.href = 'http://localhost:3000/homePage';
	// })
	// .catch(error => {
	// 		console.error("Error:", error);
	// });
});
