import http from "k6/http";
import { parseHTML } from 'k6/html';
import { check, group, sleep } from "k6";
import { SharedArray } from 'k6/data';

const BASE_URL = 'http://www.load-test.ru:1080';
const username = 'mrusina2';
const password = 'mrusina2';
let user_session = "";
let outboundFlight = "";

const data = new SharedArray('depart', function () {
  return JSON.parse(open('./departure.json')).departure;
});
const depart = data[Math.floor(Math.random() * data.length)];
                          console.log('departure',JSON.stringify(depart));
const data2 = new SharedArray('arrive', function () {
  return JSON.parse(open('./arrive.json')).arrival;
});
const arrive = data2[Math.floor(Math.random() * data2.length)];
console.log('arrive',JSON.stringify(arrive));

export const options = {

  scenarios: {

    example_scenario: {

     executor: 'constant-vus',

           vus: 10,

           duration: '45m',

    },

  },

};

export default function(){

group("open_main_page", function(){open_main_page()});
sleep(1);
group("post_login", function(){post_login()});
sleep(1);
group("choose_ticket", function(){choose_ticket()});
sleep(1);
group("pay", function(){pay()});
sleep(1);
};

export function open_main_page(){
    let res = http.get(BASE_URL+"/webtours/")
        console.log("main_page1",JSON.stringify(res))
        check(res, {
            "open_main_page1 code is 200": (res) => res
            .status == 200,
        });
    let res2 = http.get(BASE_URL+"/cgi-bin/welcome.pl?signOff=true")
        console.log("main_page2",JSON.stringify(res2));
        check(res2, {
            "open_main_page2 code is 200": (res2) => res2.status == 200,
        });
    const res3 = http.get(BASE_URL+"/cgi-bin/nav.pl?in=home")
    let res_body = parseHTML(res3.body);
        user_session = res_body.find('input[name=userSession]').val();
        console.log("userSession: ",JSON.stringify(user_session));
        check(res3, {
            "open_main_page3 is 200": (res3) => res3
            .status == 200,
        });
    console.log("post_login",JSON.stringify(res));
  };

export function post_login(){
    let res = http.post(BASE_URL+"/cgi-bin/login.pl", {
                                    "userSession": user_session,
                                    "username": username,
                                    "password": password,
                                    "login.x":"48",
                                    "login.y":"12",
                                    "JSFormSubmit":"off"
                                    },
                                    {Headers:{'Cont-Type': 'application/json'}});
       check(res, {"post_login code is 200": (res) => res.status == 200,
           });
       console.log("post_login",JSON.stringify(res));
    http.get(BASE_URL+"/cgi-bin/nav.pl?page=menu&in=home");
       let res3= http.get(BASE_URL+"/cgi-bin/login.pl?intro=true");
           check(
               res3, {
                    "post_login status code is 200": (r) => r.status == 200,
                    'post_login': (r) => r.body.includes('Welcome, <b>' + username + '</b>, to the Web Tours reservation pages.'),
               }
           );
};

export function choose_ticket(){
    http.get(BASE_URL+"/cgi-bin/welcome.pl?page=search");
    http.get(BASE_URL+"/cgi-bin/nav.pl?page=menu&in=flights");
    let res= http.get(BASE_URL+"/cgi-bin/reservations.pl?page=welcome");
        check(
            res, {
                "go to flights": (r) => r.status == 200
            }
        );
    console.log("go to flights: ",JSON.stringify(res));

    let res2 = http.post(BASE_URL+"/cgi-bin/reservations.pl", {
                                    "depart": depart,
                                    "departDate": "01/04/2022",
                                    "arrive": arrive,
                                    "returnDate": "01/05/2022",
                                    "numPassengers": "1",
                                    "seatPref": "None",
                                    "seatType": "Coach",
                                    "findFlights.x": "47",
                                    "findFlights.y": "14",
                                    ".cgifields": "roundtrip",
                                    ".cgifields": "seatType",
                                    ".cgifields": "seatPref"
                                    },
                                    {Headers:{'Cont-Type': 'application/json'}});
       console.log("DEPAERTURE: ",JSON.stringify(depart));
       console.log("ARRIVAL: ",JSON.stringify(arrive));
       let res_body = parseHTML(res2.body);
               outboundFlight = res_body.find('input[checked="checked"]').val();
               console.log("outboundFlight: ",JSON.stringify(outboundFlight));
       console.log("choose_flight",JSON.stringify(res2));
       check(res2, {
                    "choose flight status code is 200": (r) => r.status == 200,
                    'choose flight': (r) => r.body.includes('Flight departing from'),
               }
           );

    let res3 = http.post(BASE_URL+"/cgi-bin/reservations.pl", {
                                    "outboundFlight": outboundFlight,
                                    "numPassengers":"1",
                                    "advanceDiscount":"0",
                                    "seatType": "Coach",
                                    "seatPref":"None",
                                    "reserveFlights.x": "70",
                                    "reserveFlights.y": "10"
                                    },
                                    {Headers:{'Cont-Type': 'application/json'}});
       console.log("choose_time",JSON.stringify(res3));
       check(res3, {
                    "choose_time status code is 200": (r) => r.status == 200,
                    'choose_time': (r) => r.body.includes('Payment Details'),
               });
};

export function pay(){
    let res = http.post(BASE_URL+"/cgi-bin/reservations.pl", {
                                    "firstName":"Marina",
                                    "lastName":"Rusina",
                                    "address1":"",
                                    "address2":"",
                                    "pass1":"rr rr",
                                    "creditCard": "",
                                    "expDate": "",
                                    "oldCCOption":"",
                                    "numPassengers":"1",
                                    "seatType":"Coach",
                                    "seatPref":"None",
                                    "outboundFlight":outboundFlight,
                                    "advanceDiscount":"0",
                                    "returnFlight":"",
                                    "JSFormSubmit":"off",
                                    "buyFlights.x":"53",
                                    "buyFlights.y":"9",
                                    ".cgifields":"saveCC"
                                    },
                                    {Headers:{'Cont-Type': 'application/json'}});
       console.log("pay",JSON.stringify(res));
       check(res, {
                    "pay status code is 200": (r) => r.status == 200,
                    'pay': (r) => r.body.includes('hank you for booking through Web Tours'),
               });
};
