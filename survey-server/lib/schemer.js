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
    internals.schemes = options.schemes || { simple: internals.simple };
    internals.deployTime = options.deployTime || Date.now();

    for (let i = 0, keys = Object.keys(internals.schemes); i < keys.length; ++i) {
      const scheme = internals.schemes[keys[i]];
      if (!schemer.validScheme(scheme)) {
        throw new TypeError('Invalid scheme format');
      }
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
   * @param  {String}          item   the item key to check.
   * @param  {Object|String=}  scheme the scheme or scheme key to use if given.
   * @return {Boolean}         true if shown, false otherwise.
   */
  checkStatus(item, scheme) {
    if (scheme) {
      if (typeof scheme === 'string') {
        if (!internals.schemes[scheme]) return false;

        return internals.schemes[scheme].show(item, internals.deployTime);
      }
      return scheme.show(item, internals.deployTime);
    }
    return internals.scheme.show(item, internals.deployTime);
  },

  /**
   * Check the existence of an item.
   * @param  {String}   item          the item key to check.
   * @param  {Object|String=}  scheme the scheme or scheme key to use if given.
   * @return {Boolean}         true if exists, false otherwise.
   */
  checkExists(item, scheme) {
    if (scheme) {
      if (typeof scheme === 'string') {
        if (!internals.schemes[scheme]) return false;

        return internals.schemes[scheme].exists(item, internals.deployTime);
      }
      return scheme.exists(item, internals.deployTime);
    }
    return internals.scheme.exists(item, internals.deployTime);
  },
};

schemer.register.attributes = {
  name: 'schemer',
  version: '1.0.0',
};


module.exports = schemer;
