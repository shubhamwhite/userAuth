const jwt = require("jsonwebtoken");
const config = require("../config");
const { responder } = require("../utils/responseHandler");

const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token || req.headers["authorization"]?.split(" ")[1]; 
  try {
      if (!token) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, config.get("JWT_SECRET"));
        
        console.log("decoded:", decoded); 
    req.user = decoded; 
    next();
  } catch (err) {
    return responder(res, 500, "Internal server error", err);
  }
};

module.exports = authMiddleware;