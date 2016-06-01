import request from 'reqwest';
import config from '../config';

const server = config.server;
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
      withCredentials: true,
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

  invalidateCookie(surveyId) {
    return request({
      method: 'GET',
      url: `${path}/surveys/${surveyId}/invalidate`,
      crossOrigin: true,
      withCredentials: true,
    });
  },
};
