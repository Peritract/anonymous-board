
const MongoClient = require('mongodb');
const ObjectId = require('mongodb').ObjectID;
const CONNECTION = "mongodb://" + process.env.USER +":" + process.env.KEY + "@" + process.env.HOST + "/" + process.env.DATABASE;

const create_thread = function(board, text, delete_password, callback){
    let thread = {text: text,
                  delete_password: delete_password,
                  created_on: new Date(),
                  bumped_on: new Date(),
                  reported: false,
                  replies: []
                 };
    MongoClient.connect(CONNECTION, function(err, db){
      if (err){
        callback("Connection failed", null)
      } else {
         db.collection(board).insertOne(thread, function(err, saved_thread){
           if (err){
             callback("Connection failed", null)
           } else {
             thread._id = saved_thread.insertedId;
             callback(null, thread);
           }
         })
      }
    })
  }

const load_recent_threads = function(board, callback){
  MongoClient.connect(CONNECTION, function(err, db){
    if (err){
        callback("Connection failed", null)
      } else {
        db.collection(board).find().sort({bumped_on: -1}).limit(10).toArray(function(err, docs){
        if (err){
          callback("Connection failed", null)
        } else {
          
          for (let i = 0; i < docs.length; i++){
            delete docs[i].reported
            delete docs[i].delete_password
            docs[i].replycount = docs[i].replies.length;
            if (docs[i].replies.length > 3){
              docs[i].replies = docs[i].replies.slice(0,3);
            }
          }
          callback(null, docs);
        }
        });
      }
  })
}


const delete_thread = function(board, thread_id, delete_password, callback){
  MongoClient.connect(CONNECTION, function(err, db){
    if (err){
        callback("Connection failed", null)
    } else {
      db.collection(board).findAndModify({_id: new ObjectId(thread_id), delete_password: delete_password},[],{},{remove: true, new: false}, function(err, docs){
        if (err) {
          callback("Database error", err)
        } else if (docs.value == null){
          callback(null, "incorrect password")
        } else {
          callback(null, "success")
        }
      })
    }
  })
}
    
const report_thread = function(board, thread_id, callback){
  MongoClient.connect(CONNECTION, function(err, db){
    if (err){
      callback("Connection failed", null);
    } else {
      db.collection(board).findAndModify({_id: new ObjectId(thread_id)},[["_id", 1]], {$set: {reported: true}}, {new: true, upsert: false}, function(err, data){
        if (err){
          callback(err, null);
        } else {
           callback(null, data);
        }
      })
    }
  })
}

const load_full_thread = function(board, thread_id, callback){
  MongoClient.connect(CONNECTION, function(err, db){
    if (err){
        callback("Connection failed", null)
      } else {
        db.collection(board).findOne({_id : new ObjectId(thread_id)}, {}, function (err, data){
        if (err){
          callback("Connection failed", null)
        } else {
          delete data.reported;
          delete data.delete_password;   
          data.replycount = data.replies.length;
          for (let i = 0; i < data.replies.length; i++){
            delete data.replies[i].reported;
            delete data.replies[i].delete_password;
          }
          callback(null, data);
        }
        });
      }
  })
}

const post_reply = function(board, thread_id, text, delete_password, callback){
  let created_on = new Date();
  let reply = {_id: new ObjectId(),
               text: text,
               delete_password: delete_password,
               created_on: created_on,
               reported: false,
               };
  MongoClient.connect(CONNECTION, function(err, db){
    if (err){
      callback("Connection failed", null)
    } else {      
      db.collection(board).findAndModify({_id: new ObjectId(thread_id)}, [["_id", 1]],{$set: {bumped_on: created_on}, $push: {replies: reply}}, {new: true, upsert: false}, function(err, data){
        if (err){
          callback("Database error", err);
        } else {
         reply._id = data.insertedId;
          callback(null, reply);
        }
      })                             
    }
  })
}

const report_reply = function(board, thread_id, reply_id, callback){
  MongoClient.connect(CONNECTION, function(err, db){
    if (err){
      callback("Connection failed", null);
    } else {
      db.collection(board).findAndModify({_id: new ObjectId(thread_id), "replies._id": new ObjectId(reply_id)},
        [["_id", 1]], {$set: {"replies.$.reported": true}}, {new: true, upsert: false}, function(err, data){
        if (err){
          callback(err, null);
        } else {
           callback(null, data);
        }
      })
    }
  })
}

const delete_reply = function(board, thread_id, reply_id, delete_password, callback){
  MongoClient.connect(CONNECTION, function(err, db){
    if (err){
      callback("Connection failed", null);
    } else {
      db.collection(board).findAndModify({_id: new ObjectId(thread_id), "replies._id": new ObjectId(reply_id), "replies.delete_password": delete_password},
        [["_id", 1]], {$set: {"replies.$.text": "[deleted]"}}, {new: true, upsert: false}, function(err, data){
        if (err) {
          callback("Database error", err)
        } else if (data.value == null){
          callback(null, "incorrect password")
        } else {
          callback(null, "success")
        }
      })
    }
  })
}

module.exports = {
  create_thread: create_thread,
  load_recent_threads: load_recent_threads,
  delete_thread: delete_thread,
  report_thread: report_thread,
  load_full_thread: load_full_thread,
  post_reply: post_reply,
  report_reply: report_reply,
  delete_reply: delete_reply
};