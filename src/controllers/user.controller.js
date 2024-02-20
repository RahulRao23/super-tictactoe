const userServices = require('../services/users.services');
const STATUS = require('../../config/statusCodes.json');
const CONSTANTS = require('../utilities/constants');

const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const userController = {};

/** API to create a dummy user for testing.
 * If user_name already exists then generate new auth_token
 * else create new user in DB and generate new auth_token
 * 
 * @param {{
* 	user_name: String
* }} req 
* @param {*} res 
* @returns {*}
*/
userController.createUser = async (req, res) => {
	try {
		const { user_name } = res.locals.reqParams;
		if (!user_name) {
			return res.status(STATUS.BAD_REQUEST).send({
				error: 'BAD_REQUEST',
				message: 'Required data not sent',
			});
		}

		const queryData = { user_name, status: CONSTANTS.USER_STATUS.ACTIVE };
		/* Get user data */
		const userData = await userServices.getUserDetails(queryData);
		let user;

		/* Create new user if user_name does not exist */
		if(!userData) {
			const newUser = await userServices.createUser({
				user_name,
				status: CONSTANTS.USER_STATUS.ACTIVE,
			});
			const signData = { user_id: newUser._id };
	
			/* Generate access token and update in DB */
			const authToken = jwt.sign(signData, CONSTANTS.JWT_PRIVATE_KEY, { expiresIn: "1h" });
			newUser.auth_token = authToken;
			user = await newUser.save();
		} else {
			/* Update auth token for user if user already exists */
			const signData = { user_id: userData._id };
	
			/* Generate access token and update in DB */
			const authToken = jwt.sign(signData, CONSTANTS.JWT_PRIVATE_KEY, { expiresIn: "1h" });
	
			/* Assign new access token and update DB */
			userData.auth_token = authToken;
			userData.status = CONSTANTS.USER_STATUS.ACTIVE;
			user = await userData.save();
		}

		/* Return user data in response */
		return res.status(STATUS.SUCCESS).send({
			message: 'SUCCESS',
			data: user,
		});

		return;
	} catch (error) {
		console.log('Create User ERROR: ', error);
		return res.status(STATUS.INTERNAL_SERVER_ERROR).send({
			error: 'INTERNAL_SERVER_ERROR',
			message: error.message ? error.message : 'Something went wrong' + error,
		});
	}
}

module.exports = userController;
