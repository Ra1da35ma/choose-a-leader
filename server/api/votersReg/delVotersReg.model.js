/**
 * Created by radiumrasheed on 7/2/16.
 */
'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var StateSchema = new Schema({
    fullname: String,
    mobileNumber: String,
    email: String,
    scNumber: String,
    verifiedStatus:String,
    branchCode:String,
    sc_number: String,
    updatedSurname:String,
    updatedFirstName:String,
    updatedMiddleName:String,
    updatedEmail:String,
    updatedPhone:String,
    updatedTime: String,
    updated:Boolean,
    confirmed:Boolean,
    confirmedBy: { type: Schema.Types.ObjectId, ref: 'Auth' },
    prevModifiedBy: String,
    prevModifiedDate: Date,
    prevDataModified: {type: Schema.Types.Mixed },
    createdBy: String,
    createdDate: Date,
    emailIsMatch: Boolean,
    phoneIsMatch: Boolean
});

module.exports = mongoose.model('DelVotersReg', StateSchema, 'DelVotersRegister');
