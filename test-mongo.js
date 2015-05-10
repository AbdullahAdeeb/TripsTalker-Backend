var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/tripstalker');

var db = mongoose.connection;

db.on('error',console.error.bind(console,'conneciton error:'));
db.once('open',function(callback){
    console.log('yay!!');
        
});
 var rooms = mongoose.model('testing', {name: String, admin: Number, loc: String, members: [Number], connected:[Number], disconnected: [Number]}, 'rooms');
connect(13);

//setTimeout(disconnect(13), 5000);

function connect(id)
{
  //  var rooms = mongoose.model('testing', {name: String, admin: Number, loc: String, members: [Number], connected:[Number], disconnected: [Number]}, 'rooms');
    rooms.find({$or:[{admin:id}, {members:id}]},function(err, users){
        console.log("\n\nDATA:")
		console.log(""+users);
       
        for(var i =0;i<users.length;i++)
        {
            

            var index = users[i].disconnected.indexOf(id);
            if(index>-1)
            {
                console.log("ROOM EVENT ID: "+users[i]._id);
                users[i].disconnected.splice(index, 1);
                users[i].connected.push(id);
                users[i].save();
            }
            

        }
        console.log("\n\nUPDATA DATA:");	
        console.log(""+users);

        
        
       
       // console.log("disconnected: "+users[0].disconnected);
	});
     
}
function disconnect(id)
{
   //  var rooms = mongoose.model('testing', {name: String, admin: Number, loc: String, members: [Number], connected:[Number], disconnected: [Number]}, 'rooms');
    rooms.find({$or:[{admin:id}, {members:id}]},function(err, users){
        console.log("\n\nDATA:")
		console.log(""+users);
       
        for(var i =0;i<users.length;i++)
        {
            

            var index = users[i].connected.indexOf(id);
            if(index>-1)
            {
                users[i].connected.splice(index, 1);
                users[i].disconnected.push(id);
                users[i].save();
            }
            

        }
        console.log("\n\nUPDATA DATA:");	
        console.log(""+users);

        
        
       
       // console.log("disconnected: "+users[0].disconnected);
	});
}

/*function test()
{
    
	console.log("IN Test:");
  //  console.log(schema);
	//var rooms = mongoose.model('test', {name: String, members: Number},'test');
	var rooms = mongoose.model('testing', {}, 'rooms');
    rooms.find({$or:[{admin:7}, {members:7}]},function(err, users){
		console.log("data: "+users);

	});
	
    
//	console.log("Creating new document: ");
//	
//	var tempNew = new rooms({name: "test2", members: 5});
//	tempNew.save(function(err,received)
//	{
//		if(err) return console.error(err);
//		console.log("creating: "+tempNew);
//	});
//	
}*/