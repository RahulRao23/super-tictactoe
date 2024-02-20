const jwt = require('jsonwebtoken');

const userServices = require('../services/users.services');
const STATUS = require('../../config/statusCodes.json');
const CONSTANTS = require('../utilities/constants');


const verifyAuthToken = async (req, res, next) => {

	try {
		const authToken = req.headers.auth_token;
		if (!authToken) {
			return next(
				res.status(STATUS.BAD_REQUEST).send({
					error: 'BAD_REQUEST',
					message: 'Auth token missing.',
				})
			);
		}

		const decodedToken = jwt.decode(authToken);

		if (!decodedToken) {
			return next(
				res.status(STATUS.BAD_REQUEST).send({
					error: 'BAD_REQUEST',
					message: 'Invalid auth_token.',
				})
			);
		}

		/* Validate user */
		const userData = await userServices.getUserDetails({
			_id: decodedToken.user_id,
		});
		if (!userData || userData.status === CONSTANTS.USER_STATUS.DELETED) {
			return next(
				res.status(STATUS.UNAUTHORIZED).send({
					error: 'UNAUTHORIZED',
					message: 'User does not exist',
				})
			);
		}

		/* Validate auth token */
		if (!userData.auth_token) {
			return next(
				res.status(STATUS.ALREADY_REPORTED).send({
					error: 'ALREADY_REPORTED',
					message: 'User already logged out.',
				})
			);
		}

		if (userData.auth_token != authToken) {
			return next(
				res.status(STATUS.UNAUTHORIZED).send({
					error: 'UNAUTHORIZED',
					message: 'Invalid auth_token.',
				})
			);
		}

		/* Assign user data to local variables to access within the API */
		res.locals.authToken = authToken;
		res.locals.userData = userData;
		res.locals.decodedToken = decodedToken;
		next();
	} catch (error) {
		console.log({error});
		return next(
			res.status(STATUS.INTERNAL_SERVER_ERROR).send({
				error: 'INTERNAL_SERVER_ERROR',
				message: 'Something went wrong.',
			})
		);
	}
	
}

module.exports = verifyAuthToken;