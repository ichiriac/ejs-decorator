module.exports = function(ejs) {
  
  ejs.hookCallback('block', function(args, locals, options, cb) {
    var name = args[0];
    if (!locals.hasOwnProperty('_blocks')) {
      locals._blocks = {};
    }
    if (!locals._blocks.hasOwnProperty(name)) {
      locals._blocks[name] = [];
    }
    locals._blocks[name].push(cb());
  });
  ejs.registerFunction('render', function(args, locals, options) {
    var name = args[0];
    if (locals.hasOwnProperty('_blocks') && locals._blocks.hasOwnProperty(name)) {
      return locals._blocks[name].join("\n");
    }
  });
};