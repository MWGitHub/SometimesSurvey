module.exports = {
  validScheme(scheme) {
    if (!scheme) return false;
    if (!scheme.show) return false;

    return true;
  },

  checkStatus(item, scheme) {
    return scheme.show(item);
  },
};
