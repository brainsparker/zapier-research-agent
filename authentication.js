'use strict';

const test = async (z) => {
  const response = await z.request({
    method: 'POST',
    url: 'https://api.you.com/v1/deep_search',
    headers: { 'Content-Type': 'application/json' },
    body: { query: 'test', search_effort: 'low' },
  });

  if (response.status !== 200) {
    throw new z.errors.Error(
      'Authentication failed. Please check your API key.',
      'AuthenticationError',
      response.status
    );
  }

  return response.data;
};

module.exports = {
  type: 'custom',
  fields: [
    {
      key: 'apiKey',
      label: 'API Key',
      type: 'string',
      required: true,
      helpText:
        'Your You.com API key. Find it at [you.com/api](https://you.com/api).',
    },
  ],
  test,
  connectionLabel: 'You.com Deep Search',
};
