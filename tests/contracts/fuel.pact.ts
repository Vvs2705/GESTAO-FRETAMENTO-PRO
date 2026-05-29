import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import path from 'path';
import axios from 'axios';

const provider = new PactV3({
  consumer: 'web-admin',
  provider: 'api-core',
  dir: path.resolve(process.cwd(), 'tests/contracts/pacts'),
});

describe('Fuel API Pact Test', () => {
  it('should verify record fuel supply request', async () => {
    provider.addInteraction({
      states: [{ description: 'vehicle exists' }],
      uponReceiving: 'a request to record fuel supply',
      withRequest: {
        method: 'POST',
        path: '/v1/fuel-records',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
        body: {
          vehicleId: 'vehicle_1',
          odometer: 12500.5,
          liters: 45.2,
          totalAmount: 250.00,
        },
      },
      willRespondWith: {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          id: MatchersV3.string('fuel_123'),
          vehicleId: MatchersV3.string('vehicle_1'),
          anomalyFlag: MatchersV3.boolean(false),
        },
      },
    });

    await provider.executeTest(async (mockServer) => {
      const response = await axios.post(`${mockServer.url}/v1/fuel-records`, {
        vehicleId: 'vehicle_1',
        odometer: 12500.5,
        liters: 45.2,
        totalAmount: 250.00,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      });

      expect(response.status).toBe(201);
      expect(response.data.id).toBe('fuel_123');
    });
  });
});
