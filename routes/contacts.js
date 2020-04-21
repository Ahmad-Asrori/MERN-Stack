const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('./model/User');
const Contacts = require('./model/Contacts');

// @route   GET api/contacts
// @desc    get all users contact
// @access  private
router.get('/', auth, async (req, resp) => {
  try {
    const contact = await Contacts.find({user: req.user.id}).sort({date: -1});
    resp.json(contact);
  }catch (e) {
    console.error(e.message);
    resp.status(500).send('server error');
  }
})

// @route   POST api/contacts
// @desc    add new contact
// @access  private
router.post('/', [auth, [
  check('name', 'name is required').not().isEmpty()
]], async (req, resp) => {
  const errore = validationResult(req);
  if (!errore.isEmpty()){
    return req.status(400).json({ errore: errore.array() });
  }

  const { name, email, phone, type } = req.body;
  
  try {
    const newContact = new Contacts({name, email, phone, type, user: req.user.id})
    const contact = await newContact.save();
    resp.json(contact);
  } catch (e) {
    console.error(e.message);
    resp.status(501).send('server error');
  }
})

// @route   PUT api/contacts
// @desc    update contacts
// @access  private
router.put('/:id', auth, async (req, resp) => {
  const { name, email, phone, type } = req.body;

  //build contact object
  const contactFields = {};
  if (name) contactFields.name = name;
  if (email) contactFields.email = email;
  if (phone) contactFields.phone = phone;
  if (type) contactFields.type = type;

  try{
    let contact = await Contacts.findById(req.param.id);
    if (!contact) return resp.status(404).json({msg: 'contact not found'});

    //make user own contact
    if (contact.user.toString() !== req.user.id){
      return resp.status(401).json({msg: 'not authorized'});
    }

    contact = await Contacts.findByIdAndUpdate(req.param.id, {$set: contactFields}, {new: true});
    resp.json(contact);
  } catch (e) {
    console.error(e.message);
    resp.status(501).send('server error');
  }
})

// @route   DELETE api/contacts
// @desc    delete contact
// @access  private
router.delete('/:id', auth, async (req, resp) => {
  try{
    let contact = await Contacts.findById(req.param.id);
    if (!contact) return resp.status(404).json({msg: 'contact not found'});

    //make user own contact
    if (contact.user.toString() !== req.user.id){
      return resp.status(401).json({msg: 'not authorized'});
    }

    await Contacts.findByIdAndRemove(req.param.id);
    resp.json({msg : 'contact removed'});
  } catch (e) {
    console.error(e.message);
    resp.status(501).send('server error');
  }
})

module.exports = router;