var AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-1'});
AWS.config.apiVersions = {
  sns: '2010-03-31',
  // other service API versions
};

var sns = new AWS.SNS();

var params = {
  PlatformApplicationArn: 'arn:aws:sns:us-east-1:924857743379:app/GCM/TripsTalker', /* required */
  Token: 'APA91bG3ZJgcHLW9YhNXyjPZ-WNZWUW6QYO_lE9O6zDW7fTQZhsFvWMNmCH2Gos08Sh8MwIJiVMEE8cF5peXBA4vDst6Rsq3tM2sAhy8L-lF9-gcixELD8QADODlY0lB_jXIotKhdqzRO9KtvHVCRn30UBY5PKlj0A_fh2tptqOjJvRyxJA-1Tw', /* required */
  CustomUserData: 'STRING_VALUE'
};

sns.createPlatformEndpoint(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
