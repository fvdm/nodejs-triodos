# nodejs-triodos

Parser voor Triodos data bestanden

# Gebruik

Installatie en opzet via NPM:

```sh
npm install triodos-csv
```
```js
var triodos = require('triodos-csv')
```

Of via Github

```sh
git clone https://github.com/fvdm/nodejs-triodos.git
```
```js
var triodos = require('./nodejs-triodos/triodos.js')
```

# Events

## fail
### ( object )

Er is een probleem opgetreden bij het lezen van het bestand.

```js
triodos.on( 'fail', function( reason ) {
	// reason.path      : padnaam van het bestand
	// reason.encoding  : vereiste tekenset
	// reason.error     : foutmelding
})
```

## klaar
### ( array )

Alle transacties zijn verwerkt. De array bevat de transacties.

```js
triodos.on( 'klaar', function( transacties ) {
	console.log( triodos.stats )
})
```

## tx
### ( object )

Er is een transactie verwerkt.

```js
triodos.on( 'tx', function( tx ) {
	console.log( tx.datum +' - '+ tx.bedrag +' - '+ tx.richting )
})
```

# Functies

## readCSV
### ( filepath, [callback] )

* **filepath** - vereist - pad naar het CSV bestand om te verwerken.
* **callback** - optioneel - callback functie ontvangt een **array** met alle transacties als alles verwerkt is.

```js
triodos.readCSV( '~/Downloads/mutations.csv', function( transacties ) {
	console.log( 'Het bestand bevat '+ transacties.length +' transacties' )
})
```