//...allowedRoles means we do array of all given parametrs i.e ex ("admin","doctor","surgeon") all of thesse arry is made
const ExpressError = require("../utils/ExpressError");

module.exports.roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {

        //auth check
        if (!req.user) {
            throw new ExpressError("Unauthorized: Please login", 401);
        }
        //role check
        if (!allowedRoles.includes(req.user.role)) {
            throw new ExpressError(`Access denied for role: ${req.user.role}`,403);
        }
        next();
    };
};