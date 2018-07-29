var Gpio = require('onoff').Gpio;
var sleep = require('sleep').sleep;

var LED = new Gpio(23, 'out');
LED.writeSync(1);

console.log('init');
sleep(2);
console.log('on');
console.log('on');
console.log('on');
sleep(1);
console.log('done');
