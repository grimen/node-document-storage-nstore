require('sugar')
var util = require('util');

// HACK: ...until Node.js `require` supports `instanceof` on modules loaded more than once. (bug in Node.js)
var Storage = global.NodeDocumentStorage || (global.NodeDocumentStorage = require('node-document-storage'));

// -----------------------
//  DOCS
// --------------------
//  - https://github.com/creationix/nstore

// -----------------------
//  Constructor
// --------------------

// new NStore ();
// new NStore (options);
// new NStore (url);
// new NStore (url, options);
function NStore () {
  var self = this;

  self.klass = NStore;
  self.klass.super_.apply(self, arguments);
}

util.inherits(NStore, Storage);

// -----------------------
//  Class
// --------------------
NStore.id = 'nstore';
NStore.protocol = 'file';

NStore.defaults = NStore.defaults || {};
NStore.defaults.url = Storage.env('NSTORE_URL') || 'file:///tmp/{db}-{env}'.assign({
  db: 'default',
  env: (process.env.NODE_ENV || 'development')
});
NStore.defaults.options = {
  server: {
    extension: '.db',
    mode: 0777
  }
};

NStore.url = NStore.defaults.url;
NStore.options = NStore.defaults.options;

NStore.reset = Storage.reset;

// -----------------------
//  Instance
// --------------------

// #connect ()
NStore.prototype.connect = function() {
  var self = this;

  self._connect(function() {
    var nstore = require('nstore');
    var fs = require('node-fs');
    var path = require('path');

    var db = self.resource().db + self.resource().ext;

    fs.mkdir(path.dirname(db), self.options.server.mode, true, function(fs_err) {
      self.client = nstore.new(db, function(db_err) {
        self.emit('ready', fs_err || db_err);
      });
    });
  });
};

// #set (key, value, [options], callback)
// #set (keys, values, [options], callback)
NStore.prototype.set = function() {
  var self = this;

  self._set(arguments, function(key_values, options, done, next) {
    key_values.each(function(key, value) {
      self.client.save(key, value, function(error, response) {
        next(key, error, !error, response);
      });
    });
  });
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
NStore.prototype.get = function() {
  var self = this;

  self._get(arguments, function(keys, options, done, next) {
    keys.each(function(key) {
      self.client.get(key, function(error, response) {
        next(key, error, response, response);
      });
    });
  });
};

// #del (key, [options], callback)
// #del (keys, [options], callback)
NStore.prototype.del = function() {
  var self = this;

  self._del(arguments, function(keys, options, done, next) {
    keys.each(function(key) {
      self.client.remove(key, function(error, response) {
        next(key, error, !error, response);
      });
    });
  });
};

// #exists (key, [options], callback)
// #exists (keys, [options], callback)
NStore.prototype.exists = function() {
  var self = this;

  self._exists(arguments, function(keys, options, done, next) {
    keys.each(function(key) {
      self.client.get(key, function(error, response) {
        next(key, error, !!response, response);
      });
    });
  });
};

// -----------------------
//  Export
// --------------------

module.exports = NStore;
