var gcm = require('node-gcm');
var message = new gcm.Message({
    collapseKey: 'demo',
    delayWhileIdle: true,
    timeToLive: 3,
    data: {
        key1: 'message1',
        key2: 'message2'
    }
});

var sender = new gcm.Sender('AIzaSyDa2caw8jivcppT8QhA95zQvCrSPm5jzDg');
var registrationIds = ['APA91bG3ZJgcHLW9YhNXyjPZ-WNZWUW6QYO_lE9O6zDW7fTQZhsFvWMNmCH2Gos08Sh8MwIJiVMEE8cF5peXBA4vDst6Rsq3tM2sAhy8L-lF9-gcixELD8QADODlY0lB_jXIotKhdqzRO9KtvHVCRn30UBY5PKlj0A_fh2tptqOjJvRyxJA-1Tw'];

/**
 * Params: message-literal, registrationIds-array, No. of retries, callback-function
 **/
sender.send(message, registrationIds, 4, function (err, result) {
    console.log('result='+result);
    console.log('error='+err);
});
