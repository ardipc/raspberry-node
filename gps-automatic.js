var Config = require('./config');
var IDMOBIL = Config.IDMOBIL;
var Socket = require('socket.io-client');
var sc = Socket.connect(Config.HOST, {query: "idMobil="+IDMOBIL});

var SerialPort = require('serialport');
var GPS = require('gps');
var port = new SerialPort('/dev/ttyS0', {baudRate: 9600});
var gps = new GPS;

var Gpio = require('onoff').Gpio;
var LED4 = new Gpio(4, 'out');
var LED17 = new Gpio(17, 'out');
var LED27 = new Gpio(27, 'out');
var LED23 = new Gpio(23, 'out');

gps.on('data', (data)=>{
 if(data.type == "RMC"){
  if(data.speed){
   if(data.speed < 1) {
    console.log(data.speed);

    sc.emit('statuspower', {msg: true, idmobil: IDMOBIL});
    sc.emit('statuslampu', {msg: true, idmobil: IDMOBIL});
    sc.emit('statusdoor', {msg: true, idmobil: IDMOBIL});
    sc.emit('statusengine', {msg: true, idmobil: IDMOBIL});
    LED23.writeSync(1);
    LED4.writeSync(1);
    LED17.writeSync(1);
    LED27.writeSync(1);

   }
  }
 }
});

port.on('data', (data)=>{
 gps.updatePartial(data);
});
