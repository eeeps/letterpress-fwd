export default async ( req, context ) => {

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
	console.log(fd); // where does this go?
	
	if ( !fd.has('email') ||
	     !fd.has('name') ) {
		return new Response('400 Bad Request', {
			status: 400,
			statusText: 'Requests must include `email` and `name` keys'
		} );
	}

	// todo? get rid of the automation and just make this a regular API request
	// (hiding the Personal Access Token in a secret, of course)
	const url = 'https://hooks.airtable.com/workflows/v1/genericWebhook/appffk9L1NpnhSONs/wflXrHkPvtFKNX91y/wtrk1IkFQDIAGgEx1'
	const airtableResponse = await fetch( url, {
	    method: 'POST',
	    body: new URLSearchParams( fd )
	} );
	
	if ( airtableResponse.ok ) {
		// todo also check for success:true? in the body (if we keep doing the automation thing)
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
	} else {
		// todo pass errors
		const body = await airtableResponse.text();
		return new Response( `Upstream error; HTTP code ${ airtableResponse.status } ${ airtableResponse.statusText }; said, “${ body }”`, {
			status: 500,
			statusText: 'Internal Service Error'
		} )
	}

};