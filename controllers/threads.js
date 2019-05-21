const mongoose = require('mongoose');
const thread = mongoose.model('Thread');

module.exports.createThread = (req, res) => {
  const { text, delete_password } = req.body;
  const { board } = req.params;
  if (!board || !text || !delete_password) {
    return res.send('All fields must be filled in');
  }
  const currentDate = new Date();
  const newThread = {
    name: board,
    text,
    delete_password,
    created_on: currentDate,
    bumped_on: currentDate
  };

  thread
    .create(newThread)
    .then(doc => res.redirect(`/b/${doc.name}`))
    .catch(err => {
      console.error(err);
      res.status(500).send('Internal server error');
    });
};

module.exports.getThreads = (req, res, threadLimit = 10, replyLimit = 3) => {
  const board = req.params.board;
  if (!board) {
    return res.send('No board');
  }
  thread
    .aggregate([
      {
        $match: { name: board }
      },
      { $sort: { bumped_on: -1 } },
      { $limit: threadLimit },
      {
        $project: {
          text: 1,
          created_on: 1,
          bumped_on: 1,
          replies: { $slice: ['$replies', -replyLimit] }
        }
      },
      {
        $project: {
          'replies.delete_password': 0,
          'replies.reported': 0
        }
      }
    ])
    .then(docs => {
      if (docs.length) {
        res.send(docs);
      } else {
        res.status(400).send('not found');
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Internal server error');
    });
};

module.exports.deleteThread = (req, res) => {
  const { thread_id, delete_password } = req.body;
  if (!thread_id || !delete_password) {
    return res.send('no parameters');
  }
  if (!mongoose.Types.ObjectId.isValid(thread_id)) {
    return res.send('Wrong ID format');
  }
  thread
    .findOneAndDelete({ _id: thread_id, delete_password })
    .then(doc => {
      if (!doc) {
        res.send('incorrect password');
      } else {
        res.send('success');
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Internal server error');
    });
};

module.exports.reportThread = (req, res) => {
  console.log('thread id', req.body);
  const { thread_id } = req.body;
  if (!thread_id) {
    return res.send('No thread id');
  }
  if (!mongoose.Types.ObjectId.isValid(thread_id)) {
    return res.send('Wrong thread id format');
  }
  thread
    .findByIdAndUpdate(thread_id, { reported: true }, { new: true })
    .then(doc => {
      if (doc) {
        res.send('reported');
      } else {
        res.send('Thread not found');
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Internal server error');
    });
};
