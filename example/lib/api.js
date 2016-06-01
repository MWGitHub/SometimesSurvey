import request from 'reqwest';

const server = 'http://localhost:6005';
const path = `${server}/v1`;

export default {
  fetchSurvey(name) {
    return request({
      method: 'GET',
      url: `${path}/surveys/${name}`,
      crossOrigin: true,
    });
  },

  fetchStatus(surveyId, itemId) {
    return request({
      method: 'GET',
      url: `${path}/surveys/${surveyId}/items/${itemId}/status`,
      crossOrigin: true,
    });
  },

  postEvent(surveyId, itemId, data) {
    return request({
      method: 'POST',
      url: `${path}/surveys/${surveyId}/items/${itemId}/events`,
      crossOrigin: true,
      withCredentials: true,
      data: {
        event: data.event,
        data: JSON.stringify(data.data),
      },
    });
  },
};
