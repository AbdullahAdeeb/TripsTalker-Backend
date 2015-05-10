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
  //  var userRooms = new Array();
    console.log('a user connected');
    var id =-1;
    socket.on('disconnect', function(){
        console.log('user disconnected');
		
		//modify mongodb rooms database to move user into disconnected
		if(!disconnect(id))
		{
			console.log("disconnect(id) failed: User id is not defined");
		}
    });

    //-----------------------
    //      CHAT MESSAGE
    //-----------------------
    socket.on('chat message', function(msg){
        console.log('message: ' + msg);
        this.broadcast.emit('chat message', msg);
    });
    
    //-----------------------
    //      ROOM MESSAGE
    //-----------------------
    socket.on('room message', function(object){
        console.log('sending to room: '+object.room);
        console.log('room message: '+object.msg);
        this.to(object.room).emit('room message',object);
    });
    
    //-----------------------
    //      REGISTER
    //-----------------------
    socket.on('register',function(msg){
        console.log('user registered>>'+msg);
        var data = msg.split(";");
		id = data[1];
		console.log("user id defined: "+id);
        var params = {
            PlatformApplicationArn: 'arn:aws:sns:us-east-1:924857743379:app/GCM/TripsTalker', /* required */
            Token: data[0],
            CustomUserData: data[1]
        };

        sns.createPlatformEndpoint(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(data);           // successful response
        });
		
		//modify mongodb rooms database to move user into connected
		if(!connect(id, socket))
		{
			console.log("connect(id) failed: User id is not defined");
		}
		
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
function connect(id, socket)
{
	
	if(id!=-1)
	{
		console.log("Connect: userId is defined "+id+", starting connect function");
		
		rooms.find({$or:[{admin:id}, {members:id}]},function(err, users){
			
			for(var i =0;i<users.length;i++)
			{
				

				var index = users[i].disconnected.indexOf(id);
				if(index>-1)
				{
                    //join user into each channel they are apart of
                    console.log("User "+id+" joining room "+users[i]._id);
                    socket.join(users[i]._id);
					users[i].disconnected.splice(index, 1);
					users[i].connected.push(id);
					users[i].save();
					console.log("Room Connect: connected userId:"+id+" to room "+users[i].name);
				}
				

			}
			//console.log("\n\nUPDATA DATA:");	
			//console.log(""+users);

        
        
       
			// console.log("disconnected: "+users[0].disconnected);
		});
	}
	else
	{
		return false;
	}
     
}
//Remove user from connect list and place in disconnect list
function disconnect(id)
{
	if(id!=-1)
	{
		console.log("Disconnect: userId is defined "+id+", starting disconnect function");
		//var rooms = mongoose.model('testing', {name: String, admin: Number, loc: String, members: [Number], connected:[Number], disconnected: [Number]}, 'rooms');
		rooms.find({$or:[{admin:id}, {members:id}]},function(err, users){
			
		   
			for(var i =0;i<users.length;i++)
			{
				

				var index = users[i].connected.indexOf(id);
				if(index>-1)
				{
					users[i].connected.splice(index, 1);
					users[i].disconnected.push(id);
					users[i].save();
					console.log("Room Disconnect: disconnected userId:"+id+" from room "+users[i].name);

				}
				

			}
			//console.log("\n\nUPDATA DATA:");	
			//console.log(""+users);

			
			
		   
		   // console.log("disconnected: "+users[0].disconnected);
		});
	}
	else
	{
		return false;
	}
}
