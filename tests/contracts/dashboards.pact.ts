import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import path from 'path';
import axios from 'axios';

const provider = new PactV3({
  consumer: 'web-admin',
  provider: 'api-core',
  dir: path.resolve(process.cwd(), 'tests/contracts/pacts'),
});

describe('Dashboards API Pact Test', () => {
  it('should verify executive dashboard request', async () => {
    provider.addInteraction({
      states: [{ description: 'data exists for tenant' }],
      uponReceiving: 'a request for executive dashboard KPIs',
      withRequest: {
        method: 'GET',
        path: '/v1/dashboards/executive',
        headers: {
          'Authorization': 'Bearer mock-token',
        },
      },
      willRespondWith: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          monthlyRevenue: MatchersV3.number(298500.0),
          operationalCost: MatchersV3.number(142100.0),
          activeClients: MatchersV3.integer(42),
          riskLevel: MatchersV3.string('LOW'),
        },
      },
    });

    await provider.executeTest(async (mockServer) => {
      const response = await axios.get(`${mockServer.url}/v1/dashboards/executive`, {
        headers: {
          'Authorization': 'Bearer mock-token',
        },
      });

      expect(response.status).toBe(200);
      expect(response.data.monthlyRevenue).toBe(298500.0);
    });
  });
});
