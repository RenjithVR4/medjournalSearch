/*********************************************************
   Author: 	Renjith VR
   Version: 	1.0
   Date:	17-Feb-2018
   FileName: 	route.js
   Description:	Routing settings

**********************************************************/

// Importing Modules 
var express = require('express');
const router = express.Router();
var request = require('request');
var parser = require('xml2json');
const AWS = require('aws-sdk');
const Fs = require('fs');
const getpubMedData = require('../med_data');
const Journals = require('../models/journals');
AWS.config.loadFromPath('../awscreds.json');


//Get PubMed data
router.get('/getDatafromPubmed/:PubMedID', (req, res, next) => {

        if (!req.params.PubMedID) {
                res.status(400);
                res.json({ "error": "Missing Parameter" });
                console.log("Missing Parameter");
        }
        else {
                var PubMedID = req.params.PubMedID.trim();

                if (isNaN(PubMedID)) {
                        res.status(400);
                        res.json({ "error": "Missing Parameter! Inavlid PubmedID" });
                        console.log("Missing Parameter! Inavlid PubmedID");
                }

                Journals.findOne({ pubmedId: PubMedID }, function (err, results) {
                        if (err) {
                                console.log(err);
                                res.status(500);
                                res.json(pubdata);
                        } else if (results) {
                                pubdata = [];
                                pubdata.push(results);
                                res.json(pubdata);
                                console.log("Pubmed Data already exists! " + PubMedID);

                        } else {
                                request.get({ url: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&amp;rettype=abstract&amp;id=" + PubMedID }, function (error, response, body) {
                                        if (!error && response.statusCode == 200) {

                                                var pubmedID = "";
                                                var title = "";
                                                var authors = [];
                                                var tags = [];
                                                var firstAuthor = "";
                                                var seniorAuthor = "";
                                                var abstractlabels = [];
                                                var abstractcontent = [];

                                                var data = body;
                                                var json = parser.toJson(data);
                                                var parsedData = JSON.parse(json);

                                                var pubmedcontenData = parsedData.PubmedArticleSet.PubmedArticle;

                                                if (pubmedcontenData) {
                                                        var pubMedArticleset = pubmedcontenData.MedlineCitation;

                                                        if (pubMedArticleset.PMID) {
                                                                pubmedID = pubMedArticleset.PMID.$t.trim();
                                                        }

                                                        var Articleset = pubMedArticleset.Article;

                                                        if (Articleset.ArticleTitle) {
                                                                title = Articleset.ArticleTitle.trim();
                                                        }

                                                        if (Articleset.Abstract) {
                                                                var AbstractTextset = Articleset.Abstract.AbstractText;
                                                                var abstractlabel = "";
                                                                var abstract = "";

                                                                if (typeof AbstractTextset == "string") {
                                                                        abstractcontent.push(AbstractTextset.trim());
                                                                }
                                                                else {
                                                                        for (i in AbstractTextset) {
                                                                                abstractlabel = AbstractTextset[i].Label.trim();
                                                                                abstractlabels.push(abstractlabel);
                                                                                abstract = AbstractTextset[i].$t.trim();
                                                                                abstractcontent.push(abstract);
                                                                        }
                                                                }
                                                        }

                                                        if (pubMedArticleset.MeshHeadingList) {
                                                                var MeshHeadingset = pubMedArticleset.MeshHeadingList.MeshHeading;
                                                                var tag = "";

                                                                MeshHeadingset.forEach(function (obj) {
                                                                        tag = obj.DescriptorName.$t.trim();
                                                                        tags.push(tag);
                                                                });
                                                        }

                                                        if (Articleset.AuthorList) {
                                                                var Authorset = Articleset.AuthorList.Author;
                                                                var Name = "";
                                                                var ForeName = "";
                                                                var LastName = "";

                                                                if (Authorset.ForeName) {
                                                                        console.log(Authorset);
                                                                        Name = Authorset.ForeName.trim() + " " + Authorset.LastName.trim() + " ";
                                                                        authors.push(Name);
                                                                }
                                                                else {
                                                                        Object.keys(Authorset).forEach(function (key) {

                                                                                // Name = Authorset[key].ForeName ? Authorset[key].ForeName.trim() : ((Authorset[key].LastName) ? (Authorset[key].LastName.trim());

                                                                                if (Authorset[key].ForeName) {
                                                                                        var ForeName = Authorset[key].ForeName.trim();
                                                                                }

                                                                                if (Authorset[key].LastName) {
                                                                                        var LastName = Authorset[key].LastName.trim();
                                                                                }

                                                                                Name = ForeName + " " + LastName
                                                                                authors.push(Name);
                                                                        });
                                                                }
                                                                console.log("Authors ==>" + authors);
                                                                firstAuthor = authors[0];
                                                                if (authors.length == 1) {
                                                                        seniorAuthor = authors[0];
                                                                }
                                                                else {
                                                                        seniorAuthor = authors[authors.length - 1];
                                                                }
                                                        }

                                                        status = true;

                                                        var abstracttext = "";

                                                        for (var i = 0; i < abstractlabels.length; i++) {
                                                                abstracttext += abstractlabels[i] + " \n\r " + abstractcontent[i] + " \n\r ";
                                                        }

                                                        var self = this;
                                                        let newMedjournalData = new Journals({
                                                                pubmedId: pubmedID,
                                                                title: title,
                                                                authors: authors,
                                                                firstAuthor: firstAuthor,
                                                                seniorAuthor: seniorAuthor,
                                                                abstractlabels: abstractlabels,
                                                                abstract: abstractcontent,
                                                                abstractContent: abstracttext,
                                                                tags: tags,
                                                                status: status
                                                        });


                                                        newMedjournalData.save((err, Journals) => {
                                                                if (err) {
                                                                        console.log(err);
                                                                        res.status(500);
                                                                        res.json({ "error": "Can't Insert the data " + pubmedID });
                                                                        console.log("Can't Insert the data - " + err + " - " + pubmedID);
                                                                }
                                                                else {
                                                                        res.status(200);
                                                                        console.log("Successfully Inserted data " + pubmedID);

                                                                        getpubMedData(pubmedID, function (response) {
                                                                                pubdata = [];
                                                                                pubdata.push(response);
                                                                                res.json(pubdata);
                                                                        });
                                                                }
                                                        });

                                                }
                                                else {
                                                        // res.status(404);
                                                        res.json({ "error": "Invalid pubmedID or can't fetch the pubmed data " + PubMedID });
                                                        console.log("Invalid pubmedID or can't fetch the pubmed data - " + PubMedID);
                                                }
                                        }

                                });
                        }
                });

        }
});



//Get data into the UI from DB
router.get('/getdatafromDB', (req, res, next) => {
        res.json('App page');
});


//Edit data
router.put('/editDBdata/:PubMedID', (req, res, next) => {
        var pubmedId = "";
        var title = "";
        var firstAuthor = "";
        var seniorAuthor = "";
        var abstract = "";
        var tags = "";

        var updateData = {};

        if (req.params.PubMedID) {
                pubmedId = req.params.PubMedID.trim();
        }
        else {
                res.status(404);
                return false;
        }

        if (req.body.title) {
                title = req.body.title.trim();
                updateData.title = title;
        }

        if (req.body.firstAuthor) {
                firstAuthor = req.body.firstAuthor.trim();
                updateData.firstAuthor = firstAuthor;
        }

        if (req.body.seniorAuthor) {
                seniorAuthor = req.body.seniorAuthor.trim();
                updateData.seniorAuthor = seniorAuthor;
        }

        if (req.body.abstract) {
                abstract = req.body.abstract.trim();
                updateData.abstract = abstract;
        }

        if (req.body.tags) {
                tags = req.body.tags.trim();
                updateData.tags = tags;
        }

        var query = { 'pubmedId': pubmedId };
        // console.log(updateData);

        Journals.findOneAndUpdate(query, { $set: updateData }, { new: true }, function (err, Journals) {
                if (err) {
                        return res.json(500, { error: err });
                }
                else {
                        res.status(200);
                        console.log("Successfully Updated data " + pubmedId);
                        getpubMedData(pubmedId, function (response) {
                                console.log(response);

                                var polly = new AWS.Polly();

                                polly.describeVoices(function (err, data) {
                                        if (err) {
                                                console.log(err, err.stack); // an error occurred
                                        }
                                        else {
                                                console.log(data); // successful response
                                        }
                                })

                                request(options, function (error, response, body) {
                                        if (error) throw new Error(error);
                                        console.log(body);
                                });

                                res.json(response);
                        });
                }

        });
});




//Get audioURL to Audioplayer
router.get('/getaudioURL', (req, res, next) => {
        res.json('App page');
});


//Check Dupliation for PubMed_ID
router.get('/checkpubmedID', (req, res, next) => {
        res.json('App page');
});


module.exports = router;