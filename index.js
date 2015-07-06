var express = require('express');
var fs = require('fs');
var q = require('q');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var {Image, Meme} = require('./data');

var {updateMeme, readImage, resizeImage} = require('./utils');
var app = express();

app.get('/:id/:sz', (req, res) => {
  var size = parseInt(req.params.sz, 10);
  var id = req.params.id;
  Image.findOne(
    {imgurID: id, size: size},
    (err, data) => {
      if (data) {
        console.log(err);
        console.log(data.contentType, data.imgurID);
        res.contentType(data.contentType);
        res.send(data.image);
      } else {
        res.end();
      }
    }
  );
});

app.get('/', (req, res) => {
  res.contentType('application/json');
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  Meme.find({}).sort({score: 1}).limit(128).exec(
    (err, data) => res.send(
      JSON.stringify(data.map(d => {
        return {
          imgurID: d.imgurID,
          score: d.score,
        };
      })
    ))
  );
})

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
