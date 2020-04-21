const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('./model/User');
const auth = require('../middleware/auth');

// @route   GET api/auth
// @desc    get logged in user
// @access  private
router.get('/', auth, async (req, resp) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    resp.json(user);
  } catch (e) {
    console.error(e.message);
    resp.status(500).send('server error');
  }
})

// @route   POST api/users
// @desc    auth user & get token
// @access  public
router.post('/', [
  check('email', 'please input a valid email').isEmail(),
  check('password', 'password is requires').exists(),
], async (req, resp) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()){
    return resp.status(400).json({errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user){
      return resp.status(400).json({msg: 'invalid credential'})
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch){
      return resp.status(400).json({msg: 'invalid credential'});
    }

    const payload = {
      user: {
        id: user.id
      }
    }

    jwt.sign(payload, config.get('JWTSecret'), {expiresIn: 3600}, (err, token) => {
      if (err) throw err;
      resp.json({token})
    });
  } catch (e) {
    console.log(e.message);
    resp.status(500).send('server error');
  }
})

module.exports = router;