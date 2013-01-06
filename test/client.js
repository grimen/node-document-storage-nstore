
module.exports = {
  get: function(db, type, id, callback) {
    var key = [type, id].join('/');

    var client = process.client;

    client.get(key, function(err, res) {
      callback(err, res || null);
    });
  },

  set: function(db, type, id, data, callback) {
    var key = [type, id].join('/');

    var client = process.client;

    client.save(key, data, function(err, res) {
      callback(err, res || null);
    });
  },

  del: function(db, type, id, callback) {
    var key = [type, id].join('/');

    var client = process.client;

    client.remove(key, function(err, res) {
      callback(err, res || null);
    });
  },

  exists: function(db, type, id, callback) {
    var key = [type, id].join('/');

    var client = process.client;

    client.get(key, function(err, res) {
      callback(err, res || null);
    });
  }
};
