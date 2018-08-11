/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var db = require("../database-functions")


module.exports = function (app) {
  
  app.route('/api/threads/:board')
    
    .get(function(req, res){
      let board = req.params.board;
      db.load_recent_threads(board, function(err, data){
        if (err){
          res.send(err)
        } else {
          res.json(data);
        }
      })
    })
  
    .post(function(req, res){
      let board = req.params.board;
      let text = req.body.text;
      let password = req.body.delete_password;
      db.create_thread(board, text, password, function(err, data){
        if (err){
          res.send(err)
        } else {
          res.redirect("/b/"+board+"/");
        }
      })
    })  
  
    .put(function(req, res){
    let board = req.params.board;
    let thread_id = req.body.report_id;
    db.report_thread(board, thread_id, function(err, data){
      if (err) {
        res.send(err);
      } else {
        res.send("reported");
      }
    })
  
  })
  
    .delete(function(req, res){
      let board = req.params.board;
      let thread_id = req.body.thread_id;
      let delete_password = req.body.delete_password;
      db.delete_thread(board, thread_id, delete_password, function(err, data){
        if (err) {
          res.status(500);
          res.send("Failed");
        } else {
          res.send(data)
        }
      })
    })
    
  app.route('/api/replies/:board')
    .get(function(req, res){
      let board = req.params.board;
      let thread_id = req.query.thread_id;
      db.load_full_thread(board, thread_id, function(err, data){
        if (err){
          res.send(err)
        } else {
          res.json(data);
        }
      })
    })
  
    .post(function(req, res){
      let board = req.params.board;
      let thread_id = req.body.thread_id;
      let text = req.body.text;
      let delete_password = req.body.delete_password;
      db.post_reply(board, thread_id, text, delete_password, function(err, data){
        if (err){
          res.send(err)
        } else {
          res.redirect("/b/" +board + "/" + thread_id);
        }
      })
    }) //TODO
  
    .put(function(req, res){
      let board = req.params.board;
      let thread_id = req.body.thread_id;
      let reply_id = req.body.reply_id;
      db.report_reply(board, thread_id, reply_id, function(err, data){
        if (err){
          res.send("Error")
        } else {
          res.send("reported");
        }
      })
    }) //TODO
  
    .delete(function(req, res){
      let board = req.params.board;
      let thread_id = req.body.thread_id;
      let reply_id = req.body.reply_id;
      let delete_password = req.body.delete_password;
      db.delete_reply(board, thread_id, reply_id, delete_password, function(err, data){
        if (err) {
          res.status(500);
          res.send("Failed");
        } else {
          res.send(data)
        }
      })
    }) //TODO

};
