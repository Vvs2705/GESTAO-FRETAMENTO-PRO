import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 }, // ramp up to 20 users
    { duration: '30s', target: 20 }, // stay at 20 users
    { duration: '10s', target: 0 },  // ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests must complete under 1s
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export function setup() {
  // 1. Log in to get accessToken
  const loginUrl = `${BASE_URL}/v1/auth/login`;
  const payload = JSON.stringify({
    email: 'admin@alfafretamento.com.br',
    password: 'Admin@2026!',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const loginRes = http.post(loginUrl, payload, params);
  const token = loginRes.json().accessToken;

  // 2. Fetch list of vehicles to use their IDs
  const vehiclesRes = http.get(`${BASE_URL}/v1/vehicles?limit=50`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  const vehicles = vehiclesRes.json().data || [];
  const vehicleIds = vehicles.map(v => v.id);

  return { token, vehicleIds };
}

export default function (data) {
  // If no vehicles found in setup, fail early
  if (!data.vehicleIds || data.vehicleIds.length === 0) {
    check(null, { 'vehicles found in setup': () => false });
    return;
  }

  // Assign one vehicle per VU to avoid concurrent odometer decrement errors
  const vuIndex = (__VU - 1) % data.vehicleIds.length;
  const vehicleId = data.vehicleIds[vuIndex];

  // Generate monotonically increasing odometer per VU/iteration
  const odometer = 400000 + (__ITER * 100);

  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  const payload = JSON.stringify({
    vehicleId: vehicleId,
    fuelType: 'DIESEL',
    liters: 45.5,
    unitPrice: 5.89,
    odometer: odometer,
    suppliedAt: new Date().toISOString(),
    fuelStationName: 'Posto de Teste k6',
    notes: 'Abastecimento via teste de carga k6',
  });

  const res = http.post(`${BASE_URL}/v1/fuel-records`, payload, { headers });
  
  check(res, {
    'is status 201': (r) => r.status === 201,
  });

  sleep(1);
}
