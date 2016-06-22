/**
 * Created by DrCraig-PC on 25/05/2016.
 */
'use strict';
var Agenda = require('agenda');
var _ = require('lodash');
var mailer = require('./components/tools/mailer');
var config = require('./config/environment');
var Member = require('./api/member/member.model');

var agenda = new Agenda({db: {address: config.mongo.uri}});

agenda.define('Send Accreditation Link To All Members', function (job, done) {
	console.log("1");
	Member.find({setupLink_sent: false}).limit(50).exec(
		function (err, allMembers) {
			console.log("2");
			if (err) {
				job.fail(err);
				job.save();
				done();
			}
			if (allMembers.length) {
				_(allMembers).forEach(function (member) {
					mailer.sendSetupLink(member.phone, member.email, member._id, member.surname + ' ' + member.firstName, function () {

						console.log('email was sent to ' + member.email + '');
					});
					Member.update({_id: member._id}, {$set: {setupLink_sent: true}}, function (e) {
						if (e) {
							console.log(e);
						}
					});
				});

				done();
			} else {
				done();
			}
		}
	)
});

//agenda.every('minute', 'Send Accreditation Link To All Members');


exports.start = function () {
	agenda.start();
}
