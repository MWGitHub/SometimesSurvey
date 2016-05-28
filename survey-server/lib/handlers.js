module.exports = {
  preDatabase(request, reply) {
    return reply().takeover();
  },

  getSurveys() {
    return true;
  },
};
