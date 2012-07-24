/*
Name:     nodejs-triodos
Source:   https://github.com/fvdm/nodejs-triodos
Feedback: https://github.com/fvdm/nodejs-triodos/issues

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org/>
*/

var fs = require('fs'),
    EventEmitter = require('events').EventEmitter

var app = new EventEmitter

app.stats = {
	totaal_tx:		0,
	totaal_in:		0,
	totaal_uit:		0,
	saldo:			0,
	max_in:			{bedrag:0},
	min_in:			{bedrag:0},
	max_uit:		{bedrag:0},
	min_uit:		{bedrag:0}
}

// parse CSV file
app.openCSV = function( filepath, zoek, cb ) {
	
	// fix callback
	if( !cb && typeof zoek == 'function' ) {
		var cb = zoek
		var zoek = false
	}
	
	// parse file
	fs.readFile( filepath, 'utf8', function( err, data ) {
		
		if( err ) {
			
			app.emit( 'fail', {
				path:		filepath,
				encoding:	'utf8',
				error:		err
			})
			
		} else {
			
			var data = data.split( /[\r\n]+/ )
			var result = []
			
			for( var n in data ) {
				
				var line = data[n].substr(1, data[n].length -2)
				if( line != '' ) {
					line = line.split('","')
					var tx = {
						datum:			line[0],
						rekening:		line[1],
						bedrag:			parseFloat( line[2].replace(',', '.') ),
						richting:		line[3],
						ontvanger:		line[4],
						tegenrekening:	line[5],
						code:			line[6],
						omschrijving:	line[7]
					}
					
					// do stats
					app.stats.totaal_tx++
					
					if( tx.richting == 'Credit' ) {
						app.stats.totaal_in = app.stats.totaal_in + tx.bedrag
						app.stats.saldo = Math.round( (app.stats.saldo + tx.bedrag) * 100 ) / 100
						if( app.stats.max_in.bedrag == 0 || tx.bedrag > app.stats.max_in.bedrag ) {
							app.stats.max_in = tx
						}
						if( app.stats.min_in.bedrag == 0 || tx.bedrag < app.stats.min_in.bedrag ) {
							app.stats.min_in = tx
						}
					} else {
						app.stats.totaal_uit = app.stats.totaal_uit + tx.bedrag
						app.stats.saldo = Math.round( (app.stats.saldo - tx.bedrag) * 100 ) / 100
						if( app.stats.max_uit.bedrag == 0 || tx.bedrag > app.stats.max_uit.bedrag ) {
							app.stats.max_uit = tx
						}
						if( app.stats.min_uit.bedrag == 0 || tx.bedrag < app.stats.min_uit.bedrag ) {
							app.stats.min_uit = tx
						}
					}
					
					// transaction processed
					app.emit( 'tx', tx )
					result.push( tx )
					
				}
				
			}
			
			// all processed
			if( typeof cb == 'function' ) {
				cb( result )
			}
			
			app.emit( 'klaar', result )
		}
		
	})
	
}

// ready
module.exports = app