module.exports = function(ejs) {
  ejs.hookCallback('helper', function(args, locals, options, cb) {
    var name = args[0];
    locals[name] = cb;
  });
  /**
   * Overwrite the default include callback in order to share locals state between includes
   */
  ejs.registerFunction('include', function(args, locals, options) {
    var file = this.resolveInclude(args[0], options.filename);
    return this.renderFileSync(file, locals, options);
  });
};