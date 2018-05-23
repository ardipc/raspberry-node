var io = require('socket.io-client');
var sc = io.connect('https://trackcar.herokuapp.com/', {query: 'idMobil=5ab851b9b397a927081303b5'});
var exec = require('child_process').exec;
var Gpio = require('onoff').Gpio;
var fs = require('fs');
var async = require('async');

var request = require('request');
var IDMOBIL = "5ab851b9b397a927081303b5";
var API = "https://trackcar.herokuapp.com/api/mobil/"+IDMOBIL;

var tokenAli = "e0Bm4kStuaM:APA91bEsXy3Wg_vba8ssft24cEn8ImjlnK5TX1J5sJ0l8yw-eaLdELDNNjARnlMNG5M8FXYYHtOq6BZsGt0NgSUTcJVLzIDmYmHAsERf62rm-nkTGezTMaxP5LYi80G296lCqlzq0p73";
var tokenLina = "e7-_82nKuQI:APA91bGZmzN2S8Qaj2jD4KH_fND4XI9M2iq4zybzn2uL9_0DawwAmYqKqJS58BhPyHsDt2vTmFp8uzdektol0rjUIXQGHQ78_dqnxxsfK7IRMU-DO3cPg4AiYsLVynyr2f4TURlnwqgN";
var tokenMun = "cfSgvFh5wr0:APA91bHIfYkparXmahmFXBHUa9Kuu0R-p9SjLwrzKHY4MeBA_bMTiG1yvuqhN_5plDZnf21haccbzgj1t_c4nT_qBeQzBqQUZZJvPjT-rER6mvIJnZOFEhf5lQsvzDiXE_A-WfrDxcDa";

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

function sendMessageToDevice(idDevice, title, message) {
 request({
  url: 'https://fcm.googleapis.com/fcm/send',
  method: 'POST',
  headers: {
   'Content-Type': ' application/json',
   'Authorization': 'key=AIzaSyD64VrFJwKIZi4dlRyoaMSd4bK6OQchMbA'
  },
  body: JSON.stringify({
    notification: {
    title: title,
    body: message               
   },
    'to': idDevice  
   })
  }, function(error, response, body) {
   if (error)
    console.log(error);
   else if (response.statusCode >= 400)
    console.log("HTTP Error" + response.statusCode + "-" + response.statusCode + "\n" + body);
   else
    console.log(body);
 });
}

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
 request.put(optionPut, function(err, resp, body){
  if(err) return console.log(err);
  console.log(body);
 });
 FCM(tokenMun, "Warning Notification", "Engine on triggered, please check your car.");
});

process.on('SIGINT', function () { //on ctrl+c
 LED.unexport(); // Unexport LED GPIO to free resources
 LED17.unexport();
 LED27.unexport();
 LED22.unexport();
 LED18.unexport();
 process.exit(); //exit completely
});
