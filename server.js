var fs = require('fs');
var dot = require('dot');
var template = fs.readFileSync(__dirname + '/index.dot', 'utf-8');
var compiled = dot.template(template);

module.exports = function ImageAttributeBlock() {
  return {
    load: function(content) {
      if (content) return compiled(content);
      return content;
    }
  }
};
