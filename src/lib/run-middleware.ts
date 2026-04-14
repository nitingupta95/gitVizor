import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';

type Middleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  callback: (result: any) => void
) => void;

/**
 * Helper method to wait for a middleware to execute before continuing.
 * And to throw an error on any middleware error
 * @param req The request object
 * @param res The response object
 * @param fn The middleware function
 */
export function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Middleware
): Promise<any> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}
