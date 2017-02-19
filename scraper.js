
// two modules used, as required

var osmosis = require('osmosis')
var writeFile = require('write')

// node.js host objects

var fs = require('fs')
var http = require('http')

// options for get request

var options = {
	host: 'shirts4mike.com',
	path: '/shirts.php'
}

// useful

var logfile = './scraper-error.log'
var utc = new Date().toJSON().slice(0,10)

// multiple writes to the same file means we should open a stream for the CSV data

var stream = writeFile.stream(`./data/${utc}.csv`)

// first write the CSV headers for the CSV data

stream.write('Title, Price, ImageURL, URL, Time\n')

// make a get request to check the status of the webpage

req = http.get(options, (res) => {
	if(res.statusCode !== 200) {
		var error_text = `There has been a ${res.statusCode} error, ${res.statusText}`
		console.log(error_text)
		fs.appendFileSync(logfile, "\n" + error_text + " at " + new Date())
	}
})

// try to catch errors where the request fails to return a status code

req.on('error', (er) => { 
	var error_text = "There has been an error with the request: " + er.message
	console.log(error_text)
	fs.appendFileSync(logfile, "\n" + error_text + " at " + new Date())
})

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
	   .error(console.log)