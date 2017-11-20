// based on https://github.com/gryphonmyers/pug-multiple-basedirs-plugin/blob/master/index.js
var fs = require('fs');
var path = require('path');
//var pug = require('pug');

// Regexp escaper. See https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
function regExpEscape(literal_string) {
	return literal_string.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
}

var plugin = function (pluginOpts) {
	if (!pluginOpts) {
		pluginOpts = {};
	}
	if (!pluginOpts.files) {
		pluginOpts.files = {};
	}
	var self = this;
	self.pluginOptions = pluginOpts;
	if (self.pluginOptions.memoryPath) {
		self.pluginOptions._mpathRegexp = new RegExp('^' + regExpEscape(self.pluginOptions.memoryPath));
	}
	this.pluginObj = 
	{
		name: 'stringFiles',
/*		resolve: function (filename, source, options) {
			return filename;
		},
*/
		read: function (filename, options) {
			
			// if memoryPath option is set, only look for filenames that start with it.
			// In other words, if memoryPath is set, for example, to 'memory/', and we
			//   encounter extend layout.pug, then we will not look for layout.pug in our
			//   files. We will, however, look for extends memory/layout.pug.
			// However, when memorypath option is set, the user has the choice of storing
			//    the file contents either with or without the path.
			//    So if memory option is 'memory/' and the file is extending memory/layout.pug
			//      then we need to search our files list for either /memory/layout.pug or layout.pug.
			if (self.pluginOptions.memoryPath) {
			
				// Does filename start with memoryPath? If not, just load it. Otherwise search
				// for it in our files.
				if (filename.match(self.pluginOptions._mpathRegexp)) {
					// Filename starts with memoryPath, so search our files for it
					// First search for filename WITH memorypath
					
					if (filename in self.pluginOptions.files) {
						return self.pluginOptions.files[filename]
					}
					
					// Now search for filename WITHOUT memorypath
					var tempFilename = filename.replace(self.pluginOptions._mpathRegexp, '');
					if (tempFilename in self.pluginOptions.files) {
						return self.pluginOptions.files[tempFilename];
					}
					
					// Didn't find it so try regular filesystem
					return fs.readFileSync(filename).toString();
					
				}
				else {
					// Filename doesn't start with the memoryPath so just look on filesystem
					return fs.readFileSync(filename).toString();
				}
			}
			else {
				// No memoryPath set, so first check for file in our list. If it's
				// there, return it. If not, try file system.
				
				if (filename in self.pluginOptions.files) {
					return self.pluginOptions.files[filename];
				}
				
				// Didn't find it so try regular filesystem
				return fs.readFileSync(filename).toString();
				
			}
		}
	};
};

plugin.prototype.getOptions = function() {
	console.log(this);
	return this.pluginOptions;
}

module.exports = plugin;
