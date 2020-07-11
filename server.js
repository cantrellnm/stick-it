const path = require('path');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

app.use(express.static('public'));

app.get('/', function(request, response){
  response.sendFile(path.join(__dirname, 'views/index.html'));
});

const url = process.env.DB_URL;
MongoClient.connect(url, { useUnifiedTopology: true }, function(err, client){
    const db = client.db();

    io.on('connection', function(socket){
      db.collection('posts').find({note: {$exists: true}}).each(function(err, doc){
        if (err) console.log(err);
        if (doc !== null) socket.emit('new post', doc);
      });

      socket.on('new', function(post){
        db.collection('posts').insertOne(post, function(err, result){
          if (err) console.log(err);
          io.emit('new post', result.ops[0]);
        });
      });

      socket.on('remove', function(post){
        db.collection('posts').removeOne({'_id': new ObjectID(post._id)}, function(err, result){
          if (err) console.log(err);
          if (result.n === 0) {
            console.log("no such post");
          } else {
            io.emit('remove post', post._id);
          }
        });
      });
    });

    http.listen(process.env.PORT || 3000);
});
