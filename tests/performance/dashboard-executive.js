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

  const res = http.post(loginUrl, payload, params);
  const json = res.json();
  const token = json.accessToken;
  return { token };
}

export default function (data) {
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  const res = http.get(`${BASE_URL}/v1/dashboards/executive`, { headers });
  
  check(res, {
    'is status 200': (r) => r.status === 200,
  });

  sleep(1);
}
