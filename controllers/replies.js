const mongoose = require('mongoose');
const thread = mongoose.model('Thread');

module.exports.createReply = (req, res) => {
  const { thread_id, text, delete_password } = req.body;
  if (!text || !delete_password) {
    return res.send('All fields must be filled in');
  }
  if (!mongoose.Types.ObjectId.isValid(thread_id)) {
    return res.send('Wrong thread id format');
  }
  const currentDate = new Date();
  const newReplay = {
    text,
    created_on: currentDate,
    delete_password,
    reported: false
  };
  thread
    .findById(thread_id)
    .then(doc => {
      if (doc) {
        doc.bumped_on = currentDate;
        doc.replies.push(newReplay);
        doc.save((err, doc) => {
          if (!err) {
            res.redirect(`/b/${doc.name}/${doc._id}`);
          } else {
            console.error(err);
            res.status(500).send('Interal server error');
          }
        });
      } else {
        res.send('Thread with such id not found');
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Internal server error');
    });
};

module.exports.getReplies = (req, res) => {
  const { thread_id } = req.query;
  if (!thread_id) {
    return res.send('No thread_id');
  }
  if (!mongoose.Types.ObjectId.isValid(thread_id)) {
    return res.send('Wrong thread id format');
  }
  const _id = mongoose.Types.ObjectId(thread_id);
  thread
    .aggregate([
      {
        $match: { _id }
      },
      {
        $project: {
          text: 1,
          created_on: 1,
          bumped_on: 1,
          replies: 1
        }
      },
      {
        $project: {
          'replies.delete_password': 0,
          'replies.reported': 0
        }
      }
    ])
    .then(doc => {
      if (doc) {
        res.send(doc);
      } else {
        res.send('not found');
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Internal server error');
    });
};

module.exports.deletReply = (req, res) => {
  const { thread_id, reply_id, delete_password } = req.body;
  if (!thread_id || !reply_id || !delete_password) {
    return res.send('no parameters');
  }
  if (!mongoose.Types.ObjectId.isValid(thread_id)) {
    return res.send('thread_id wrong id format');
  }
  if (!mongoose.Types.ObjectId.isValid(reply_id)) {
    return res.send('reply_id wrong id format');
  }
  thread
    .findById(thread_id)
    .then(doc => {
      if (!doc) {
        res.send('Thread not found');
      } else {
        const rpls = [...doc.replies];
        const index = rpls.findIndex(
          rpl => rpl._id == reply_id && rpl.delete_password === delete_password
        );
        if (index !== -1) {
          rpls[index].text = '[deleted]';
          doc.replies = rpls;
          doc.markModified('replies');
          doc.save(err => {
            if (!err) {
              res.send('success');
            }
          });
        } else {
          res.send('incorrect password');
        }
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Internal server error');
    });
};

module.exports.reportReply = (req, res) => {
  const { thread_id, reply_id } = req.body;
  if (!thread_id || !reply_id) {
    return res.send('All fields must be filled in');
  }
  if (!mongoose.Types.ObjectId.isValid(thread_id)) {
    return res.send('Wrong thread id format');
  }
  if (!mongoose.Types.ObjectId.isValid(reply_id)) {
    return res.send('Wrong reply id format');
  }
  thread
    .findById(thread_id)
    .then(doc => {
      if (!doc) {
        res.send('Thread not found');
      } else {
        const index = doc.replies.findIndex(rpl => rpl._id == reply_id);
        if (index !== -1) {
          doc.replies[index].reported = true;
          doc.markModified('replies');
          doc.save(err => {
            if (!err) {
              res.send('Success');
            }
          });
        } else {
          res.send('Reply not found');
        }
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Internal server error');
    });
};
