const mongoose = require('mongoose');
const config = require('config')

const connectDB = async () => {
  try {
    await mongoose.connect(config.get('MongoDBLocation'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    })
    console.log('mongoDB connected')
  } catch (e) {
    console.log(err);
    process.exit(1);
  }
}

module.exports = connectDB;