var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-1'});
AWS.config.apiVersions = {
  sns: '2010-03-31',
  // other service API versions
};

var sns = new AWS.SNS();

app.get('/',function(req,res){
//    res.sendFile(__dirname+'/index.html');
});

io.on('connection', function(socket){
    console.log('a user connected');
    
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('chat message', function(msg){
        console.log('message: ' + msg);
        this.broadcast.emit('chat message', msg);
    });
    
    socket.on('registerSNS',function(msg){
        console.log('SNS user registered>>'+msg);
        var data = msg.split(";");
        var params = {
            PlatformApplicationArn: 'arn:aws:sns:us-east-1:924857743379:app/GCM/TripsTalker', /* required */
            Token: data[0],
            CustomUserData: data[1]
        };

        sns.createPlatformEndpoint(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(data);           // successful response
        });
    });
    
    socket.on('createRoom',function(data){
        var room = JSON.parse(data);
        console.log('createRoom >> '+data);
    });
    
});

http.listen(3000,function(){
    console.log('listening on baramejapps.com:3000');
});