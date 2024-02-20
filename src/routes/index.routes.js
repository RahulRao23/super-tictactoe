// const express = require('express');
const Router = new express.Router();

const fs = require('fs');
const path = require('path');

Router.get('/', async (req, res) => {

	const filePath = path.join(__dirname, '../../public/homePage/homePage.html');

	try {
		res.setHeader('Content-Type', 'text/html');
		res.sendFile(filePath);
		return;
	} catch (error) {
		console.error('Error reading file:', error);
		res.status(500).send('Internal Server Error');
		return;
	}
});

Router.get('/gamePlayPage', async (req, res) => {

	const filePath = path.join(__dirname, '../../public/gamePlay/gamePlay.html');

	try {
		// res.setHeader('Content-Type', 'text/html');
		res.sendFile(filePath);
		return;
	} catch (error) {
		console.error('Error reading file:', error);
		res.status(500).send('Internal Server Error');
		return;
	}
});

// Router.get('/homePage', async (req, res) => {

// 	const filePath = path.join(__dirname, '../../public/homePage/homePage.html');
// 	try {
// 		// res.setHeader('Content-Type', 'text/html');
// 		res.sendFile(filePath);
// 		return;
// 	} catch (error) {
// 		console.error('Error reading file:', error);
// 		res.status(500).send('Internal Server Error');
// 		return;
// 	}
// });

module.exports = Router;