//...allowedRoles means we do array of all given parametrs i.e ex ("admin","doctor","surgeon") all of thesse arry is made


module.exports.roleMiddleware = (...allowedRoles) => {   
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        if (!allowedRoles.includes(req.user.role)) { //here we check if the role given by user matches any of the role in the role array
            return res.status(403).json({
                message: "Forbidden: Access denied"
            });
        }

        next();
    };
};