var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/');

var db = mongoose.connection;

db.on('error',console.error.bind(console,'conneciton error:'));
db.once('open',function(callback){
    console.log('yay!!');
    
});
