const jwt = require('jsonwebtoken');
const config = require('../config');

const generateToken = (id, email) => {
    return jwt.sign({ id: id , email: email}, config.get('JWT_SECRET'), {    
          expiresIn: '1h' // Token expiration time
    });
}

module.exports = generateToken;