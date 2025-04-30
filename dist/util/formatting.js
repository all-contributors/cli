"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
function formatConfig(configPath, content) {
  var stringified = JSON.stringify(content, null, 2);
  try {
    var prettier = require('prettier');
    var prettierConfig = prettier.resolveConfig.sync(configPath, {
      useCache: false
    });
    return prettierConfig ? prettier.format(stringified, (0, _extends2.default)({}, prettierConfig, {
      parser: 'json'
    })) : stringified;
  } catch (error) {
    // If Prettier can't be required or throws in general,
    // assume it's not usable and we should fall back to JSON.stringify
    return stringified;
  }
}
module.exports = {
  formatConfig
};