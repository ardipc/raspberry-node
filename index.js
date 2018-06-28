var io = require('socket.io-client');
var IDMOBIL = "5ab851b9b397a927081303b5";
var API = "https://trackcar.herokuapp.com/api/mobil/"+IDMOBIL;
var sc = io.connect('https://trackcar.herokuapp.com/', {query: 'idMobil='+IDMOBIL});
var exec = require('child_process').exec;
var Gpio = require('onoff').Gpio;
var fs = require('fs');
var async = require('async');

var request = require('request');

var LED = new Gpio(4, 'out');
var LED17 = new Gpio(17, 'out');
var LED27 = new Gpio(27, 'out');
var LED22 = new Gpio(22, 'out');

var FCM = require('./sendMessage').sendMessageToDevice;
var LED18 = new Gpio(18, 'in', 'both');

LED.writeSync(1);
LED17.writeSync(1);
LED27.writeSync(1);
LED22.writeSync(1);

request.get(API, (err, res, bod)=>{
 if (!err && res.statusCode == 200 && res != undefined) {
  var info = JSON.parse(bod);
  LED.writeSync(Number(info.relay.lamp));
  LED17.writeSync(Number(info.relay.engine));
  LED27.writeSync(Number(info.relay.door));
  LED22.writeSync(Number(info.relay.alarm));
 }
 else{
  LED.writeSync(1);
  LED17.writeSync(1);
  LED27.writeSync(1);
  LED22.writeSync(1);
 }
});

sc.on('statuslampu', (data)=>{
 if(data.msg){
  LED.writeSync(1);
 }
 else{
  LED.writeSync(0);
 }
});

sc.on('statusengine', (data)=>{
 if(data.msg){
  LED17.writeSync(1);
 }
 else{
  LED17.writeSync(0);
 }
});

sc.on('statusdoor', (data)=>{
 if(data.msg){
  LED27.writeSync(1);
 }
 else{
  LED27.writeSync(0);
 }
});

sc.on('statusalarm', (data)=>{
 if(data.msg){
  LED22.writeSync(1);
 }
 else{
  LED22.writeSync(0);
 }
});

sc.on('takefoto', (data) => {
 async.waterfall([
  function(cb){
   exec('raspistill -o /home/pi/Drivers/'+data.msg+'.jpg -w 640 -h 480 -n', (err, stout, sterr)=>{
    cb(null, stout);
   });
  },
  function(arg1, cb){
    var formData = {
     takefoto: fs.createReadStream('/home/pi/Drivers/'+data.msg+'.jpg')
    };
    request.post({url: "https://trackcar.herokuapp.com/history-drivers/upload/foto", formData: formData}, function(err, res, body){
     if(err) return console.log(err);
     console.log("Successfully uploaded!");

     request.post({url: "https://trackcar.herokuapp.com/api/mobil/driver/"+IDMOBIL, form:{filenama: data.msg+".jpg"}}, function(err, res, body){
      if(err) return console.log(err);
      console.log("saved");
     });

     cb(null, res.statusCode);
    });
  }
 ], function(err, result){
  console.log(result);
 });
});

sc.on('statusgps', (data) => {
 if(data.msg){
  exec('sudo systemctl start gps-python.service', (err, stout, sterr) => {
   console.log('stout: ', stout);
   console.log('sterr: ', sterr);
   if(err !== null){
    console.log('exec error: ', err);
   }
  });
 }
 else{
  exec('sudo systemctl stop gps-python.service', (err, stout, sterr) => {
   console.log('stout: ', stout);
   console.log('sterr: ', sterr);
   if(err !== null){
    console.log('exec error: ', err);
   }
  });
 }
});

sc.on('maprealtime', (data) => {
 if(data.msg){
  exec('sudo systemctl start gps-realtime.service', (err, stout, sterr) => {
   console.log('map realtime started...');
  });
 }else{
  exec('sudo systemctl stop gps-realtime.service', (err, stout, sterr) => {
   console.log('map realtime stoped...');
  });
 }
});

LED18.watch(function(err, value){
 console.log(value);
 var optionPut = {
  url: "https://trackcar.herokuapp.com/api/mobil/log/"+IDMOBIL,
  method: "PUT",
  form: {
   jenis: "engine",
   keterangan: "Engine Triggered, please check your car now!."
  }
 };

 //save log trigered
 request.put(optionPut, function(err, resp, body){
  if(err) return console.log(err);
  console.log(body);
 });

 //kirim notif ke mobile apps
 request.get(API, (err, res, body) => {
  if (!err && res.statusCode == 200 && res != undefined) {
   var info = JSON.parse(bod);
   FCM(info.tokenFirebase, 
    "Warning Notification", 
    "Engine on triggered, please check your car."
    );
  }
 });

});

process.on('SIGINT', function () { //on ctrl+c
 LED.unexport(); // Unexport LED GPIO to free resources
 LED17.unexport();
 LED27.unexport();
 LED22.unexport();
 LED18.unexport();
 process.exit(); //exit completely
});
