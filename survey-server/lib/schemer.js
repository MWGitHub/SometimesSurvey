const assert = require('assert');

const internals = {};

internals.simple = {
  show() {
    return true;
  },
};

const schemer = {
  register(plugin, options, next) {
    internals.scheme = options.scheme || internals.simple;
    assert.ok(internals.scheme);

    if (!schemer.validScheme(internals.scheme)) {
      throw new TypeError('Invalid scheme format');
    }

    next();
  },

  validScheme(scheme) {
    if (!scheme) return false;
    if (!scheme.show) return false;

    return true;
  },

  checkStatus(item) {
    return internals.scheme.show(item);
  },
};

schemer.register.attributes = {
  name: 'schemer',
  version: '1.0.0',
};


module.exports = schemer;
