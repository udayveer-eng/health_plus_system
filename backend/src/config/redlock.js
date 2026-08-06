import Redis from 'ioredis';
import Redlock from 'redlock';

// Create a Redis client instance
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('error', (err) => {
  console.error('ioredis Client Error:', err.message);
});

// Configure Redlock
const redlock = new Redlock(
  [redis],
  {
    driftFactor: 0.01,
    retryCount: 3,
    retryDelay: 200,
    retryJitter: 200,
    automaticExtensionThreshold: 500,
  }
);

redlock.on('clientError', function (err) {
  console.error('A redlock error has occurred:', err);
});

export default redlock;
