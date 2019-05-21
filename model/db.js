const mongoose = require('mongoose');

const { DBuri = 'mongodb://localhost/message_board' } = process.env;

mongoose.connect(DBuri, { useNewUrlParser: true, useFindAndModify: false });
mongoose.connection.on('connected', () =>
  console.log(`mongoose is connected to ${DBuri}`)
);
mongoose.connection.on('error', err =>
  console.log('Mongoose connection error ' + err)
);
mongoose.connection.on('disconneted', () =>
  console.log('Mongoose disconnected')
);
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose disconnected through app termination');
    process.exit(0);
  });
});

const replySchema = new mongoose.Schema({
  text: { type: String, required: true },
  delete_password: { type: String, required: true },
  created_on: { type: Date, required: true },
  reported: { type: Boolean, default: false }
});

const threadShema = new mongoose.Schema({
  name: { type: String, required: true },
  text: { type: String, required: true },
  delete_password: { type: String, required: true },
  created_on: { type: Date, required: true },
  bumped_on: { type: Date, required: true },
  reported: { type: Boolean, default: false },
  replies: { type: [replySchema], default: [] }
});

mongoose.model('Thread', threadShema);
