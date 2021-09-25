(function (graph) {
                 function require(file) {
                     function absRequire(relPath) {
                        return require(graph[file].deps[relPath])
                     }
                     var exports = {};
                     (function (require,exports,code) {
                        eval(code)
                     })(absRequire,exports,graph[file].code)
                     return exports
                 }
                 require('index.js')
          })({"index.js":{"deps":{"computed.js":"./computed.js"},"code":"\"use strict\";\n\nvar _computed = _interopRequireDefault(require(\"computed.js\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nconsole.log((0, _computed[\"default\"])(1, 1, 1, 1));"},"computed.js":{"deps":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = _default;\n\nfunction _default() {\n  for (var _len = arguments.length, rest = new Array(_len), _key = 0; _key < _len; _key++) {\n    rest[_key] = arguments[_key];\n  }\n\n  return rest.reduce(function (prev, current, index, array) {\n    return prev + current;\n  });\n}"}})