var mongoose = require('mongoose');
var q = require('q');

var {Schema} = mongoose;

var MemeSchema = new Schema({
  imgurID: String,
  score: String,
});

MemeSchema.statics.update = function (imgurID, score) {
  var deferred = q.defer();
  console.log(imgurID);
  console.log(this.findOne);
  this.findOne({imgurID}, (error, data) => {
    if (error || !data) {
      var meme =  new Meme();
      meme.imgurID = imgurID;
      data = meme;
    }
    console.log(error, data);
    data.score = score;
    data.save((err, data) => {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(data);
      }
    })
  });
  return deferred.promise;
};

var Meme = mongoose.model('Meme', MemeSchema);

var ImageSchema = new Schema({
  imgurID: String,
  size: Number,
  image: Buffer,
  contentType: String,
});

ImageSchema.statics.exists = function (query) {
  var deferred = q.defer();
  console.log(this.find);
  this.find(query, (error, data) => {
    console.log(data);
    deferred.resolve(data);
  })
  return deferred.promise;
}

ImageSchema.statics.saveImage = function (data) {
  var deferred = q.defer();
  var img = new Image();
  Object.keys(data).forEach(key => {
    img[key] = data[key];
  });
  console.log(data);
  img.save((error, image) => {
    if (error) {
      deferred.reject(error);
    } else {
      deferred.resolve(image);
    }
  });
  return deferred.promise;
};

var Image = mongoose.model('Image', ImageSchema);

module.exports = {Image, Meme};
