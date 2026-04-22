'use strict';

const includeApiKey = (request, z, bundle) => {
  const apiKey = bundle?.authData?.apiKey;

  if (typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    throw new z.errors.Error(
      'Missing API key. Please reconnect your You.com account and provide a valid API key.',
      'AuthenticationError',
      401
    );
  }

  request.headers = request.headers || {};
  request.headers['X-API-Key'] = apiKey.trim();
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

  if (response.status === 429) {
    const retryAfter = response.headers?.['retry-after'] || response.headers?.['Retry-After'];
    const retryHint = retryAfter ? ` Retry after ${retryAfter} seconds.` : '';

    throw new z.errors.Error(
      `Rate limit exceeded by You.com API.${retryHint}`,
      'RateLimitError',
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
