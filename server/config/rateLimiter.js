import RateLimit from 'express-rate-limit';

// TODO: Change production to 100
export default new RateLimit({
  windowMs: 15 * 9999999 * 1000, // 15 minutes
  max: process.env.NODE === 'production' ? 1000 : 1000, // limit each IP to 100 requests per windowMs
  delayMs: 0 // disable delaying - full speed until the max limit is reached
});