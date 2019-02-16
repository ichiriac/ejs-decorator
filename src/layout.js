var path = require('path');
module.exports = function(ejs) {
  ejs.hookOutput('layout', function(args, locals, options, output) {
    var layout = args[0];
    var ext = path.extname(layout);
    if (!ext) {
      layout += '.ejs';
    }
    var layoutPath = options.layout || options.views || './';
    layout = path.resolve(layoutPath, layout);
    locals.contents = output;
    return this.renderFileSync(layout, locals, options);
  });
};