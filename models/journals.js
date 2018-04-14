/*********************************************************
   Author: 	Renjith VR
   Version: 	1.0
   Date:	17-Feb-2018
   FileName: 	journals.js
   Description:	Journals Model

**********************************************************/

const mongoose = require("mongoose");

const JournalSchema = mongoose.Schema({
        pubmedId: {
                type: String,
                required: true
        },
        title: {
                type: String,
                required: true
        },
        authors: {
                type: Object,
                required: true
        },
        firstAuthor: {
                type: String,
                required: true
        },
        seniorAuthor: {
                type: String,
                required: true
        },
        abstractlabels:{
                type: Object
        },
        abstract: {
                type: Object
        },
        abstractContent: {
                type: String
        },
        tags: {
                type: Object
        },
        audioURL: {
                type: String
        },
        status: {
                type: Boolean,
                required: true
        },
        createdDate: {
                type: Date,
                default: Date.now
        },
        updatedDate: {
                type: Date,
                default: Date.now
        }
});

const Journal = module.exports = mongoose.model('Journal', JournalSchema);