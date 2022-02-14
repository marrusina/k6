import http from "k6/http";
import { check, group } from "k6";

const BASE_URL = 'http://www.ru';

export const options = {
  discardResponseBodies: true,
  scenarios: {
    www: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 0,
      maxVUs: 120,
      stages: [
        { target: 120, duration: '300s' },
      ],
    },
    www2: {
      executor: 'constant-arrival-rate',
      rate: 120,
      startTime: '300s',
      duration: '10m',
      preAllocatedVUs:120,
      maxVUs: 120,
    },
     www3: {
          executor: 'ramping-arrival-rate',
          startRate: 120,
          startTime: '900s',
          timeUnit: '1s',
          preAllocatedVUs: 120,
          maxVUs: 144,
          stages: [
            { target: 144, duration: '300s'},
          ],
        },
    www4: {
          executor: 'constant-arrival-rate',
          rate: 144,
          startTime: '1200s',
          duration: '10m',
          preAllocatedVUs:144,
          maxVUs: 144,
        },
  },
};

export default function(){
    group("get_www", function(){get_www()});
};

export function get_www(){
    let res = http.get(BASE_URL);
    check(res, {
        "status code is 200": (res) => res.status == 200,
    });
};