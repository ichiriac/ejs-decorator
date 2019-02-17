'use strict';

var hookOutput = {};
var hookCallback = {};
var hookFunction = {};

/**
 * Init helper
 */
var wrapper = function(lib) {
  if (lib) {
    wrapper.proxy(lib);
  }
};

/**
 * Hook injection
 */
wrapper.proxy = function(ejs) {
  for(var k in ejs) {
    if (k !== 'name' && ejs.hasOwnProperty(k)) {
      wrapper[k] = ejs[k];
      if (typeof wrapper[k] === 'function') {
        wrapper[k].bind(ejs);
      }
    }
  }
  var compile = ejs.compile;
  ejs.compile = wrapper.compile = function(template, opt) {
    var fn = compile(template, opt);
    return function(state) {
      var locals = Object.assign({}, state);
      var scope = {};
      scope._stack = [];
      for(var k in hookOutput) {
        scope[k] = function() {
          scope._stack.push({
            name: this.toString(),
            args: Array.prototype.slice.call(arguments) 
          });
        }.bind(k);
      }
      for(var k in hookCallback) {
        scope[k] = function() {
          var args = Array.prototype.slice.call(arguments);
          var cb = args.pop();
          if (typeof cb !== 'function') {
            throw new Error("Expecting a callback function");
          }
          
          // Extract function body and execute it out of context
          cb = cb.toString();
          var m = /function[^\(]*\(([^\)]*)\)[^{]*\{([\S\s]*)\}$/.exec(cb);
          if (!m) {
              throw new TypeError("Invalid function in parameters");
          }
          var params = m[1].split(',');
          for (var i = 0; i < params.length; i++) {
              // trim possible spaces
              params[i] = params[i].replace(/^\s*|\s*$/g, '');
          }
          // wrapper
          cb = new Function(
            'escapeFn, rethrow, locals', 
            [
              'var __output = [], __append = __output.push.bind(__output);',
              'var __lines, __filename, __line;',
              'try {',
              'with(locals || {}) {',
              m[2],
              '}',
              'return __output.join("");',
              '} catch(e) {',
              'rethrow(e, __lines, __filename, __line, escapeFn);',
              '}'
            ].join('\n')
          );
          // callback
          return this.apply(wrapper, [
            args,
            locals,
            opt,
            function() {
              for(var i = 0; i < params.length; i++) {
                if (params[i] != "") {
                  locals[params[i]] = arguments[i];
                }
              }
              return cb(
                opt.escape || ejs.escapeXML,
                wrapper.rethrow,
                locals
              );
            }
          ]);
        }.bind(hookCallback[k]);
      }
      for(var k in hookFunction) {
        scope[k] = function() {
          return hookFunction[this.toString()].apply(wrapper, [
            Array.prototype.slice.call(arguments),
            locals,
            opt
          ]);
        }.bind(k);
      }
      // inject the current scope
      locals = Object.assign(locals, scope);
      var output = fn.apply(this, [locals]);
      if (locals._stack.length > 0) {
        locals._stack.forEach(function(cb) {
          var result = hookOutput[cb.name].apply(
            wrapper, [
              cb.args,
              locals,
              opt,
              output
            ]
          );
          if (result !== null) {
            output = result;
          }
        });
      }
      // preserve state
      for(var k in locals) {
        if (!scope.hasOwnProperty(k)) {
          state[k] = locals[k];
        }
      }
      return output;
    };
  };
};

// proxy the EJS lib (by default)
wrapper.proxy(require('ejs'));

/**
 * copy of helper
 */
wrapper.rethrow = function(err, str, flnm, lineno, esc){
  var lines = str.split('\n');
  var start = Math.max(lineno - 3, 0);
  var end = Math.min(lines.length, lineno + 3);
  var filename = esc(flnm); // eslint-disable-line
  // Error context
  var context = lines.slice(start, end).map(function (line, i){
    var curr = i + start + 1;
    return (curr == lineno ? ' >> ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'ejs') + ':'
    + lineno + '\n'
    + context + '\n\n'
    + err.message;

  throw err;
};

/**
 * Helper for rendering a file and return its contents
 */
wrapper.renderFileSync = function(filename, locals, opts) {
  var output = null;
  this.renderFile(filename, locals, opts, function(err, out) {
    if (err) {
      throw err;
    } else {
      output = out;
    }
  });
  return output;
};

/**
 * Defines an output hook
 */
wrapper.hookOutput = function(name, cb) {
  if (
    hookOutput.hasOwnProperty(name) ||
    hookCallback.hasOwnProperty(name) ||
    hookFunction.hasOwnProperty(name)
  ) {
    throw new Error("Hook " + name + " already defined");
  }
  hookOutput[name] = cb;
};

/**
 * Defines an callback hook
 */
wrapper.hookCallback = function(name, cb) {
  if (
    hookOutput.hasOwnProperty(name) ||
    hookCallback.hasOwnProperty(name) ||
    hookFunction.hasOwnProperty(name)
  ) {
    throw new Error("Hook " + name + " already defined");
  }
  hookCallback[name] = cb;
};

wrapper.registerFunction = function(name, cb) {
  if (
    hookOutput.hasOwnProperty(name) ||
    hookCallback.hasOwnProperty(name) ||
    hookFunction.hasOwnProperty(name)
  ) {
    throw new Error("Hook " + name + " already defined");
  }
  hookFunction[name] = cb;
};


// register default hooks
require('./src/layout')(wrapper);
require('./src/block')(wrapper);
require('./src/helper')(wrapper);

module.exports = wrapper;