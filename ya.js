import http from "k6/http";
import { check, group } from "k6";

const BASE_URL = 'http://ya.ru';

export const options = {
  discardResponseBodies: true,
  scenarios: {
    ya: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 0,
      maxVUs: 60,
      stages: [
        { target: 60, duration: '300s' },
      ],
    },
    ya2: {
      executor: 'constant-arrival-rate',
      rate: 60,
      startTime: '300s',
      duration: '10m',
      preAllocatedVUs:60,
      maxVUs: 60,
    },
     ya3: {
          executor: 'ramping-arrival-rate',
          startRate: 60,
          startTime: '900s',
          timeUnit: '1s',
          preAllocatedVUs: 60,
          maxVUs: 72,
          stages: [
            { target: 72, duration: '300s'},
          ],
        },
    ya4: {
          executor: 'constant-arrival-rate',
          rate: 72,
          startTime: '1200s',
          duration: '10m',
          preAllocatedVUs:72,
          maxVUs: 72,
        },
  },
};

export default function(){
    group("get_ya", function(){get_ya()});
};

export function get_ya(){
    let res = http.get(BASE_URL);
    check(res, {
        "status code is 200": (res) => res.status == 200,
    });
};

