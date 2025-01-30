import { describe, it, expect } from 'vitest';
import rateLimit from './rate-limit';

describe('rateLimit', () => {
	it('shouldn allow requests below the limit but not above', () => {
		const limiter = rateLimit({ uniqueTokenPerInterval: 2, interval: 1000 });
		expect(limiter.check(2, 'test').isRateLimited).toBe(false);
		expect(limiter.check(2, 'test').isRateLimited).toBe(false);
		expect(limiter.check(2, 'test').isRateLimited).toBe(true);
	});
	it('should reset after the interval', async () => {
		const limiter = rateLimit({ uniqueTokenPerInterval: 2, interval: 10 });
		limiter.check(2, 'test').isRateLimited;
		limiter.check(2, 'test').isRateLimited;
		await new Promise((resolve) => setTimeout(resolve, 20));
		expect(limiter.check(2, 'test').isRateLimited).toBe(false);
	});
	it('should return the correct headers', () => {
		const limiter = rateLimit({ uniqueTokenPerInterval: 2, interval: 1000 });
		expect(limiter.check(2, 'test').headers).toEqual({
			'X-RateLimit-Limit': '2',
			'X-RateLimit-Remaining': '1',
		});
	});
});
