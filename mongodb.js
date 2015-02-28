var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/tripstalker');

var db = mongoose.connection;

db.on('error',console.error.bind(console,'conneciton error:'));
db.once('open',function(callback){
    console.log('yay!!');
    
});