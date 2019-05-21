/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

var expect = require('chai').expect;
const threads = require('../controllers/threads');
const replies = require('../controllers/replies')
const mongoose = require('mongoose');

function isMongooseConnected(req, res, next) {
  if (!mongoose.connection.readyState) {
    console.log('Mongoose is not connected');
    return res.status(500).send('Internal server error');
  }
  next();
}

module.exports = function(app) {
  app
    .route('/api/threads/:board')
    .all(isMongooseConnected)
    .get((req, res) => {
      threads.getThreads(req, res);
    })
    .post((req, res) => {
      threads.createThread(req, res);
    })
    .delete((req, res) => {
      threads.deleteThread(req, res);
    })
    .put((req, res) => {
      threads.reportThread(req, res);
    });

  app
    .route('/api/replies/:board')
    .all(isMongooseConnected)
    .get((req, res) => {
      replies.getReplies(req, res);
    })
    .post((req, res) => {
      replies.createReply(req, res);
    })
    .delete((req, res) => {
      replies.deletReply(req, res);
    })
    .put((req, res) => {
      replies.reportReply(req, res);
    });
};
