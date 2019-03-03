'use strict';
var path = require('path');
module.exports = function(ejs) {
  ejs.hookCallback('helper', function(args, locals, options, cb) {
    var name = args[0];
    locals[name] = cb;
  });
  /**
   * Overwrite the default include callback in order to share locals state between includes
   */
  ejs.registerFunction('include', function(args, locals, options) {
    var file;
    if (args[0].substring(0, 1) === '/') {
      file = this.resolveInclude(
        path.join(options.views, args[0].substring(1)),
        options.filename
      );
    } else {
      file = this.resolveInclude(args[0], options.filename);
    }
    if (args.length > 1 && typeof args[1] === 'object') {
      for(var k in args[1]) {
        locals[k] = args[1][k];
      }
    }
    return this.renderFileSync(file, locals, options);
  });
};