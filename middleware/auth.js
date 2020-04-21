const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, resp, next) {
  //ambil token dari header
  const token = req.header('x-auth-token');

  //periksa jika bukan token tidak ada
  if (!token){
    return resp.status(401).json({msg: 'no token authorization denied'});
  }

  try {
    const decoded = jwt.verify(token, config.get('JWTSecret'));
    console.log('decoded ', decoded);
    req.user = decoded.user;
    next();
  } catch (e) {
    resp.status(401).json({msg: 'token is not valid'})
  }

}