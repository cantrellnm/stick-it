var path = require('path');
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var url = process.env.DB_URL;

app.use(express.static('public'));

app.get('/', function(request, response){
  response.sendFile(path.join(__dirname, 'views/index.html'));
});

io.on('connection', function(socket){

  MongoClient.connect(url, function(err, db){
    if (err) console.log(err);
    db.collection('posts').find({note: {$exists: true}}).each(function(err, doc){
      if (err) console.log(err);
      if (doc !== null) socket.emit('new post', doc);
    });
  });
  
  socket.on('new', function(post){
    MongoClient.connect(url, function(err, db){
      db.collection('posts').insert(post, function(err, result){
        if (err) console.log(err);
        io.emit('new post', result.ops[0]);
      });;
    });
  });
  
  socket.on('remove', function(post){
    MongoClient.connect(url, function(err, db){      
      db.collection('posts').remove({'_id': new ObjectID(post._id)}, function(err, result){
        if (err) console.log(err);
        if (result.n === 0) {
          console.log("no such post");  
        } else {
          io.emit('remove post', post._id); 
        }
      });;
    });
  });
});

http.listen(process.env.PORT || 3000);