//NODE_ENV=production node app.js
//io.configure('production', function(){


var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//**********************


//**Get Application**
app.get('/',function(req,res){
//    res.sendFile(__dirname+'/index.html');
    res.send('Hello World');
    console.log("Hello World is sent");
});

//app.route('/rooms/create').all(function(req,res){
//    console.log(req);
//});
//********************
//io.set('origins','*');
io.on('connection', function(socket){
  //  var userRooms = new Array();
    console.log('a user connected');

    socket.on('disconnect', function(){
        console.log('user disconnected');
		
    });



    
});

http.listen(3000,function(){
    console.log('listening on baramejapps.com:3000');
});

