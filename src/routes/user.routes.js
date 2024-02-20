const express = require('express');

const {
	createUser,
} = require('../controllers/user.controller');

const getRequestParamsMiddleware = require('../middlewares/getRequestParams.middleware');

const userRouter = new express.Router();

/* Debug API: Create a user by providing a phone_number for testing */
userRouter.post('/createUser', getRequestParamsMiddleware, createUser);

/* Error handling */
userRouter.use('/', (req, res, next) => {
	console.log('Route not found: ', req.url);
	res.status(404);
	res.send('404 Not Found');
});

module.exports = userRouter;
