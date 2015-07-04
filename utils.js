(function() {
    var childProcess = require("child_process");
    var oldSpawn = childProcess.spawn;
    function mySpawn() {
        console.log('spawn called');
        console.log(arguments);
        var result = oldSpawn.apply(this, arguments);
        return result;
    }
    childProcess.spawn = mySpawn;
})();

var request = require('request');
var fs = require('fs');
var im = require('./magic');
var q = require('q');

var {Image, Meme} = require('./data');

function readImage(url) {
  var options = {
    url,
    encoding: 'binary',
    headers: {
      Authorization: 'Client-ID a72c8b35aa95758',
    },
  };
  var deferred = q.defer()
  request.get(options, (error, response, body) => {
    if (error) {
      deferred.reject(new Error(error));
    } else {
      deferred.resolve({response, body});
    }
  });
  return deferred.promise;
}

function resizeImage(img, ext, opts) {
  var deferred = q.defer();
  if (ext === 'png') {
    deferred.resolve(img);
    return deferred.promise;
  }
  opts = opts || {};
  var baseProps = {
    srcData: img,
    format: `${ext}`,
    coalesce: true,
    customArgs: [
      '-limit', 'area', '0',
      '-limit', 'thread', '0',
      '-limit', 'time', '0',
    ],
  };
  Object.keys(opts).forEach(key => {
    baseProps[key] = opts[key];
  })
  im.resize(
    baseProps,
    (err, stdout, stderr) => {
    if (err) {
      console.log('we lost boys', err, stderr);
      deferred.resolve(stdout);
    } else {
      console.log('resized kittens.jpg to fit within 256x256px');
      deferred.resolve(stdout);
    }
  });
  return deferred.promise;
}

function updateMeme({imgurID, url, score}) {
  console.log(imgurID, url, score);
  return Meme.update(imgurID, score)
    .then(meme => Image.exists({imgurID}))
    .then(data => {
      console.log('asdfasdf');
      var deferred = q.defer();
      console.log(data);
      if (data.length) {
        deferred.resolve(true);
        return deferred.promise;
      }
      readImage(url)
        .then(({response, body}) => {
          var ext = response
            .headers['content-type']
            .substr('image/'.length);
          var promises = [32, 64, 128]
            .map((width, index) =>
              resizeImage(body, ext, {width})
                .then(
                  image => Image.saveImage({
                    imgurID,
                    size: index,
                    image: new Buffer(image, 'binary'),
                    contentType: ext,
                  })
                )
            );
          // TODO: asuming if the last one is ok the rest are ok too
          return promises[2];
        })
        .then(image => deferred.resolve(true))
        .catch(error => deferred.reject(error));
      return deferred.promise;
    });
}

module.exports = {
  readImage,
  resizeImage,
  updateMeme,
};