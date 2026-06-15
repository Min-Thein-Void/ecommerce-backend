import { JwtStrategy } from './jwt.strategy.js';

describe('JwtStrategy', () => {
  it('should be defined', () => {
    expect(new JwtStrategy()).toBeDefined();
  });
});
