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
    if (error && response.statusCode !== 200) {
      console.log('we failed ', url, response.statusCode, body);
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
      '-limit', 'memory', '80MiB',
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
      deferred.reject(err);
    } else {
      deferred.resolve(stdout);
    }
  });
  return deferred.promise;
}

function updateMeme({imgurID, url, score}) {
  return Meme.update(imgurID, score)
    .then(meme => Image.exists({imgurID}))
    .then(data => {
      var deferred = q.defer();
      if (data.length) {
        deferred.resolve(true);
        return deferred.promise;
      }
      readImage(url)
        .then(({response, body}) => {
          var ext = response
            .headers['content-type']
            .substr('image/'.length);
          var promises = [50, 90, 180]
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
                .catch(
                  error => {
                    console.log('saved big image: ', imgurID, ', ', size);
                    return Image.saveImage({
                      imgurID,
                      size: index,
                      image: new Buffer(body, 'binary'),
                      contentType: ext,
                    });
                  }
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
