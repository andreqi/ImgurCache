var express = require('express');
var fs = require('fs');
var q = require('q');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var {Image, Meme} = require('./data');

var {updateMeme, readImage, resizeImage} = require('./utils');
var app = express();

app.get('/:id/:sz', function (req, res) {
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

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
