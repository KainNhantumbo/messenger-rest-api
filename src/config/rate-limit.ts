import { rateLimit, RateLimitRequestHandler } from 'express-rate-limit';
import { eventLogger } from '../middlewares/logger';

const rateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 60 seconds.',
  handler: (req, res, next, options) => {
    eventLogger({
      message: `Too may requests: ${options.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
      fileName: 'rate-limiter.log',
    });
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default rateLimiter;
