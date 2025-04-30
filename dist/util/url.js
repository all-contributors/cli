"use strict";

function isHttpProtocol(input) {
  return new RegExp('^https?\\:?$').test(input);
}
function isValidHttpUrl(input) {
  try {
    var url = new URL(input);
    return isHttpProtocol(url.protocol);
  } catch (e) {
    return false;
  }
}
function parseHttpUrl(input) {
  if (typeof input !== 'string') {
    throw new TypeError('input must be a string');
  }
  var url = new URL(new RegExp('^\\w+\\:\\/\\/').test(input) ? input : `http://${input}`);
  if (!isHttpProtocol(url.protocol)) {
    throw new TypeError('Provided URL has an invalid protocol');
  }
  return url.toString();
}
module.exports = {
  isHttpProtocol,
  isValidHttpUrl,
  parseHttpUrl
};