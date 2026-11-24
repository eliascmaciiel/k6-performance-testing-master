import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const getQuickPizzaDuration = new Trend('get_quickpizza', true);
export const RateContentOK = new Rate('content_OK');

export const options = {
  vus: 7,
  thresholds: {
    http_req_failed: ['rate<0.25'],
    http_req_duration: ['p(90)<6800'],
    get_quickpizza: ['p(99)<500'],
    content_OK: ['rate>0.95']
  },
  stages: [
    { duration: '1m45s', target: 92 },
    { duration: '1m45s', target: 0 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const baseUrl = 'https://quickpizza.grafana.com/api/get';

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const OK = 200;

  const res = http.get(`${baseUrl}`, params);

  getQuickPizzaDuration.add(res.timings.duration);

  RateContentOK.add(res.status === OK);

  check(res, {
    'GET QuickPizza API - Status 200': () => res.status === OK
  });
}
