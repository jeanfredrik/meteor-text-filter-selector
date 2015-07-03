
var quote = function(str) {
	return (str+'').replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
};

function isBlank(str) {
  return (/^\s*$/).test(str);
};

var nativeTrim = String.prototype.trim;
function trim(str) {
  if(nativeTrim) return nativeTrim.call(str);
  return str.replace(/^\s+|\s+$/g, '');
};

function words(str) {
  if(isBlank(str)) return [];
  return trim(str).split(/\s+/);
};

function regex(word, mustStart, caseSensitive) {
	return {$regex: (mustStart ? '\\b' : '')+quote(word), $options: (caseSensitive ? '': 'i')};
}

TextFilterSelector = function(field, options) {
	options = options || {};
	_.defaults(options, TextFilterSelector.defaultOptions);
	this._mustStart = options.mustStart;
	this._caseSensitive = options.caseSensitive;
	this._field = field;
	this._textDep = new Tracker.Dependency;
	this._words = [];
	this._wordsDep = new Tracker.Dependency;
	this._selector = {};
	this._selectorDep = new Tracker.Dependency;
}

TextFilterSelector.prototype.set = function(value) {
	if(_.isString(value)) {
		if(this._text !== value) {
			this._text = value;
			this._textDep.changed();
			var newWords = words(value);
			if(!EJSON.equals(newWords, this._words)) {
				this._words = newWords;
				this._wordsDep.changed();
				this._updateSelector();
			}
		}
	} else if(_.isArray(value)) {
		if(!EJSON.equals(value, this._words)) {
			this._text = value.join(' ');
			this._textDep.changed();
			this._words = value;
			this._wordsDep.changed();
			this._updateSelector();
		}
	}
}
TextFilterSelector.prototype.setOption = function(option, value) {
	if(this['_'+option] !== value) {
		this['_'+option] = value;
		this._updateSelector();
	}
}
TextFilterSelector.prototype.get = function() {
	return this.getSelector.apply(this, arguments);
}
TextFilterSelector.prototype.getSelector = function() {
	var self = this;
	self._selectorDep.depend();
	return self._selector;
}
TextFilterSelector.prototype.getText = function() {
	var self = this;
	self._textDep.depend();
	return self._text;
}
TextFilterSelector.prototype._updateSelector = function() {
	var self = this;
	var newSelector;
	if(self._words.length == 0) {
		newSelector = {};
	} else if(self._words.length == 1) {
		newSelector = {};
		newSelector[self._field] = regex(self._words[0], self._mustStart, self._caseSensitive);
	} else {
		newSelector = {$and: _.map(self._words, function(word) {
			var result = {};
			result[self._field] = regex(word, self._mustStart, self._caseSensitive);
			return result;
		})};
	}
	if(!EJSON.equals(self._selector, newSelector)) {
		self._selector = newSelector;
		self._selectorDep.changed();
	}
}

TextFilterSelector.defaultOptions = {
	caseSensitive: false,
	mustStart: true,
}
