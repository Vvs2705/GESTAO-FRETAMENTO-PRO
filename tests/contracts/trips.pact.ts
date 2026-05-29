import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import path from 'path';
import axios from 'axios';

const provider = new PactV3({
  consumer: 'web-admin',
  provider: 'api-core',
  dir: path.resolve(process.cwd(), 'tests/contracts/pacts'),
});

describe('Trips API Pact Test', () => {
  it('should verify create trip request', async () => {
    provider.addInteraction({
      states: [{ description: 'fleet and driver available' }],
      uponReceiving: 'a request to create a trip',
      withRequest: {
        method: 'POST',
        path: '/v1/trips',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
        body: {
          clientId: 'client_1',
          routeId: 'route_1',
          scheduledStartAt: '2026-06-01T10:00:00Z',
        },
      },
      willRespondWith: {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          id: MatchersV3.string('trip_123'),
          clientId: MatchersV3.string('client_1'),
          routeId: MatchersV3.string('route_1'),
          status: MatchersV3.string('DRAFT'),
        },
      },
    });

    await provider.executeTest(async (mockServer) => {
      const response = await axios.post(`${mockServer.url}/v1/trips`, {
        clientId: 'client_1',
        routeId: 'route_1',
        scheduledStartAt: '2026-06-01T10:00:00Z',
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      });

      expect(response.status).toBe(201);
      expect(response.data.id).toBe('trip_123');
    });
  });
});
