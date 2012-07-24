var triodos = require('./triodos.js'),
    errors = 0,
    countEvents = {
	    klaar: 0,
	    tx: 0
    }

// Analyze outcome
process.on( 'exit', function() {
	
	// event.klaar
	if( countEvents.klaar == 0 ) {
		console.log( 'FAIL: event.klaar not emitted' )
		errors++
	}
	
	// event.tx
	if( countEvents.tx == 0 ) {
		console.log( 'FAIL: event.tx not emitted' )
		errors++
	} else if( countEvents.tx > 4 ) {
		console.log( 'FAIL: event.tx emitted more than 4 times' )
		errors++
	} else if( countEvents.tx < 4 ) {
		console.log( 'FAIL: event.tx emitted less than 4 times' )
		errors++
	}
	
	// ok?
	if( errors >= 1 ) {
		process.exit(1)
	} else {
		process.exit(0)
	}
	
})

var expect = [ { datum: '20-06-2012',
    rekening: '11.11.11.111',
    bedrag: 37.98,
    richting: 'Debet',
    ontvanger: 'Voorbeeld',
    tegenrekening: '22.22.22.222',
    code: 'IC',
    omschrijving: 'Factuur 1234567890' },
  { datum: '30-06-2012',
    rekening: '11.11.11.111',
    bedrag: 500.12,
    richting: 'Credit',
    ontvanger: 'J. JANSEN',
    tegenrekening: '33.33.33.333',
    code: 'ET',
    omschrijving: 'Betaling' },
  { datum: '10-07-2012',
    rekening: '11.11.11.111',
    bedrag: 20,
    richting: 'Debet',
    ontvanger: 'P.M. PIETERSSEN',
    tegenrekening: '44.44.44.444',
    code: 'IC',
    omschrijving: 'FACTUURNUMMER 1234567890' },
  { datum: '19-07-2012',
    rekening: '11.11.11.111',
    bedrag: 8923.04,
    richting: 'Credit',
    ontvanger: 'Some weird company',
    tegenrekening: '88.88.88.888',
    code: 'IC',
    omschrijving: 'Invoice 98765' } ]

// this would be bad
triodos.on( 'fail', function( reason ) {
	console.log( 'FATAL: event.fail: ', reason )
	errors++
})

// event.klaar
triodos.on( 'klaar', function( results ) {
	countEvents.klaar++
	if( typeof results != 'object' ) {
		console.log( 'ERROR: event.klaar - typeof results != array' )
		errors++
	} else if( results.length === undefined ) {
		console.log( 'ERROR: event.klaar - results != array' )
		errors++
	} else if( results.length != 4 ) {
		console.log( 'ERROR: event.klaar - results do not match' )
		errors++
	}
})

// event.tx
triodos.on( 'tx', function( tx ) {
	countEvents.tx++
	if( typeof tx != 'object' ) {
		console.log( 'ERROR: event.tx - tx != object' )
		errors++
	} else if( Object.keys(tx).length != 8 ) {
		console.log( 'ERROR: event.tx - tx incomplete' )
		errors++
	} else {
		for( var t in expect ) {
			if( expect[t].datum == tx.datum ) {
				// found the tx
				for( var key in tx ) {
					if( tx[key] !== expect[t][key] ) {
						errors++
						console.log( 'ERROR: event.tx - '+ t +'.'+ key +' \''+ tx[key] +'\' !== \''+ expect[t][key] +'\'' )
					}
				}
			}
		}
	}
})

// Test direct callback
triodos.openCSV( './test.csv', function( txs ) {
	for( var t in txs ) {
		for( var key in txs[t] ) {
			if( txs[t][key] !== expect[t][key] ) {
				errors++
				console.log( 'ERROR: readCSV() - '+ t +'.'+ key +' \''+ txs[t][key] +'\' !== \''+ expect[t][key] +'\'' )
			}
		}
	}
})