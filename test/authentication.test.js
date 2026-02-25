'use strict';

const { includeApiKey, handleErrors } = require('../middleware');

describe('middleware', () => {
  describe('includeApiKey', () => {
    it('injects X-API-Key header from authData', () => {
      const request = { headers: {} };
      const bundle = { authData: { apiKey: 'test-key-123' } };

      const result = includeApiKey(request, {}, bundle);

      expect(result.headers['X-API-Key']).toBe('test-key-123');
    });

    it('preserves existing headers', () => {
      const request = { headers: { 'Content-Type': 'application/json' } };
      const bundle = { authData: { apiKey: 'test-key-123' } };

      const result = includeApiKey(request, {}, bundle);

      expect(result.headers['Content-Type']).toBe('application/json');
      expect(result.headers['X-API-Key']).toBe('test-key-123');
    });
  });

  describe('handleErrors', () => {
    const z = {
      errors: {
        Error: class ZapierError extends Error {
          constructor(message, type, status) {
            super(message);
            this.type = type;
            this.status = status;
          }
        },
      },
    };

    it('passes through successful responses', () => {
      const response = { status: 200, data: { answer: 'ok' } };
      expect(handleErrors(response, z)).toBe(response);
    });

    it('throws AuthenticationError on 401', () => {
      const response = { status: 401 };
      expect(() => handleErrors(response, z)).toThrow('Invalid API key');
    });

    it('throws AuthenticationError on 403', () => {
      const response = { status: 403 };
      expect(() => handleErrors(response, z)).toThrow('Insufficient scope');
    });

    it('throws ServerError on 500', () => {
      const response = { status: 500 };
      expect(() => handleErrors(response, z)).toThrow('server error');
    });

    it('throws ServerError on 503', () => {
      const response = { status: 503 };
      expect(() => handleErrors(response, z)).toThrow('server error');
    });
  });
});
