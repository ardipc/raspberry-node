var socket = require('socket.io-client');
var Config = require('./config');
var IDMOBIL = Config.IDMOBIL;
var sc = socket.connect(Config.HOST, {query: 'idMobil='+IDMOBIL});

var SerialPort = require('serialport');
var port = new SerialPort('/dev/ttyS0', { // change path
  baudRate: 9600
});
 
var GPS = require('gps');
var gps = new GPS;
 
gps.on('data', function(data) {
 if(data.type === "GGA"){
  if(data.lat && data.lon){

   console.log("GGA: ", data.lat);

   sc.emit('send to server map', {lat: data.lat, lon: data.lon});
   sc.emit('save latlong', {
	lat: data.lat, lon: data.lon, 
	alt: data.alt, geo: data.geoidal, 
	valid: data.valid, satel: data.satelites,
	idmobil: IDMOBIL
   });

  }
 }

 if(data.type === "RMC"){
  if(data.speed){

   console.log("RMC: ", data.speed);

   sc.emit('send to server speed', {speed: data.speed});
   sc.emit('save speed', {
	lat: data.lat, lon: data.lon, 
	speed: data.speed, valid: data.valid,
	idmobil: IDMOBIL
   });

  }
 }
});
 
port.on('data', function(data) {
  gps.updatePartial(data);
});
