<<<<<<< HEAD
<<<<<<< HEAD
=======
//file index.js
>>>>>>> fix_index
var Config 	= require('./config');
var IDMOBIL 	= Config.IDMOBIL;
var TOKENHP 	= "ep7mly0gGsA:APA91bEbVsmMDqtO8PVFXJ9lLiY-TJzB_HcF8w7G51qiOCwpgG-qJsZwMQ4DxwGcjSmPqxKZcgNotDR6_IaNk-LuNGJfSRjISMJ_2FNrUd6-288gEBe5AowjbZtvNlK8mcM2ut_OaiNROnD65LaN61e097FGRmJb8A";
var API 	= Config.API+IDMOBIL;

var io 		= require('socket.io-client');
var fs 		= require('fs');
var async 	= require('async');
var request 	= require('request');
var Gpio 	= require('onoff').Gpio;
var sleep 	= require('sleep').sleep;
var exec 	= require('child_process').exec;
var FCM 	= require('./sendMessage');
var sc 		= io.connect(Config.HOST, {query: 'idMobil='+IDMOBIL});

var LED 	= new Gpio(4, 'out');
var LED17 	= new Gpio(17, 'out');
var LED27 	= new Gpio(27, 'out');
var LED22 	= new Gpio(22, 'out');
var LED23 	= new Gpio(23, 'out');

LED23.writeSync(1);
sleep(2);
=======
var io      = require('socket.io-client');
var IDMOBIL = "5ab851b9b397a927081303b5";
var API     = "https://trackcar.herokuapp.com/api/mobil/"+IDMOBIL;
var sc      = io.connect('https://trackcar.herokuapp.com/', {query: 'idMobil='+IDMOBIL});
var exec    = require('child_process').exec;
var Gpio    = require('onoff').Gpio;
var fs      = require('fs');
var async   = require('async');

var request = require('request');

var LED     = new Gpio(4, 'out');
var LED17   = new Gpio(17, 'out');
var LED27   = new Gpio(27, 'out');
var LED22   = new Gpio(22, 'out');

var FCM     = require('./sendMessage').sendMessageToDevice;
var LED18   = new Gpio(18, 'in', 'both');

>>>>>>> 590019038074b67d2a77b04c90a8ca4844177bb1
LED.writeSync(1);
LED17.writeSync(1);
LED27.writeSync(1);
LED22.writeSync(1);
sleep(1);
LED23.writeSync(0);

sc.emit('car connected', {idmobil: Config.IDMOBIL});

<<<<<<< HEAD
sc.on('statuspower', (data)=>{
 var LED23 = new Gpio(23, 'out');
 if(data.msg){
  LED23.writeSync(1);
=======
/**
request.get(API, (err, res, bod)=>{
 if (!err && res.statusCode == 200 && res != undefined) {
  var info = JSON.parse(bod);
  LED.writeSync(Number(info.relay.lamp));
  LED17.writeSync(Number(info.relay.engine));
  LED27.writeSync(Number(info.relay.door));
  LED22.writeSync(Number(info.relay.alarm));
>>>>>>> 590019038074b67d2a77b04c90a8ca4844177bb1
 }
 else{
  LED23.writeSync(0);
 }
});
*/

sc.on('statuslampu', (data)=>{
 var LED = new Gpio(4, 'out');
 if(data.msg){
  LED.writeSync(1);
 }
 else{
  LED.writeSync(0);
 }
});

sc.on('statusengine', (data)=>{
 var LED17 = new Gpio(17, 'out');
 if(data.msg){
  LED17.writeSync(1);
 }
 else{
  LED17.writeSync(0);
 }
});

sc.on('statusdoor', (data)=>{
 var LED27 = new Gpio(27, 'out');
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
   //exec('raspistill -o /home/pi/Drivers/'+data.msg+'.jpg -w 640 -h 480 -n', (err, stout, sterr)=>{
   exec('fswebcam -r 640x480 /home/pi/Drivers/'+data.msg+'.jpg && sudo chmod +rx /home/pi/Drivers/'+data.msg+'.jpg', (err, stout, sterr)=>{
    cb(null, stout);
   });
  },
  function(arg1, cb){
    var formData = {
     takefoto: fs.createReadStream('/home/pi/Drivers/'+data.msg+'.jpg')
    };
    request.post({url: Config.HOST+"history-drivers/upload/foto", formData: formData}, function(err, res, body){
     if(err) return console.log(err);
     console.log("Successfully uploaded!");

     request.post({url: Config.API+"driver/"+IDMOBIL, form:{filenama: data.msg+".jpg"}}, function(err, res, body){
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
  exec('sudo systemctl start gps-realtime.service', (err, stout, sterr) => {
   if(err !== null){
    console.log('exec error: ', err);
   }
  });
 }
 else{
  exec('sudo systemctl stop gps-realtime.service', (err, stout, sterr) => {
   if(err !== null){
    console.log('exec error: ', err);
   }
  });
 }
});

sc.on('automatic engine', (rst) => {
 if(rst.msg){
  exec('sudo systemctl start gps-automatic.service', (err, stout, sterr)=>{ if(err) return console.log(err)});
  console.log('automatic on started.');
 }else{
  exec('sudo systemctl stop gps-automatic.service', (err, stout, sterr)=>{ if(err) return console.log(err)});
  console.log('automatic off terminated.');
 }
});

<<<<<<< HEAD
/**
LED18.watch(function(err, value){
 console.log(value);
 if(value) {
  var optionPut = {
   url: Config.API+"log/"+IDMOBIL,
   method: "PUT",
   form: {
    jenis: "engine",
    keterangan: "Engine Triggered, please check your car now!."
   }
  };

  //request.put(optionPut, function(err, resp, body){
   //if(err) return console.log(err);
  //});

  request.get(API, (err, res, bo) => {
   var info = JSON.parse(bo);
   FCM.sendMessageToDevice(info.tokenFirebase, "Warning Notification", "Some action on triggered, please check your car !!!");
  });
 }
=======
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
   var info = JSON.parse(body);
   FCM(info.tokenFirebase, 
    "Warning Notification", 
    "Engine on triggered, please check your car."
    );
  }
 });

>>>>>>> 590019038074b67d2a77b04c90a8ca4844177bb1
});
*/

process.on('SIGINT', function () { //on ctrl+c
 LED.unexport();
 LED17.unexport();
 LED27.unexport();
 LED22.unexport();
 LED23.unexport();
 process.exit();
});
