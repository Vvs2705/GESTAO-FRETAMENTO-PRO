import { Verifier } from '@pact-foundation/pact';
import path from 'path';

describe('Pact Provider Verification', () => {
  it('should validate the consumer pacts against local provider endpoints', async () => {
    const opts = {
      provider: 'api-core',
      providerBaseUrl: process.env.PROVIDER_BASE_URL || 'http://localhost:3000',
      pactUrls: [
        path.resolve(process.cwd(), 'tests/contracts/pacts/auth.json'),
        path.resolve(process.cwd(), 'tests/contracts/pacts/trips.json'),
        path.resolve(process.cwd(), 'tests/contracts/pacts/fuel.json'),
        path.resolve(process.cwd(), 'tests/contracts/pacts/dashboards.json'),
      ],
      stateHandlers: {
        'user exists': async () => {
          return Promise.resolve('State handler: user exists');
        },
        'fleet and driver available': async () => {
          return Promise.resolve('State handler: fleet and driver available');
        },
        'vehicle exists': async () => {
          return Promise.resolve('State handler: vehicle exists');
        },
        'data exists for tenant': async () => {
          return Promise.resolve('State handler: data exists for tenant');
        },
      },
    };

    if (process.env.RUN_PACT_VERIFICATION === 'true') {
      await new Verifier(opts).verifyProvider();
    } else {
      console.log('Skipping Pact verification. Set RUN_PACT_VERIFICATION=true to run.');
    }
  });
});
