
// two modules used, as required

var osmosis = require('osmosis')
var writeFile = require('write')

var fs = require('fs')
var http = require('http')

var logfile = './scraper-error.log'
var utc = new Date().toJSON().slice(0,10)

// multiple writes to the same file means we should open a stream for the CSV data

var stream = writeFile.stream(`./data/${utc}.csv`)

// first write the CSV headers for the CSV data

stream.write('Title, Price, ImageURL, URL, Time\n')

// scrape the webpage and write the results to the stream

osmosis.get('shirts4mike.com/shirts.php')
	   .find('.products li a')
	   .set({'href': '@href'})
	   .set({'img': 'img@src', 'name': 'img@alt'})
	   .follow('@href')
	   .find('.shirt-details h1 span')
	   .set('price')
	   .data((result) => {
	   		stream.write(`${result.name.replace(", ", "-")}, ${result.price}, ${result.img}, ${result.href}, ${new Date().toJSON().slice(11,19)}\n`)
		})
	   .error((error) => { 
	   		error_text = `This is maybe a human-friendly error, if it's not just google it: ${error}`
	   		fs.appendFileSync(logfile, "\n" + error_text + " at " + new Date())
	   	})