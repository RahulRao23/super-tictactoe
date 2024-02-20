const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new mongoose.Schema(
	{
		user_name: { type: Schema.Types.String },
		password: {type: Schema.Types.String },
		auth_token: { type: Schema.Types.String },
		status: { type: Schema.Types.Number },
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	}
);

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
