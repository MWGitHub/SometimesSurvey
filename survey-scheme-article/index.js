const co = require('co');
const moment = require('moment');
const seed = require('./seed');

function check(options, item, deployTime) {
  const old = options.old;
  const unpopular = options.unpopular;
  const unpopularHot = options.unpopularHot;
  const chance = options.chance;
  const full = options.full;

  // Check if published before deploy
  if (moment(item.date).isBefore(deployTime)) {
    return false;
  }

  // Check if too old
  if (moment(item.date).isBefore(moment().subtract(old, 'days'))) {
    return false;
  }

  // Check if too unpopular
  if (item.reads < unpopular) return false;

  // Check if too unpopular but hot
  if (item.reads >= unpopularHot.low &&
      item.reads < unpopularHot.high &&
      item.readsPerHour >= unpopularHot.perHour) {
    return false;
  }

  // Check if chance
  if (item.reads >= chance.low && item.reads <= chance.high &&
      Math.random() > chance.percent) {
    return false;
  }

  // Check if too many reads
  if (item.reads > full) {
    return false;
  }

  return true;
}

/**
 * Scheme for articles
 * @param  {function(string)}  onRetrieve the function that is called to fetch
 *                                        the item with the given key.
 *                                        Must return a promise.
 * @param  {Object=}           options    the ranges for the checks.
 * @return {Object}            the scheme.
 */
function scheme(onRetrieve, options) {
  const ranges = Object.assign({}, {
    old: 7,
    unpopular: 2000,
    unpopularHot: { low: 2000, high: 50000, perHour: 2000 },
    chance: { low: 50000, high: 1000000, percent: 0.1 },
    full: 1000000,
  }, options);

  return {
    show(key, deployTime) {
      return co(function* show() {
        const item = yield onRetrieve(key);
        if (!item) return false;

        return check(ranges, item, deployTime);
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

module.exports.scheme = scheme;
module.exports.seed = seed;
