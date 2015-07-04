var request = require('request');
var {updateMeme} = require('./utils.js');

var q = require('q');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

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
  console.log(data);
  var deferred = q.defer();
  var promise = deferred.promise;
  data.forEach(d => {
    promise = promise
      .then(() => {
        console.log(d);
        console.log('gg');
        updateMeme(d)
      })
      .catch(() => {
         console.log('ff');
         updateMeme(d);
      });
  });
  console.log(promise);
  deferred.resolve(true);
});
