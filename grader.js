#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var fs = require('fs');
var util = require('util');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!path.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

// Parse and return the fields we've specified in checks.json
var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerio.load(fs.readFileSync(htmlfile));
    return theChecker($, checksfile);
};

var checkHtmlFromUrl = function(htmlfile, checksfile) {
    $ = cheerio.load(htmlfile);
    return theChecker($, checksfile);
};

// Separating the checking function to reduce code duplication
var theChecker = function(htmlfile,checksfile) {   
    var checks = loadChecks(checksfile).sort();
    // set up the dictionary object
    var out = {};
    // loop through the file and add the HTML tags present to the dictionary
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    var outJson = JSON.stringify(out, null, 4);
    console.log(outJson);
};   

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'URL path')
        .parse(process.argv);
// If there is a URL parameter, run a get request and checker
    if (program.url) {
        rest.get(program.url).on('complete', function(result) {
            checkHtmlFromUrl(result, program.checks);
        });
    } 
    else {
        checkHtmlFile(program.file, program.checks);
    }
// If there are no arguments, use the defaults
} else {
    exports.checkHtmlFile = checkHtmlFile;
}