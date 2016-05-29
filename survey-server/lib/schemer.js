const internals = {};

internals.simple = {
  show() {
    return Promise.resolve(true);
  },

  exists() {
    return Promise.resolve(true);
  },
};

const schemer = {
  register(server, options, next) {
    internals.scheme = options.scheme || internals.simple;
    internals.deployTime = options.deployTime || Date.now();

    if (!schemer.validScheme(internals.scheme)) {
      throw new TypeError('Invalid scheme format');
    }

    next();
  },

  validScheme(scheme) {
    if (!scheme) return false;
    if (!scheme.show || !scheme.exists) return false;

    return true;
  },

  checkStatus(item) {
    return internals.scheme.show(item, internals.deployTime);
  },

  checkExists(item) {
    return internals.scheme.exists(item, internals.deployTime);
  },
};

schemer.register.attributes = {
  name: 'schemer',
  version: '1.0.0',
};


module.exports = schemer;
