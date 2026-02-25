'use strict';

const zapier = require('zapier-platform-core');
const App = require('../index');

const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

describe('deep_search action', () => {
  it('sends correct request shape', async () => {
    const bundle = {
      authData: { apiKey: 'test-key' },
      inputData: {
        query: 'What is quantum computing?',
        search_effort: 'medium',
      },
    };

    let capturedRequest;
    const originalRequest = appTester;

    // We'll test the perform function directly with a mock z
    const { perform } = require('../creates/deep_search').operation;

    const mockZ = {
      request: async (req) => {
        capturedRequest = req;
        return {
          status: 200,
          data: {
            answer: 'Quantum computing uses qubits.',
            results: [
              {
                url: 'https://example.com/qc',
                title: 'Quantum Computing',
                snippets: ['Qubits are...'],
              },
            ],
          },
        };
      },
    };

    await perform(mockZ, bundle);

    expect(capturedRequest.method).toBe('POST');
    expect(capturedRequest.url).toBe(
      'https://api.you.com/v1/deep_search'
    );
    expect(capturedRequest.body.query).toBe('What is quantum computing?');
    expect(capturedRequest.body.search_effort).toBe('medium');
  });

  it('defaults search_effort to low', async () => {
    const { perform } = require('../creates/deep_search').operation;

    let capturedRequest;
    const mockZ = {
      request: async (req) => {
        capturedRequest = req;
        return {
          status: 200,
          data: { answer: 'Test', results: [] },
        };
      },
    };

    const bundle = {
      inputData: { query: 'test query' },
    };

    await perform(mockZ, bundle);

    expect(capturedRequest.body.search_effort).toBe('low');
  });

  it('transforms response with convenience fields', async () => {
    const { perform } = require('../creates/deep_search').operation;

    const mockZ = {
      request: async () => ({
        status: 200,
        data: {
          answer: 'The answer is 42.',
          results: [
            {
              url: 'https://example.com/first',
              title: 'First Result',
              snippets: ['snippet one'],
            },
            {
              url: 'https://example.com/second',
              title: 'Second Result',
              snippets: ['snippet two'],
            },
          ],
        },
      }),
    };

    const bundle = { inputData: { query: 'test' } };
    const result = await perform(mockZ, bundle);

    expect(result.answer).toBe('The answer is 42.');
    expect(result.results).toHaveLength(2);
    expect(result.results[0].url).toBe('https://example.com/first');
    expect(result.results[0].title).toBe('First Result');
    expect(result.results[0].snippets).toEqual(['snippet one']);
    expect(result.results_count).toBe(2);
    expect(result.first_result_url).toBe('https://example.com/first');
    expect(result.first_result_title).toBe('First Result');
  });

  it('handles empty results gracefully', async () => {
    const { perform } = require('../creates/deep_search').operation;

    const mockZ = {
      request: async () => ({
        status: 200,
        data: { answer: 'No sources found.', results: [] },
      }),
    };

    const bundle = { inputData: { query: 'obscure query' } };
    const result = await perform(mockZ, bundle);

    expect(result.answer).toBe('No sources found.');
    expect(result.results).toEqual([]);
    expect(result.results_count).toBe(0);
    expect(result.first_result_url).toBe('');
    expect(result.first_result_title).toBe('');
  });

  it('handles missing results field', async () => {
    const { perform } = require('../creates/deep_search').operation;

    const mockZ = {
      request: async () => ({
        status: 200,
        data: { answer: 'Just an answer.' },
      }),
    };

    const bundle = { inputData: { query: 'test' } };
    const result = await perform(mockZ, bundle);

    expect(result.results).toEqual([]);
    expect(result.results_count).toBe(0);
    expect(result.first_result_url).toBe('');
    expect(result.first_result_title).toBe('');
  });
});
