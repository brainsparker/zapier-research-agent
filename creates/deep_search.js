'use strict';

const ALLOWED_SEARCH_EFFORTS = new Set(['low', 'medium', 'high']);

const normalizeQuery = (query, z) => {
  const normalized = typeof query === 'string' ? query.trim() : '';
  if (!normalized) {
    throw new z.errors.Error(
      'Query is required and cannot be empty.',
      'ValidationError',
      400
    );
  }
  return normalized;
};

const normalizeSearchEffort = (searchEffort) => {
  if (typeof searchEffort !== 'string') {
    return 'low';
  }
  const normalized = searchEffort.trim().toLowerCase();
  return ALLOWED_SEARCH_EFFORTS.has(normalized) ? normalized : 'low';
};

const perform = async (z, bundle) => {
  const query = normalizeQuery(bundle.inputData?.query, z);
  const searchEffort = normalizeSearchEffort(bundle.inputData?.search_effort);

  const response = await z.request({
    method: 'POST',
    url: 'https://api.you.com/v1/deep_search',
    headers: { 'Content-Type': 'application/json' },
    body: {
      query,
      search_effort: searchEffort,
    },
  });

  const data = response?.data && typeof response.data === 'object' ? response.data : {};
  const sourceResults = Array.isArray(data.results) ? data.results : [];

  const results = sourceResults.map((r) => ({
    url: r?.url || '',
    title: r?.title || '',
    snippets: Array.isArray(r?.snippets) ? r.snippets : [],
  }));

  return {
    answer: typeof data.answer === 'string' ? data.answer : '',
    results,
    results_count: results.length,
    first_result_url: results.length > 0 ? results[0].url : '',
    first_result_title: results.length > 0 ? results[0].title : '',
  };
};

module.exports = {
  key: 'deep_search',
  noun: 'Deep Search',
  display: {
    label: 'Deep Search',
    description:
      'Perform a comprehensive research query using You.com Deep Search and get back a cited answer.',
  },
  operation: {
    inputFields: [
      {
        key: 'query',
        label: 'Query',
        type: 'text',
        required: true,
        helpText: 'The research question you want answered.',
      },
      {
        key: 'search_effort',
        label: 'Search Effort',
        type: 'string',
        required: false,
        default: 'low',
        choices: {
          low: 'Low (fastest, < 30s — recommended for Zapier)',
          medium: 'Medium (may exceed Zapier 30s timeout)',
          high: 'High (thorough, likely exceeds 30s timeout)',
        },
        helpText:
          'How much effort to put into the search. "Low" is recommended to stay within Zapier\'s 30-second timeout.',
      },
    ],
    perform,
    sample: {
      answer:
        'Deep learning is a subset of machine learning that uses neural networks with multiple layers.',
      results: [
        {
          url: 'https://example.com/deep-learning',
          title: 'What is Deep Learning?',
          snippets: ['Deep learning uses multi-layered neural networks...'],
        },
      ],
      results_count: 1,
      first_result_url: 'https://example.com/deep-learning',
      first_result_title: 'What is Deep Learning?',
    },
    outputFields: [
      { key: 'answer', label: 'Answer', type: 'string' },
      { key: 'results[]url', label: 'Result URL', type: 'string' },
      { key: 'results[]title', label: 'Result Title', type: 'string' },
      { key: 'results[]snippets[]', label: 'Result Snippet', type: 'string' },
      { key: 'results_count', label: 'Results Count', type: 'integer' },
      { key: 'first_result_url', label: 'First Result URL', type: 'string' },
      {
        key: 'first_result_title',
        label: 'First Result Title',
        type: 'string',
      },
    ],
  },
};
