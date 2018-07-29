var Gpio = require('onoff').Gpio;
var LED = new Gpio(23,'out');

LED.writeSync(0);
