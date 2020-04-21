const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./model/User');
const config = require('config');

// @route   POST api/users
// @desc    Register a user
// @access  public
router.post('/',
  [
    check('name', 'please add name').not().isEmpty(),
    check('email', 'please input a valid email').isEmail(),
    check('password', 'please input a password with 6 or more character').isLength({min: 6})
  ], async (req, resp) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
      return resp.status(400).json({errors: errors.array() });
    }

    const { name, email, password } = req.body;
    
    try {
      let user = await User.findOne({ email });
      if (user){
        return resp.status(400).json({msg: 'user already exist'})
      }
      user = new User({ name, email, password });

      // encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // simpan ke mongoDB
      user.save();
      console.log(user);

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
  }
);

module.exports = router;