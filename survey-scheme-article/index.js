const co = require('co');
const moment = require('moment');

function check(item, deployTime) {
  // Check if published before deploy
  if (moment(item.date).isBefore(deployTime)) {
    return false;
  }

  return true;
}

function scheme(onRetrieve) {
  return {
    show(key, deployTime) {
      return co(function* show() {
        const item = yield onRetrieve(key);
        if (!item) return false;

        return check(item, deployTime);
      });
    },

    exists(key) {
      return co(function* exists() {
        const item = yield onRetrieve(key);
        return !!item;
      });
    },
  };
}

module.exports = scheme;
