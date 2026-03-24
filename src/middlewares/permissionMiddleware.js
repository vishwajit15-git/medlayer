const PERMISSIONS = require("../config/permissions");

module.exports =(action)=>{
  return (req, res, next) => {

    if(!req.user){
      return res.status(401).json({message:"Unauthorized"});
    }

    const allowedRoles =PERMISSIONS[action];

    if(!allowedRoles){
      return res.status(500).json({message:"Permission not defined"});
    }

    if(!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message:`Access denied for role:${req.user.role}`
      });}
    next();
  };
};