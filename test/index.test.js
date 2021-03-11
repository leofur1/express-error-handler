/* eslint-disable no-underscore-dangle */

'use strict';

const httpMocks = require('node-mocks-http');
const errorHandler = require('../index');

describe('HTTP Handler an JSON error', () => {
  test('When no args passed, should return default error object', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const error = new Error();

    errorHandler()(error, req, res, {});

    const response = JSON.parse(res._getData());

    expect(response.error.code).toEqual('INTERNAL_SERVER_ERROR');
    expect(response.error.status_code).toEqual(500);
  });

  test('When sent code 400, should return code 400', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const error = new Error();
    error.code = 400;

    errorHandler()(error, req, res, {});

    const response = JSON.parse(res._getData());

    expect(response.error.code).toEqual('BAD_REQUEST');
    expect(response.error.status_code).toEqual(400);
  });

  test('When sent code 400 with custom message, should return code 400 and custom message', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const error = new Error('Missing fields: [name]');
    error.code = 400;

    errorHandler()(error, req, res, {});

    const response = JSON.parse(res._getData());
    expect(response.error.code).toEqual('BAD_REQUEST');
    expect(response.error.message).toEqual('Missing fields: [name]');
    expect(response.error.status_code).toEqual(400);
  });

  test('When log=true, should log with stderr', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const error = new Error();
    error.code = 400;

    errorHandler({ log: true })(error, req, res, {});

    const response = JSON.parse(res._getData());
    expect(response.error.code).toEqual('BAD_REQUEST');
    expect(response.error.status_code).toEqual(400);
  });

  test('When debug=true, should returns full error stack traces', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const error = new Error();
    error.code = 500;

    errorHandler({ debug: true })(error, req, res, {});

    const response = JSON.parse(res._getData());
    expect(response.error.stack).toBeDefined();
  });

  test('When defined custom function, should use custom log function', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const error = new Error();
    error.code = 500;

    errorHandler({
      log: (err, obj) => {
        obj.error.message = 'Using custom log function.';
      },
    })(error, req, res, {});

    const response = JSON.parse(res._getData());
    expect(response.error.message).toEqual('Using custom log function.');
    expect(response.error.code).toEqual('INTERNAL_SERVER_ERROR');
    expect(response.error.status_code).toEqual(500);
  });

  test('When defined camel_case=true, should use camelCase response object', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const error = new Error();

    errorHandler({ camel_case: true })(error, req, res, {});

    const response = JSON.parse(res._getData());
    expect(response.error.statusCode).toBeDefined();
  });
});
