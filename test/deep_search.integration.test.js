'use strict';

const zapier = require('zapier-platform-core');
const App = require('../index');

const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

jest.setTimeout(30000);

describe('deep_search integration', () => {
  const apiKey = process.env.YOU_API_KEY;

  beforeAll(() => {
    if (!apiKey) {
      throw new Error('YOU_API_KEY must be set in .env to run integration tests');
    }
  });

  it('authenticates successfully', async () => {
    const bundle = { authData: { apiKey } };
    const result = await appTester(App.authentication.test, bundle);
    expect(result).toBeDefined();
    expect(result.answer).toBeDefined();
  });

  it('performs a deep search with low effort', async () => {
    const bundle = {
      authData: { apiKey },
      inputData: {
        query: 'What is the capital of France?',
        search_effort: 'low',
      },
    };

    const result = await appTester(
      App.creates.deep_search.operation.perform,
      bundle
    );

    expect(result.answer).toBeDefined();
    expect(result.answer.length).toBeGreaterThan(0);
    expect(result.results_count).toBeGreaterThanOrEqual(0);
    expect(typeof result.first_result_url).toBe('string');
    expect(typeof result.first_result_title).toBe('string');
  });

  it('defaults to low effort when not specified', async () => {
    const bundle = {
      authData: { apiKey },
      inputData: {
        query: 'What is 2+2?',
      },
    };

    const result = await appTester(
      App.creates.deep_search.operation.perform,
      bundle
    );

    expect(result.answer).toBeDefined();
  });
});
