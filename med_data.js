const Journals = require('./models/journals');

var med_data =  function (pubmedID, callback) {
        Journals.findOne({ pubmedId: pubmedID }, function (err, results) {

                if (err) {
                        console.log(err); 
                        return {"error": err};
                } else if(results){
                        callback(results);
                }
        });
}

module.exports = med_data;