'use strict';

const authentication = require('./authentication');
const { includeApiKey, handleErrors } = require('./middleware');
const { deepSearch } = require('./creates');

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  authentication,
  beforeRequest: [includeApiKey],
  afterResponse: [handleErrors],
  creates: {
    [deepSearch.key]: deepSearch,
  },
};
