/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {
  const testTxt = 'This is a test text';
  let test_thread_id;
  let test_thread_id_2;
  let test_reply_id;

  suite('API ROUTING FOR /api/threads/:board', () => {
    suite('POST', () => {
      test('create two threads', done => {
        chai
          .request(server)
          .post('/api/threads/test')
          .send({ text: testTxt, delete_password: 'password' })
          .end((err, res) => {
            assert.equal(res.status, 200);
          });
        chai
          .request(server)
          .post('/api/threads/test')
          .send({ text: `${testTxt} blabla`, delete_password: 'password2' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            done();
          });
      });
    });

    suite('GET', () => {
      test('most recent 10 threads with most recent 3 replies each', done => {
        chai
          .request(server)
          .get('/api/threads/test')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.isBelow(res.body.length, 11);
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'bumped_on');
            assert.property(res.body[0], 'text');
            assert.property(res.body[0], 'replies');
            assert.notProperty(res.body[0], 'reported');
            assert.notProperty(res.body[0], 'delete_password');
            assert.isArray(res.body[0].replies);
            assert.isBelow(res.body[0].replies.length, 4);
            test_thread_id = res.body[0]._id;
            test_thread_id_2 = res.body[1]._id;
            done();
          });
      });
    });

    suite('DELETE', () => {
      test('delete thread with good password', done => {
        chai
          .request(server)
          .delete('/api/threads/test')
          .send({ thread_id: test_thread_id, delete_password: 'password2' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          });
      });

      test('delete thread with bad password', done => {
        chai
          .request(server)
          .delete('/api/threads/test')
          .send({
            thread_id: test_thread_id_2,
            delete_password: 'bad_password'
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'incorrect password');
            done();
          });
      });
    });

    suite('PUT', () => {
      test('report thread', done => {
        chai
          .request(server)
          .put('/api/threads/test')
          .send({ thread_id: test_thread_id_2 })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'reported');
            done();
          });
      });
    });
  });

  suite('API ROUTING FOR /api/replies/:board', () => {
    suite('POST', () => {
      test('Create reply', done => {
        chai
          .request(server)
          .post('/api/replies/test')
          .send({
            thread_id: test_thread_id_2,
            text: 'This is a reply text test',
            delete_password: 'rpl_pwd'
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            done();
          });
      });
    });

    suite('GET', () => {
      test('Get all replies for one thread', done => {
        chai
          .request(server)
          .get('/api/replies/test')
          .query({ thread_id: test_thread_id_2 })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'bumped_on');
            assert.property(res.body[0], 'text');
            assert.property(res.body[0], 'replies');
            assert.notProperty(res.body[0], 'delete_password');
            assert.notProperty(res.body[0], 'reported');
            assert.isArray(res.body[0].replies);
            assert.notProperty(res.body[0].replies[0], 'delete_password');
            assert.notProperty(res.body[0].replies[0], 'reported');
            assert.equal(
              res.body[0].replies[res.body[0].replies.length - 1].text,
              'This is a reply text test'
            );
            done();
          });
      });
    });

    suite('PUT', () => {
      test('report reply', done => {
        chai
          .request(server)
          .put('/api/threads/test')
          .send({ thread_id: test_thread_id_2, reply_id: test_thread_id_2 })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'reported');
            done();
          });
      });
    });

    suite('DELETE', () => {
      test('delete reply with valid password', done => {
        chai
          .request(server)
          .delete('/api/threads/test')
          .send({
            thread_id: test_thread_id_2,
            reply_id: test_reply_id,
            delete_password: 'password'
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          });
      });

      test('delete reply with bad password', done => {
        chai
          .request(server)
          .delete('/api/threads/test')
          .send({
            thread_id: test_thread_id_2,
            reply_id: test_reply_id,
            delete_password: 'bad_pwd'
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'incorrect password');
            done();
          });
      });
    });
  });
});
