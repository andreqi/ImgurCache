var request = require('request');
var {updateMeme} = require('./utils.js');

var q = require('q');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var sleep = function (secs) {
  var deferred = q.defer();
  setTimeout(() => deferred.resolve(true), secs * 1000);
  return deferred.promise;
}

request.get({
  url: "https://api.imgur.com/3/gallery/hot/viral/0.json",
  headers: {
    Authorization: 'Client-ID a72c8b35aa95758',
  },
}, (error, response, body) => {
  var data = JSON.parse(body).data
    .filter(d => !!!d.images_count)
    .map(e => {
      return {
        imgurID: e.id,
        score: e.score,
        url: e.link,
      };
    });
  var deferred = q.defer();
  var promise = deferred.promise;
  data.forEach(d => {
    promise = promise
      .then(() => sleep(1).then(() => {
        console.log(d);
        return updateMeme(d);
      }))
      .catch(() => sleep(1).then(() => {
        console.log('we lost');
        console.log(d);
        return updateMeme(d);
      }));
  });
  promise.done();
  deferred.resolve(true);
  deferred.promise.catch(e => console.log(e, e.stack))
});
