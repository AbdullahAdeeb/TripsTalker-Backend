//NODE_ENV=production node app.js
//io.configure('production', function(){


var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var AWS = require('aws-sdk');




/*///////////////////////////////////////
----------------------------------------
//         SETTING AWS
-----------starting SNS-----------------
*///////////////////////////////////////
//**Get Application**
AWS.config.update({region: 'us-east-1'});
AWS.config.apiVersions = {
  sns: '2010-03-31',
  // other service API versions
};
var sns = new AWS.SNS();
//----------SETTING AWS-----------------



/*///////////////////////////////////////
----------------------------------------
//      SETTING MONGODB
----------------------------------------
*///////////////////////////////////////
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/tripstalker');
var db = mongoose.connection;
db.on('error',console.error.bind(console,'conneciton error:'));
db.once('open',function(callback){
    console.log('MongoDB: Connection Opened');
});
//-----------END OF SETTING MONGODB-----------------------




/*///////////////////////////////////////
----------------------------------------
//      SETTING HTTP SERVER
-----------for testing------------------
*///////////////////////////////////////

app.get('/',function(req,res){
//    res.sendFile(__dirname+'/index.html');
    res.send('Hello World');
    console.log("Hello World is sent");
});
app.route('/rooms/create').all(function(req,res){
    console.log(req);    
});
var rooms = mongoose.model('testing', {name: String, admin: Number, loc: String, members: [Number], connected:[Number], disconnected: [Number]}, 'rooms');
//------------END SETTING HTTP SERVER------------------------




/*////////////////////////////////////////
------------------------------------------
//      SOCKET.IO HANDLERS
------------------------------------------
*/////////////////////////////////////////

//io.set('origins','*');
io.on('connection', function(socket){
    console.log('a user connected');
    socket.userId = -1;
    
	
    //-----------------------
    //      DISCONNECT
    //-----------------------
    socket.on('disconnect', function(){
        console.log(socket.userId+' << disconnected');
		
		//modify mongodb rooms database to move user into disconnected
		disconnect(socket.userId);
		
    });

    //-----------------------
    //      CHAT MESSAGE
    //-----------------------
//    socket.on('chat message', function(msg){
//        console.log('message: ' + msg);
//        this.broadcast.emit('chat message', msg);
//    });
    
    //-----------------------
    //      JOIN ROOM
    //-----------------------
//    socket.on('join room', function(data){
//        console.log('joining room: '+data.roomID);
//        this.join(data.roomID);
//    });
    
    //-----------------------
    //      ROOM MESSAGE
    //-----------------------
    socket.on('room message', function(data){
        console.log('\nsending to: '+data.roomID+"  message:"+data.msg+"\n");
        
    	socket.to(data.roomID).emit('room message',data);

        // send message to disconnected devices
    });
    
    //-------------------------------------
    //      REGISTER USER ID / JOIN ROOMS
    //-------------------------------------
    socket.on('register userID',function(msg){
        console.log('register userID>> '+msg.userID);
		socket.userId = msg.userID;

		//modify mongodb rooms database to move user into connected
		connect(socket.userId, socket);
    });
    
    //--------------------------
    //      REGISTER PUSH TOKEN
    //--------------------------
    socket.on('register pushID',function(msg){
        console.log('register pushID>>'+msg.pushID);
        
        // if the user is on browser the push ID will be ignored
        if(msg.pushID === 0){
            console.log('browser has no push ID');
            return true;
        }
        
        // register the push id/token with SNS
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
    
    //-----------------------
    //      CREATE ROOM
    //-----------------------
    socket.on('createRoom',function(data){
        var room = JSON.parse(data);
        console.log('createRoom >> '+data);
    });

    
});
//----------------------END HANDLERS--------------------------------

http.listen(3000,function(){
    console.log('listening on baramejapps.com:3000');
});

//Remove user from disconnect list and place in connect list
function connect(userId, socket){
	if(userId!=-1){
		console.log("Connect: userId is defined "+userId+", starting connect function");
		rooms.find({$or:[{admin:userId}, {members:userId}]},function(err, result){
			console.log("joining rooms "+result.length+">>");
			for(var i = 0; i < result.length; i++){
                socket.join(result[i]._id);
				var index = result[i].disconnected.indexOf(userId);
				if(index>-1){
                    console.log(userId+" >> conntected to room: "+result[i]._id);
                    //join user into each room they are apart of
					result[i].disconnected.splice(index, 1);
					result[i].connected.push(userId);
					result[i].save();
				}	
			}
		});
        console.log("\n\n");
        return true;
	}else{
        console.log("Connect ERROR: userID = -1");
		return false;
	}
}

//Remove user from connect list and place in disconnect list
function disconnect(userId){
	if(userId!=-1){
		console.log("Disconnect: userId is defined "+userId+", starting disconnect function");
		//var rooms = mongoose.model('testing', {name: String, admin: Number, loc: String, members: [Number], connected:[Number], disconnected: [Number]}, 'rooms');
		rooms.find({$or:[{admin:userId}, {members:userId}]},function(err, users){		   
			for(var i =0;i<users.length;i++){
				var index = users[i].connected.indexOf(userId);
				if(index>-1){
					users[i].connected.splice(index, 1);
					users[i].disconnected.push(userId);
					users[i].save();
				}
			}		   
		});
        console.log("\n\n");
        return true;
	}else{
        console.log("Disconnect ERROR: userID = -1");
		return false;
	}
}
