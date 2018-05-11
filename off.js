var Gpio = require('onoff').Gpio;
var LED = new Gpio(4,'out');

LED.writeSync(0);
