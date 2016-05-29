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

  /**
   * Check if a scheme is valid.
   * @param  {Object} scheme the scheme to check.
   * @return {Boolean}       true if the scheme is valid, false otherwise.
   */
  validScheme(scheme) {
    if (!scheme) return false;
    if (!scheme.show || !scheme.exists) return false;

    return true;
  },

  /**
   * Check the status of an item.
   * @param  {String}   item   the item key to check.
   * @param  {Object=}  scheme the scheme to use if given.
   * @return {Boolean}         true if shown, false otherwise.
   */
  checkStatus(item, scheme) {
    if (scheme) return scheme.show(item, internals.deployTime);
    return internals.scheme.show(item, internals.deployTime);
  },

  /**
   * Check the existence of an item.
   * @param  {String}   item   the item key to check.
   * @param  {Object=}  scheme the scheme to use if given.
   * @return {Boolean}         true if exists, false otherwise.
   */
  checkExists(item, scheme) {
    if (scheme) return scheme.show(item, internals.deployTime);
    return internals.scheme.exists(item, internals.deployTime);
  },
};

schemer.register.attributes = {
  name: 'schemer',
  version: '1.0.0',
};


module.exports = schemer;
