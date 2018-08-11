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

let TEST_ID_THREAD1 = 0;
let TEST_ID_THREAD2 = 0; //Ends up deleted
let TEST_ID_REPLY = 0;

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test("post a thread to general", function(done){
        chai.request(server)
        .post('/api/threads/fcc')
        .send({text:"I am the walrus", delete_password:'test'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          done()
        });
      })
      
      test("post a second thread to general", function(done){
        chai.request(server)
        .post('/api/threads/fcc')
        .send({text:"I am the walrus", delete_password:'test'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          done()
        });
      })
      
    });
    
    suite('GET', function() {
      test("Get threads from general", function(done){
        chai.request(server)
        .get('/api/threads/fcc')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isBelow(res.body.length, 11);
          assert.property(res.body[0], "_id");
          assert.property(res.body[0], "replies");
          assert.property(res.body[0], "text");
          assert.property(res.body[0], "created_on");
          assert.property(res.body[0], "bumped_on");
          assert.isArray(res.body[0].replies);
          assert.isBelow(res.body[0].replies.length, 4);
          TEST_ID_THREAD1 = res.body[0]._id
          TEST_ID_THREAD2 = res.body[1]._id
          done()
        });
      })
    });
    
    suite('DELETE', function() {
      
      test("delete thread with invalid password", function(done){
        chai.request(server)
        .delete('/api/threads/fcc')
        .send({thread_id: TEST_ID_THREAD2, delete_password:'tOst'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, "incorrect password");
          done()
        });
      })
      
      test("delete thread with valid password", function(done){
        chai.request(server)
        .delete('/api/threads/fcc')
        .send({thread_id:TEST_ID_THREAD2, delete_password:'test'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, "success");
          done()
        });
      })
    });
    
    suite('PUT', function() {
      test('report thread', function(done) {
        chai.request(server)
        .put('/api/threads/fcc')
        .send({report_id:TEST_ID_THREAD1})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'reported');
          done();
        });
      });
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('send a reply', function(done) {
        chai.request(server)
        .post('/api/replies/fcc')
        .send({thread_id: TEST_ID_THREAD1, text:"TEST REPLY" , delete_password:'test'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          done();
        });
      });
    });
    
    suite('GET', function() {
      test('Get all replies for 1 thread', function(done) {
        chai.request(server)
        .get('/api/replies/fcc')
        .query({thread_id: TEST_ID_THREAD1})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, '_id');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'bumped_on');
          assert.property(res.body, 'text');
          assert.property(res.body, 'replies');
          assert.notProperty(res.body, 'delete_password');
          assert.notProperty(res.body, 'reported');
          assert.isArray(res.body.replies);
          assert.notProperty(res.body.replies[0], 'delete_password');
          assert.notProperty(res.body.replies[0], 'reported');
          assert.equal(res.body.replies[res.body.replies.length-1].text, "TEST REPLY");
          TEST_ID_REPLY = res.body.replies[res.body.replies.length-1]._id,
          done();
        });
      });
    });
    
    suite('PUT', function() {
      test('report a reply', function(done) {
        chai.request(server)
        .put('/api/threads/fcc')
        .send({thread_id:TEST_ID_THREAD1 ,reply_id:TEST_ID_REPLY})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'reported');
          done();
        });
      });
    });
    
    suite('DELETE', function() {
      test('delete reply with bad password', function(done) {
        chai.request(server)
        .delete('/api/threads/fcc')
        .send({thread_id: TEST_ID_THREAD1, reply_id: TEST_ID_REPLY, delete_password: 'pigs'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
      });
      
      test('delete reply with valid password', function(done) {
        chai.request(server)
        .delete('/api/threads/fcc')
        .send({thread_id: TEST_ID_THREAD1 ,reply_id: TEST_ID_REPLY, delete_password: 'test'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });
    });
    
  });

});
