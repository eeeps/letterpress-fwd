function firstAndLast( fullName ) {
	// make some pretty big assumptions about names!
	const splitNames = fullName
		.split(' ')
		.filter( d => d !== ' ' && d !== '' );
	if ( splitNames.length === 0 ) {
		return { firstName: 'N/A', lastName: 'N/A' };
	}
	if ( splitNames.length === 1 ) {
		return { firstName: splitNames[ 0 ], lastName: 'N/A' };
	}
	return {
		firstName: splitNames[ 0 ],
		lastName: splitNames.slice( 1 ).join( ' ' )
	};
}

export default async ( req, context ) => {

//	console.log('hello');

	// validate incoming request
	if ( req.method !== 'POST' ) {
		return new Response('405 Method Not Allowed', {
			status: 405,
			statusText: 'We only accept POSTs'
		} );
	}
	
	if ( !req.headers.has( 'content-type' ) ||
	     !req.headers.get( 'content-type' ).toLowerCase() === 'application/x-www-form-urlencoded' ) {
		return new Response('415 Unsupported Media Type', {
			status: 415,
			statusText: 'Requests must have Content-Type: application/x-www-form-urlencoded'
		} );
	}
	
	const fd = await req.formData();
//	console.log(fd);
	
	if ( !fd.has( 'email' ) ||
	     !fd.has( 'name' ) ) {
		return new Response('400 Bad Request', {
			status: 400,
			statusText: 'Requests must include `email` and `name` keys'
		} );
	}
	
	// just a little email validation
	const emailRegex = /.+\@.+/;
	if ( !( emailRegex.test( fd.get( 'email' ) ) ) ) {
		return new Response('400 Bad Request', {
			status: 400,
			statusText: 'Invalid email address'
		} );
	}

	// reject bots that filled the hidden honeypot field
	if ( fd.has( 'honeypot' ) ) {
		return new Response('400 Bad Request', {
			status: 400,
			statusText: 'Bad Request'
		} );
	}

	const apiUrl = `https://api.bloomerang.co/v2`;
	
	// make a new constituent
	
	// make some pretty big assumptions about their name!
	const { firstName, lastName } = firstAndLast( fd.get( 'name' ) );
	
	const constituentReponse = await fetch( `${ apiUrl }/constituent`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			'X-API-KEY': process.env.BLOOMERANG_API_KEY
		},
		body: JSON.stringify( {
			'Type': 'Individual',
			'FirstName': firstName,
			'LastName': lastName
		} )
	} );
	
	// if Bloomerang failed, bail
	if ( !constituentReponse.ok ) {
		console.log( constituentReponse );
		const constituentErrorJson = await constituentReponse.json();
		const constituentErrorMessage = constituentErrorJson[ 'Message' ];
		return new Response('500 Internal Server Error', {
			status: 500,
			statusText: `Upstream error; Bloomerang failed to create a constituent and returned HTTP code ${ constituentReponse.status } ${ constituentReponse.statusText }. Bloomerang gave the following error message: ${ constituentErrorMessage }`
		} );
	}
	
	// get accountID
	const constituentJson = await constituentReponse.json();
	const constituentId = constituentJson[ 'Id' ];
//	console.log( constituentJson, constituentId );
	
	
	// make a new email record (attached to the new constituent)
	
	const emailResponse = await fetch( `${ apiUrl }/email`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			'X-API-KEY': process.env.BLOOMERANG_API_KEY
		},
		body: JSON.stringify( {
			'AccountId': constituentId,
			'Type': 'Home',
			'Value': fd.get( 'email' ),
			'IsPrimary': true
		} )
	} );
	
	// if Bloomerang failed, rollback the constituent AND bail
	if ( !emailResponse.ok ) {
		console.log( emailResponse );
		
		// rollback
		const deleteResponse = await fetch( `${ apiUrl }/constituent/${ constituentId }`, {
			method: 'DELETE',
			headers: {
				'X-API-KEY': process.env.BLOOMERANG_API_KEY
			}
		} ); // if this fails, oh well...
		
		// bail
		const emailErrorJson = await emailResponse.json();
		const emailErrorMessage = emailErrorJson[ 'Message' ];
		return new Response('500 Internal Server Error', {
			status: 500,
			statusText: `Upstream error; Bloomerang failed to create a an email address record and returned HTTP code ${ emailResponse.status } ${ emailResponse.statusText }. Bloomerang gave the following error message: ${ emailErrorMessage }`
		} );
	}
	
	// make a new note with the contents of the comments field
	const noteResponse = await fetch( `${ apiUrl }/note`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			'X-API-KEY': process.env.BLOOMERANG_API_KEY
		},
		body: JSON.stringify( {
			'AccountId': constituentId,
			'Date': ( new Date() ).toISOString().split( 'T' )[ 0 ],
			'Note': fd.get( 'comment' ) // todo sanitize in any way?
		} )
	} );
	// don't roll anything back or complain if this fails, it's just gravy
	
	// success!
	return new Response( `<!doctype html>
<html lang="en">
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width" />
<title>Thank you!</title>
<link rel=stylesheet href="/style.css" />
<style>
html {
	text-align: center;
}
</style>
</head>
<body>

<h1>Thank you!</h1>
<p>We’ll be in touch.</p>
<p><a href="/">Go back.</a></p>

</body>
</html>
`,
		{
			status: 200,
			statusText: 'OK',
			headers: {
				'content-type': 'text/html'
			}
		}
	)

};