'use strict';

const includeApiKey = (request, z, bundle) => {
  request.headers['X-API-Key'] = bundle.authData.apiKey;
  return request;
};

const handleErrors = (response, z) => {
  if (response.status === 401) {
    throw new z.errors.Error(
      'Invalid API key. Please check your You.com API key and try again.',
      'AuthenticationError',
      response.status
    );
  }

  if (response.status === 403) {
    throw new z.errors.Error(
      'Insufficient scope. Your API key does not have access to the Deep Search API.',
      'AuthenticationError',
      response.status
    );
  }

  if (response.status >= 500) {
    throw new z.errors.Error(
      'You.com server error. Please try again later.',
      'ServerError',
      response.status
    );
  }

  return response;
};

module.exports = { includeApiKey, handleErrors };
