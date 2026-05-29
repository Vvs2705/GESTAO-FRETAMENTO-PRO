import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import path from 'path';
import axios from 'axios';

const provider = new PactV3({
  consumer: 'web-admin',
  provider: 'api-core',
  dir: path.resolve(process.cwd(), 'tests/contracts/pacts'),
});

describe('Auth API Pact Test', () => {
  it('should verify login request', async () => {
    provider.addInteraction({
      states: [{ description: 'user exists' }],
      uponReceiving: 'a request for login',
      withRequest: {
        method: 'POST',
        path: '/v1/auth/login',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          email: 'admin@fretamento.com',
          role: 'admin',
        },
      },
      willRespondWith: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          accessToken: MatchersV3.string('mock-token'),
          refreshToken: MatchersV3.string('mock-refresh'),
          user: {
            id: MatchersV3.string('usr_123'),
            name: MatchersV3.string('admin'),
            email: MatchersV3.string('admin@fretamento.com'),
            role: MatchersV3.string('admin'),
            tenantId: MatchersV3.string('ten_1'),
          },
        },
      },
    });

    await provider.executeTest(async (mockServer) => {
      const response = await axios.post(`${mockServer.url}/v1/auth/login`, {
        email: 'admin@fretamento.com',
        role: 'admin',
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
      expect(response.data.accessToken).toBe('mock-token');
    });
  });
});
