/**
 * Created by oladapo on 6/27/15.
 */
'use strict';

var mandrill = require('mandrill-api');
var sendgrid = require('sendgrid')(process.env.SENDGRID_API_KEY);

var request = require('request');
var moment = require('moment'),
  Sms = require('./sms.model'),
  async = require('async');

// var mandrill_client = new mandrill.Mandrill(process.env.MANDRILL_API_KEY);
var message = {
  "html": '',
  "subject": '',
  "from": 'elections@nba-agc.org',
  "fromname": 'NBA Elections 2016',
  "to": [],
  'replyto' : 'elections@nigerianbar.org.ng'

};

var sendMessage = function(message, callback) {
  sendgrid.send(message, function(err, json) {
	if (err) { return console.error(err); }
	return callback(json);
  });
};

exports.sendDefaultPassword = function(_id, phone, email, password, sc_number, next) {
  var link = 'https://election.nba-agc.org/setup/' + _id + '/';
  var __message = 'Welcome to the NBA 2016 e-VOTING PORTAL. Your username is: ' + sc_number + ' and your default password is: '+ password + '  Please change it to get your Accreditation Code.';
	var _message = 'Welcome to the NBA 2016 e-VOTING PORTAL <br> <br> Your username is: <b>' + sc_number + '</b> <br> Your default password is: <b>'+ password + '</b>. <br> <br> Please change it to get your Accreditation Code.'  + '<br><br> <b>You can also click the link below to continue accreditation <a href="' + link + '"> <p> https://election.nba-agc.org/setup</p> </a> </b> <br>';
	var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="https://election.nba-agc.org"> <img src="https://election.nba-agc.org/assets/images/51bcebe4.logo.png"> </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: -12px auto 0;"> NBA <strong> e-Voting Portal </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"></td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + _message + ' </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"> <span style="color: #00CC39; font-weight:bold;">For enquiries,  </span> please  send emails to: elections@nba-agc.org</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';

  async.parallel([
    function (cb) {
      var destination = phone.indexOf("0") == 0 ? phone.replace(phone.indexOf("0"),"234") : "234"+phone;

      var url = 'http://107.20.195.151/mcast_ws_v2/index.php?user='+process.env.MCAST_USERNAME+'&password='+process.env.MCAST_PASSWORD+'&from='+process.env.SMS_FROM+'&to='+destination+'&message='+__message+'&type=json';

      request(url, function(err, res, body) {
		if (err) { return console.error(err); }
		Sms.create({ to: phone, message: __message });
		return cb(null, body);
      });
    },
    function (cb) {
      if (email!=undefined && email!=null) {
        var newMessage = message;
        newMessage.html = html_message;
        newMessage.subject = 'Login Credentials to NBA 2016 e-Voting Portal';
        newMessage.to = [email];

        sendMessage(newMessage, function(res){
			return cb(null, res);
        });
      } else {
        return cb(null, 'INVALID EMAIL - EMAIL NOT SENT');
      }
    }
  ], function (err, results) {
	if (err) { return console.error(err); }
	console.info("Key sent as SMS and Email ", results);
    return next();
  });
};

exports.sendPassword = function(phone, email, password, sc_number, next) {
  var __message = 'Your current password is: '+ password + '. You are advised to delete this message immediately and also change your password.';
	var _message = 'You have requested for you password <br> <br> Your password is: <b>'+ password + '</b>. <br> <br> You are advised to delete this mail immediately and also change your password.<br> <br> <br> <br> <small>If you did not request for your password, please contact our support team.</small>';
	var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="https://election.nba-agc.org"> <img src="https://election.nba-agc.org/assets/images/51bcebe4.logo.png"> </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: -12px auto 0;"> NBA <strong> e-Voting Portal </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"></td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + _message + ' </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"> <span style="color: #00CC39; font-weight:bold;">For enquiries,  </span> please  send emails to: elections@nba-agc.org</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';

  async.parallel([
    function (cb) {
      var destination = phone.indexOf("0") == 0 ? phone.replace(phone.indexOf("0"),"234") : "234"+phone;

      var url = 'http://107.20.195.151/mcast_ws_v2/index.php?user='+process.env.MCAST_USERNAME+'&password='+process.env.MCAST_PASSWORD+'&from='+process.env.SMS_FROM+'&to='+destination+'&message='+__message+'&type=json';

      console.log("SMS request URL: " + url);

      request(url, function(error, resp, body) {
		if (error) { return console.error(error); }
        Sms.create({ to: phone, message: __message });

        return cb(null, body);
      });
    },
    function (cb) {
      if (email!=undefined && email!=null) {
        var newMessage = message;
        newMessage.html = html_message;
        newMessage.subject = 'NBA 2016 e-VOTING Portal - Password Request';
        newMessage.to = [email];

        sendMessage(newMessage, function(res){
          return cb(null, res);
        });
      } else {
        return cb(null, 'INVALID LOGIN - EMAIL NOT SENT')
      }
    }
  ], function (err, results) {
    console.info("Key sent as SMS and Email ", results);
    return next();
  });
};

exports.sendVerificationSMS = function(_id, phone, email, accessCode, next) {
  var link = 'https://election.nba-agc.org/setup/' + _id + '/';

  var __message = 'Your Accreditation Code is: '+ accessCode + '. PLEASE KEEP THIS SMS AS YOU WILL NEED THIS CODE INCASE OF FURTHER VERIFICATION.';
	var _message = 'Your Accreditation Code is: <b>'+ accessCode + '</b>. PLEASE KEEP THIS MAIL AS YOU WILL NEED THIS CODE INCASE OF FURTHER VERIFICATION.'  + '<br><br> <b>You can also click the link below to continue accreditation <a href="' + link + '"> <p> https://election.nba-agc.org/setup</p> </a> </b> <br>';
	var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="https://election.nba-agc.org"> <img src="https://election.nba-agc.org/assets/images/51bcebe4.logo.png"> </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: -12px auto 0;"> NBA <strong> e-Voting Portal </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"></td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + _message + ' </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"> <span style="color: #00CC39; font-weight:bold;">For enquiries,  </span> please  send emails to: elections@nba-agc.org</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';

	async.parallel([
		function (cb) {
      var destination = phone.indexOf("0") == 0 ? phone.replace(phone.indexOf("0"),"234") : "234"+phone;

			request('http://107.20.195.151/mcast_ws_v2/index.php?user='+process.env.MCAST_USERNAME+'&password='+process.env.MCAST_PASSWORD+'&from='+process.env.SMS_FROM+'&to='+destination+'&message='+__message+'&type=json', function(error, res, body) {
				if (error) { return console.error(error); }
				Sms.create({ to: phone, message: __message });

				return cb(null, body);
			});

		},
		function (cb) {
			if (email!=undefined && email!=null) {
				var newMessage = message;

				newMessage.html = html_message;
				newMessage.subject = 'NBA 2016 e-VOTING Portal - Accreditation Code';
				newMessage.to = [email];

				sendMessage(newMessage, function(res){
					return cb(null, res);
				});
			} else {
				return cb(null, 'INVALID EMAIL - EMAIL NOT SENT')
			}
		}
	], function (err, results) {
		console.info("Accreditation Code sent as SMS and Email ", results);
		return next();
	});
};

exports.sendConfirmationSMS = function(phone, email, next) {
  var __message = 'Your NBA 2016 e-Voting accreditation is complete. You can now login to the portal.';
	var _message = '<b>Congratulations</b>, Your NBA 2016 e-Voting Accreditation is complete. You can now login to the portal';
	var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="https://election.nba-agc.org"> <img src="https://election.nba-agc.org/assets/images/51bcebe4.logo.png"> </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: -12px auto 0;"> NBA <strong> e-Voting Portal </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"></td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + _message + ' </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"> <span style="color: #00CC39; font-weight:bold;">For enquiries,  </span> please  send emails to: elections@nba-agc.org</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';
  var destination = phone.indexOf("0") == 0 ? phone : "0"+phone;

	async.parallel([
		function (cb) {
			var destination = phone.indexOf("0") == 0 ? phone : "0"+phone;

			request('http://107.20.195.151/mcast_ws_v2/index.php?user='+process.env.MCAST_USERNAME+'&password='+process.env.MCAST_PASSWORD+'&from='+process.env.SMS_FROM+'&to='+destination+'&message='+__message+'&type=json', function(error, resp, body) {
				if (error) { return console.log(error); }
				Sms.create({ to: phone, message: __message });

				return cb(null, body);
			});
		},
		function (cb) {
			if (email!=undefined && email!=null) {
				var newMessage = message;
				newMessage.html = html_message;
				newMessage.subject = 'Accreditation Successful. [NBA 2016 e-VOTING Portal]';
				newMessage.to = [email];

				sendMessage(newMessage, function(res){
					return cb(null, res);
				});
			} else {
				return cb(null, 'INVALID EMAIL - EMAIL NOT SENT')
			}
		}
	], function (err, results) {
		console.info("confirmed accreditation sent as SMS and Email ", results);
		return next();
	});
};

exports.sendBallotReceiptSMS = function(phone, email, code, signature, next) {
  var __message = 'Your votes have been received. This is your Voting Signature: '+ signature + ' for this Poll. You can' +
    ' now check the status of your vote, please note that this is not related to Polls result.';
	var _message = 'Your votes have been received. This is your Voting Signature: <b>'+ signature + '</b> for this Poll. You can ' +
    'now check the status of your vote, please note that this is not related to Polls result';
	var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="https://election.nba-agc.org"> <img src="https://election.nba-agc.org/assets/images/51bcebe4.logo.png"> </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: -12px auto 0;"> NBA <strong> e-Voting Portal </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"></td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + _message + ' </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"> <span style="color: #00CC39; font-weight:bold;">For enquiries,  </span> please  send emails to: elections@nba-agc.org</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';

	async.parallel([
		function (cb) {
			var destination = phone.indexOf("0") == 0 ? phone : "0"+phone;

			request('http://107.20.195.151/mcast_ws_v2/index.php?user='+process.env.MCAST_USERNAME+'&password='+process.env.MCAST_PASSWORD+'&from='+process.env.SMS_FROM+'&to='+destination+'&message='+__message+'&type=json', function(error, resp, body) {
				if (error) { return console.error(error); }
				Sms.create({ to: phone, message: __message });

				return cb(null, body);
			});
		},
		function (cb) {
			if (email!=undefined && email!=null) {
				var newMessage = message;
				newMessage.html = html_message;
				newMessage.subject = 'Vote Successfully Casted';
        // var arr = [];
        // arr.push(email);
        // arr.push('nba.elections@inec.gov.ng');
        newMessage.to = [email];

				sendMessage(newMessage, function(res){
					return cb(null, res);
				});
			} else {
				return cb(null, 'INVALID EMAIL - EMAIL NOT SENT')
			}
		}
	], function (err, results) {
		console.info("Ballot Receipt sent as SMS and Email ", results);
		return next();
	});
};

exports.sendSetupLink = function(phone, email, _id, name, next) {
	var link = 'https://election.nba-agc.org/setup/' + _id + '/';
	var __message = 'Dear ' + name + ' Welcome to NBA 2016 e-Voting Portal, please visit the link below to begin' +
    ' accreditation .' + link;

	var _message = 'Dear ' + name + ', <br><br> Welcome to the NBA 2016 e-VOTING PORTAL <br> <br> Please click on the link below to begin your accreditation <br> <b> <a href="' + link + '"> <p>'+link+'</p> </a> </b> <br> OR copy the link and paste it in' +
    ' your browser if you are having issues.';

	var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="https://election.nba-agc.org"> <img src="https://election.nba-agc.org/assets/images/51bcebe4.logo.png"> </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: -12px auto 0;"> NBA <strong> e-Voting Portal </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"></td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + _message + ' </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"> <span style="color: #00CC39; font-weight:bold;">For enquiries,  </span> please  send emails to: elections@nba-agc.org</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';
	var destination = phone.indexOf("0") == 0 ? phone : "0"+phone;

	async.parallel([
		function (cb) {
      var destination = phone.indexOf("0") == 0 ? phone.replace(phone.indexOf("0"),"234") : "234"+phone;
      // http://www.smslive247.com/http/index.aspx?cmd=sendquickmsg&owneremail='+process.env.SMS_OWNER_EMAIL+'&subacct='+process.env.SMS_SUB_ACCOUNT+'&subacctpwd='+process.env.SMS_SUB_ACCOUNT_PASSWORD+'&message='+__message+'&sender='+process.env.SMS_SENDER+'&sendto='+destination+'&msgtype='+process.env.SMS_MSG_TYPE
      var url = 'http://107.20.195.151/mcast_ws_v2/index.php?user='+process.env.MCAST_USERNAME+'&password='+process.env.MCAST_PASSWORD+'&from='+process.env.SMS_FROM+'&to='+destination+'&message='+__message+'&type=json';
		request(url, function(error, res, body) {
				if (error) { return console.error(error); }
				Sms.create({ to: phone, message: __message });

				return cb(null, body);
			});
		},
		function (cb) {
			if (email!=undefined && email!=null) {
				var newMessage = message;
				newMessage.html = html_message;
				newMessage.subject = 'Welcome to the NBA 2016 e-Voting Portal.';
				newMessage.to = [email];

				sendMessage(newMessage, function(res){
					return cb(null, res);
				});
			} else {
				return cb(null, 'INVALID LOGIN - EMAIL NOT SENT')
			}
		}
	], function (err, results) {
		console.info("accreditation link sent as SMS and Email ", results);
		return next();
	});
};

exports.sendDetailLink = function(phone, email, _id, name, next) {
	//TODO: replace with valid link
	var link = 'https://election.nba-agc.org/pre_setup/' + _id + '/';
	var __message = 'Test SMS. ';
/*
	var __message = 'Sir, please find sample title: NBA-2016';
*/

	var _message = 'Dear ' + name + ', <br><br> Welcome to the NBA e-Voting PORTAL We are in the process of accrediting all eligible voters. Kindly click on the link below to confirm your details in order to start the accreditation process. <br> <b> <a href="' + link + '"> <p>https://election.nba-agc.org/pre_setup</p> </a> </b> <br> <br> Warm Regards, <br> <b>Ken Mozia, SAN </b> <br> (Chairman, NBA Elections 2016 Committee) <br> <b>Email: ken.mozia@nigerianbar.org.ng</b>';

	var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="https://election.nba-agc.org"> <img src="https://election.nba-agc.org/assets/images/51bcebe4.logo.png"> </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: -12px auto 0;"> NBA <strong> e-Voting Portal </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"></td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + _message + ' </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"> <span style="color: #00CC39; font-weight:bold;">For enquiries,  </span> please  send emails to: elections@nba-agc.org</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';
	var destination = phone.indexOf("0") == 0 ? phone : "0"+phone;

	async.parallel([
		function (cb) {
      var destination = phone.indexOf("0") == 0 ? phone.replace(phone.indexOf("0"),"234") : "234"+phone;

			request('http://107.20.195.151/mcast_ws_v2/index.php?user='+process.env.MCAST_USERNAME+'&password='+process.env.MCAST_PASSWORD+'&from='+process.env.SMS_FROM+'&to='+destination+'&message='+__message+'&type=json', function(error, resp, body) {
				if (error) { return console.error(error); }
				Sms.create({ to: phone, message: __message });

				return cb(null, body);
			});
		},
		function (cb) {
			/*if (email!=undefined && email!=null) {
				var newMessage = message;
				newMessage.html = html_message;
				newMessage.subject = 'Welcome to the NBA 2016 e-Voting Portal';
				newMessage.to = [email];

				sendMessage(newMessage, function(res){
					return cb(null, res);
				});
			} else {
				return cb(null, 'INVALID LOGIN - EMAIL NOT SENT');
			}*/
      return cb(null, 'sms');
		}
	], function (err, results) {
		console.info("test SMS sent as sms ", results);
		return next();
	});
};

exports.sendEnquiryRecieved = function(phone, email, next) {
  var __message = 'Your enquiry on NBA 2016 E- voting portal has been received we will get back to you shortly as we look forward to serving you better..';
  var _message = 'Your enquiry on NBA 2016 E- voting portal has been received we will get back to you shortly as we look forward to serving you better..';
  var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="https://election.nba-agc.org"> <img src="https://election.nba-agc.org/assets/images/51bcebe4.logo.png"> </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: -12px auto 0;"> NBA <strong> e-Voting Portal </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"></td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + _message + ' </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"> <span style="color: #00CC39; font-weight:bold;">For enquiries,  </span> please  send emails to: elections@nba-org.ng</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';
  var destination = phone.indexOf("0") == 0 ? phone.replace(phone.indexOf("0"),"234") : "234"+phone;

  async.parallel([
    function (cb) {
      var destination = phone.indexOf("0") == 0 ? phone.replace(phone.indexOf("0"),"234") : "234"+phone;

      request('http://107.20.195.151/mcast_ws_v2/index.php?user='+process.env.MCAST_USERNAME+'&password='+process.env.MCAST_PASSWORD+'&from='+process.env.SMS_FROM+'&to='+destination+'&message='+__message+'&type=json', function(error, resp, body) {
        if (error) { return console.log(error); }
        Sms.create({ to: phone, message: __message });

        return cb(null, body);
      });
    },
    function (cb) {
      if (email!=undefined && email!=null) {
        var newMessage = message;
        newMessage.html = html_message;
        newMessage.subject = 'Enquiries Received. [NBA 2016 e-VOTING Portal]';
        newMessage.to = [email];

        sendMessage(newMessage, function(res){
          return cb(null, res);
        });
      } else {
        return cb(null, 'INVALID EMAIL - EMAIL NOT SENT')
      }
    }
  ], function (err, results) {
    console.info("Confirmation of received Enquiries ", results);
    return;
  });
};

exports.sendUpdatedRecordsToBoth = function(data) {
  var __message = 'Dear '+data.updatedFirstName+', Your Details Have been Updated and Confirmed successfully and this Mobile Number: 0'+data.updatedPhone+' and Email: '+data.updatedEmail+' has been added to your NBA E-voting Portal Account, thank you for updating your records.';

  var _message = 'Dear '+data.updatedFirstName+', Your Details Have been Updated and Confirmed successfully and this Mobile Number: 0'+data.updatedPhone+' and Email: '+data.updatedEmail+' has been added to your NBA E-voting Portal Account, thank you for updating your records.';
  var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="https://election.nba-agc.org"> <img src="https://election.nba-agc.org/assets/images/51bcebe4.logo.png"> </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: -12px auto 0;"> NBA <strong> e-Voting Portal </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"></td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + _message + ' </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"> <span style="color: #00CC39; font-weight:bold;">For enquiries,  </span> please  send emails to: elections@nba-org.ng</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';


  async.parallel([
    function (cb) {
      if (data.updatedEmail!=undefined && data.updatedEmail!=null) {
        var newMessage = message;
        newMessage.html = html_message;
        newMessage.subject = 'Records Updated. [NBA 2016 e-VOTING Portal]';
        newMessage.to = [data.updatedEmail];

        sendMessage(newMessage, function(res){
          return cb(null, res);
        });
      } else {
        return cb(null, 'INVALID EMAIL - EMAIL NOT SENT')
      }
    },
    function (cb) {
      var phone = data.updatedPhone;
      var destination = phone.indexOf("0") == 0 ? phone.replace(phone.indexOf("0"),"234") : "234"+phone;

      request('http://107.20.195.151/mcast_ws_v2/index.php?user='+process.env.MCAST_USERNAME+'&password='+process.env.MCAST_PASSWORD+'&from='+process.env.SMS_FROM+'&to='+destination+'&message='+__message+'&type=json', function(error, resp, body) {
        if (error) { return console.log(error); }
        Sms.create({ to: phone, message: __message });

        return cb(null, body);
      });
    }
  ], function (err, results) {
    console.info("Confirmation sent to Updated Email and Updated Phone", results);
    return;
  });
};

exports.sendUpdatedRecordsToEmail = function(data) {
  var _message = 'Dear '+data.updatedFirstName+', Your Details Have been Updated and Confirmed successfully and this Mobile Number: 0'+data.updatedPhone+' has been added to your NBA E-voting Portal Account, thank you for updating your records.';
  var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="https://election.nba-agc.org"> <img src="https://election.nba-agc.org/assets/images/51bcebe4.logo.png"> </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: -12px auto 0;"> NBA <strong> e-Voting Portal </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"></td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + _message + ' </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"> <span style="color: #00CC39; font-weight:bold;">For enquiries,  </span> please  send emails to: elections@nba-org.ng</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';


  async.parallel([
    function (cb) {
      if (data.updatedEmail!=undefined && data.updatedEmail!=null) {
        var newMessage = message;
        newMessage.html = html_message;
        newMessage.subject = 'Records Updated. [NBA 2016 e-VOTING Portal]';
        newMessage.to = [data.updatedEmail];

        sendMessage(newMessage, function(res){
          return cb(null, res);
        });
      } else {
        return cb(null, 'INVALID EMAIL - EMAIL NOT SENT')
      }
    }
  ], function (err, results) {
    console.info("Confirmation sent to Updated Email ", results);
    return;
  });
};

exports.sendUpdatedRecordsToPhone = function(data) {
  var __message = 'Dear '+data.updatedFirstName+', Your Details Have been Updated and Confirmed successfully and this email: '+data.updatedEmail+' has been added to your NBA E-voting Portal Account, thank you for updating your records.';


  async.parallel([
    function (cb) {
      var phone = data.updatedPhone;
      var destination = phone.indexOf("0") == 0 ? phone.replace(phone.indexOf("0"),"234") : "234"+phone;

      request('http://107.20.195.151/mcast_ws_v2/index.php?user='+process.env.MCAST_USERNAME+'&password='+process.env.MCAST_PASSWORD+'&from='+process.env.SMS_FROM+'&to='+destination+'&message='+__message+'&type=json', function(error, resp, body) {
        if (error) { return console.log(error); }
        Sms.create({ to: phone, message: __message });

        return cb(null, body);
      });
    }
  ], function (err, results) {
    console.info("Confirmation Sent to UpdatedPhone ", results);
    return;
  });
};

exports.sendEnquiryResolved = function(_id,title, phone, email, next) {
  var __message = 'Your enquiry on NBA 2016 E- voting portal about "'+title+'" with ticket number:"'+_id+'" has been resolved, We Hope we Have been able to serve you better.';
  var _message = 'Your enquiry on NBA 2016 E- voting portal about "'+title+'" with ticket number:"'+_id+'" has been resolved, We Hope we Have been able to serve you better.';
  var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="https://election.nba-agc.org"> <img src="https://election.nba-agc.org/assets/images/51bcebe4.logo.png"> </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: -12px auto 0;"> NBA <strong> e-Voting Portal </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"></td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + _message + ' </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"> <span style="color: #00CC39; font-weight:bold;">For enquiries,  </span> please  send emails to: elections@nba-org.ng</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';
  var destination = phone.indexOf("0") == 0 ? phone.replace(phone.indexOf("0"),"234") : "234"+phone;

  async.parallel([
    function (cb) {
      var destination = phone.indexOf("0") == 0 ? phone.replace(phone.indexOf("0"),"234") : "234"+phone;

      request('http://107.20.195.151/mcast_ws_v2/index.php?user='+process.env.MCAST_USERNAME+'&password='+process.env.MCAST_PASSWORD+'&from='+process.env.SMS_FROM+'&to='+destination+'&message='+__message+'&type=json', function(error, resp, body) {
        if (error) { return console.log(error); }
        Sms.create({ to: phone, message: __message });

        return cb(null, body);
      });
    },
    function (cb) {
      if (email!=undefined && email!=null) {
        var newMessage = message;
        newMessage.html = html_message;
        newMessage.subject = 'Enquiries resolved. [NBA 2016 e-VOTING Portal]';
        newMessage.to = [email];

        sendMessage(newMessage, function(res){
          return cb(null, res);
        });
      } else {
        return cb(null, 'INVALID EMAIL - EMAIL NOT SENT')
      }
    }
  ], function (err, results) {
    console.info("Confirmation of received Enquiries ", results);
    return;
  });
};

exports.sendConfirmRequestCodeAsSMS = function (email, requestCode, phone, next) {
    var __message = 'Please enter this code to confirm your password reset request!  -  ' + requestCode;

  var _message = 'Please enter this code to confirm your password reset request!  -  ' + requestCode + '<br><br><br><br><small>If you did not make this request, please contact our support team below</small>';

  var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="https://election.nba-agc.org"> <img src="https://election.nba-agc.org/assets/images/51bcebe4.logo.png"> </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: -12px auto 0;"> NBA <strong> e-Voting Portal </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"></td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + _message + ' </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"> <span style="color: #00CC39; font-weight:bold;">For enquiries,  </span> please  send emails to: elections@nba-agc.org</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';

  async.parallel([
    function (cb) {
      var destination = phone.indexOf("0") == 0 ? phone.replace(phone.indexOf("0"),"234") : "234"+phone;

      request('http://107.20.195.151/mcast_ws_v2/index.php?user='+process.env.MCAST_USERNAME+'&password='+process.env.MCAST_PASSWORD+'&from='+process.env.SMS_FROM+'&to='+destination+'&message='+__message+'&type=json', function (error, res, body) {
        if (error) {
          return console.error(error);
        }
        Sms.create({to: phone, message: __message});

        console.info(body, 'API Message');
        return next();
      });

    },
    function (cb) {
      if (email!=undefined && email!=null) {
        var newMessage = message;
        newMessage.html = html_message;
        newMessage.subject = 'You have requested a Password Reset';
        newMessage.to = [email];

        sendMessage(newMessage, function(res){
          return cb(null, res);
        });
      } else {
        return cb(null, 'INVALID LOGIN - EMAIL NOT SENT');
      }
    }
  ], function (err, results) {
    console.info("Reset Request Confirmation Code as SMS and Email ", results);
    return next();
  });

};

exports.sendResetLinkToEmail = function (link, email, next) {
    var _message = '<b>Hello</b>, You have requested to reset your password. please follow the link below to reset your password.  ' + link;
    var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="https://election.nba-agc.org"> <img src="https://election.nba-agc.org/assets/images/51bcebe4.logo.png"> </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: -12px auto 0;"> NBA <strong> e-Voting Portal </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"></td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + _message + ' </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"> <span style="color: #00CC39; font-weight:bold;">For enquiries,  </span> please  send emails to: elections@nba-agc.org</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';

    var newMessage = message;
    newMessage.html = html_message;
    newMessage.subject = 'Password Reset Link!';
    newMessage.to = [email];

    sendMessage(newMessage, function (res) {
        console.info(res);
        return next();
    });

};


exports.sendNotUpdatedEmail = function(data) {
  var _message = 'Dear Learned Colleague,\n This is to remind you to kindly update your records on the NBA E_Voting' +
    ' Portal,as accreditation will commence soon.  Please visit the election portal https://election.nba-agc.org now to update your records, in' +
    ' order to vote. \nWarm Regards ECNBA';
  var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="https://election.nba-agc.org"> <img src="https://election.nba-agc.org/assets/images/51bcebe4.logo.png"> </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: -12px auto 0;"> NBA <strong> e-Voting Portal </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"></td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + _message + ' </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"> <span style="color: #00CC39; font-weight:bold;">For enquiries,  </span> please  send emails to: elections@nba-org.ng</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';


  async.parallel([
    function (cb) {
      if (data.email!=undefined && data.email!=null) {
        var newMessage = message;
        newMessage.html = html_message;
        newMessage.subject = 'Records Not Updated. [NBA 2016 e-VOTING Portal]';
        newMessage.to = [data.email];

        sendMessage(newMessage, function(res){
          return cb(null, res);
        });
      } else {
        return cb(null, 'INVALID EMAIL - EMAIL NOT SENT')
      }
    }
  ], function (err, results) {
    console.info("Confirmation sent to Email ", results);
    return;
  });
};


exports.sendNotUpdatedSms = function (phone, next) {
  var __message  = 'Dear Learned Colleague, This is to remind you to kindly update your records on the NBA E_Voting' +
    ' Portal,as accreditation will commence soon.  Please visit the election portal https://election.nba-agc.org now to update your records, in' +
    ' order to vote. Warm Regards ECNBA';
  var destination = phone.indexOf("0") == 0 ? phone.replace(phone.indexOf("0"),"234") : "234"+phone;

  request('http://107.20.195.151/mcast_ws_v2/index.php?user='+process.env.MCAST_USERNAME+'&password='+process.env.MCAST_PASSWORD+'&from='+process.env.SMS_FROM+'&to='+destination+'&message='+__message+'&type=json', function (error, res, body) {
    if (error) {
      return console.error(error);
    }
    // Sms.create({to: phone, message: __message});

    console.info(body, 'API Message');
    return;
  });
};


exports.sendScamAlert = function(data) {
  var _message = 'Dear Learned Colleague,<br> Our Attention has been drawn to an email going round, titled: <strong>CONTRACT OFFER</strong> purportedly from one <strong>JOHN UNACHUKWU ECHEZONA</strong>. Please do not open this email. It is a PHISHING Mail aimed at obtaining your email password and other details. If you have already opened the email, kindly change your email password immediately.<br> Warm Regards <br>NBA' +
    ' Electoral Committee 2016.';
  var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="https://election.nba-agc.org"> <img src="https://election.nba-agc.org/assets/images/51bcebe4.logo.png"> </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: -12px auto 0;"> NBA <strong>  </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"></td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + _message + ' </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';


  async.parallel([
    function (cb) {
      var newMessage = message;
      if (data.updated ==  true){
        if (data.updatedEmail!=undefined && data.updatedEmail!=null) {
          newMessage.html = html_message;
          newMessage.subject = 'URGENT Notification';
          newMessage.to = [data.updatedEmail];

          sendMessage(newMessage, function(res){
            return cb(null, res);
          });
        } else {
          return cb(null, 'INVALID EMAIL - EMAIL NOT SENT')
        }
      }
      if (data.updated == undefined){
        if (data.email!=undefined && data.email!=null && data.email!='NOT AVAILABLE') {

          newMessage.html = html_message;
          newMessage.subject = 'URGENT Notification';
          newMessage.to = [data.email];

          sendMessage(newMessage, function(res){
            return cb(null, res);
          });
        } else {
          return cb(null, 'INVALID EMAIL - EMAIL NOT SENT')
        }
      }
    }
  ], function (err, results) {
    console.info("Email has been sent", results);
    return;
  });
};

exports.resendSetupLink = function(phone, email, _id, name, next) {
  var link = 'https://election.nba-agc.org/setup/' + _id + '/';
  var __message = 'Dear ' + name + ' Welcome to NBA 2016 e-Voting Portal, please visit the link below to begin' +
    ' accreditation .' + link;

  var _message = 'Dear ' + name + ', <br><br> Welcome to the NBA 2016 e-VOTING PORTAL <br> <br> Please click on the link below to begin your accreditation <br> <b> <a href="' + link + '"> <p>'+link+'</p> </a> </b> <br> OR copy the link and paste it in' +
    ' your browser if you are having issues.';

    var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="https://election.nba-agc.org"> <img src="https://election.nba-agc.org/assets/images/51bcebe4.logo.png"> </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: -12px auto 0;"> NBA <strong> e-Voting Portal </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"></td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + _message + ' </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"> <span style="color: #00CC39; font-weight:bold;">For enquiries,  </span> please  send emails to: elections@nba-agc.org</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';
    var destination = phone.indexOf("0") == 0 ? phone : "0"+phone;

    async.parallel([
        function (cb) {
            var destination = phone.indexOf("0") == 0 ? phone : "0"+phone;

            request('http://107.20.195.151/mcast_ws_v2/index.php?user='+process.env.MCAST_USERNAME+'&password='+process.env.MCAST_PASSWORD+'&from='+process.env.SMS_FROM+'&to='+destination+'&message='+__message+'&type=json', function(error, res, body) {
                if (error) { return console.error(error); }
                Sms.create({ to: phone, message: __message });

                return cb(null, body);
            });
        },
        function (cb) {
            if (email!=undefined && email!=null) {
                var newMessage = message;
                newMessage.html = html_message;
                newMessage.subject = 'Welcome to the NBA 2016 e-Voting Portal.';
                newMessage.to = [email];

                sendMessage(newMessage, function(res){
                    return cb(null, res);
                });
            } else {
                return cb(null, 'INVALID LOGIN - EMAIL NOT SENT')
            }
        }
    ], function (err, results) {
        console.info("accreditation link sent as SMS and Email ", results);
        return next();
    });
};


exports.sendTest = function() {


  var newMessage = message;
  newMessage.html = 'Test Html Page';
  newMessage.subject = 'URGENT Notification';
  var arr = [];
  arr.push('drcraig20@gmail.com');
  arr.push('ope.olugasa@gitlimited.com');
  newMessage.to = arr;

  sendMessage(newMessage, function(res,json){
    return json;
  });
};
