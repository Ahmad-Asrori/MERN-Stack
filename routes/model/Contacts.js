const mongoose = require('mongoose');

const ContactsSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    refs: 'user'
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  phone: {
    type: String,
  },
  type: {
    type: String,
    default: 'personal'
  },
  date: {
    type: Date,
    default: Date.now(),
    required: true
  }
})

module.exports = mongoose.model('contacts', ContactsSchema);