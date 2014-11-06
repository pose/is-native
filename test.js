var assert = require('assert');

var isNative = require('./index');

isNative('https://registry.npmjs.org/geoip/-/geoip-0.5.4.tgz', function (err, isNative) {
  assert.ifError(err);
  assert.equal(true, isNative);
});

isNative('https://registry.npmjs.org/oauth-sign/-/oauth-sign-0.3.0.tgz', function (err, isNative) {
  assert.ifError(err);
  assert.equal(false, isNative);
});

isNative('http://registry.npmjs.org/couchbase/-/couchbase-2.0.0.tgz', function (err, isNative) {
  assert.ifError(err);
  assert.equal(true, isNative);
});

isNative('foo', function (err, isNative) {
  assert.equal('Invalid URI "foo"', err.message);
});

isNative('http://registry.npmjs.org/couchbase/', function (err, isNative) {
  assert.equal('incorrect header check', err.message);
});
