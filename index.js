var assert = require('assert');
var zlib = require('zlib');

var debug = require('debug')('is-native');
var request = require('request');
var tar = require('tar-stream');

module.exports = function isNative(url, cb) {

  function onError (err) {
    extract.removeAllListeners('finish');
    extract.removeAllListeners('entry');
    extract.removeAllListeners('error');
    gunzip.removeAllListeners('error');
    resourceStream.removeAllListeners('end');
    resourceStream.removeAllListeners('data');
    resourceStream.removeAllListeners('response');
    resourceStream.removeAllListeners('error');
    cb(err);
  }

  var extract = tar.extract();
  var resourceStream;
  var gunzip = zlib.createGunzip();
  var totalLength = 0;

  try {
    resourceStream = request.get(url);
  } catch (e) {
    return cb(e);
  }

  extract.on('entry', function (header, stream, callback) {
    // TODO In old packages we should check for node-waaf
    if (header.name === 'package/binding.gyp') {
      extract.removeAllListeners('entry');
      extract.removeAllListeners('finish');
      extract.removeAllListeners('error');
      resourceStream.removeAllListeners('data');
      unzippedStream.unpipe(extract);
      extract.end();
      unzippedStream.end();
      resourceStream.end();
      cb(null, true);
      callback();
      return;
    }
    stream.resume();
    callback();
  });

  extract.once('finish', function () {
    extract.removeAllListeners('error');
    extract.removeAllListeners('entry');
    cb(null, false);
  });

  var readBytes = 0;
  resourceStream.on('data', function (data) {
    readBytes += data.length;
  });

  resourceStream.once('end', function () {
    debug('Total Read ' + readBytes + ' out of ' + totalLength + ' ' + Math.floor((readBytes / totalLength) * 100) + '%');
  });

  resourceStream.once('response', function (response) {
    totalLength = response.headers['content-length'];
  });

  var unzippedStream = resourceStream.pipe(gunzip);

  gunzip.once('error', onError);
  extract.once('error', onError);
  resourceStream.once('error', onError);
  unzippedStream.once('error', onError);

  unzippedStream.pipe(extract);

};

