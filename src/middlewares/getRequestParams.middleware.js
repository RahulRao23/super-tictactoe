
const getRequestParams = (req, res, next) => {
	res.locals.reqParams = Object.keys(req.body).length ? req.body : req.query || {};
	next();
}

module.exports = getRequestParams;