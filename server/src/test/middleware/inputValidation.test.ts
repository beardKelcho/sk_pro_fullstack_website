import { Request, Response } from 'express';
import { sanitizeInput } from '../../middleware/inputValidation';

describe('sanitizeInput', () => {
  it('nested body ve query stringlerini recursive sanitize etmeli', () => {
    const req = {
      body: {
        title: '<script>alert(1)</script><p>Temiz</p>',
        nested: {
          note: '<img src=x onerror=alert(1) /><strong>Not</strong>',
        },
        list: ['<a href="javascript:alert(1)">link</a>'],
      },
      query: {
        search: '<img src=x onerror=alert(1) />',
      },
    } as unknown as Request;
    const res = {} as Response;
    const next = jest.fn();

    sanitizeInput(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(String(req.body.title)).not.toContain('<script');
    expect(String(req.body.nested.note)).toContain('<strong>Not</strong>');
    expect(String(req.body.nested.note)).not.toContain('onerror');
    expect(String(req.body.list[0])).not.toContain('javascript:');
    expect(String(req.query.search)).not.toContain('<img');
  });
});
