var ejs = require('../');
ejs.renderFile(
  __dirname + '/views/index.ejs',
  {
    foo: 'bar'
  }, 
  {
    views: __dirname + '/views'
  },
  function(err, out) {
    if (err) {
      console.error(err);
    } else {
      console.log(out);
    }
  }
);