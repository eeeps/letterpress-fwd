export default async ( req, context ) => {

	if ( req.method !== 'POST' ) {
		return new Response('405 Method Not Allowed', {
			status: 405,
			statusText: 'Method Not Allowed'
		} );
	}
	
	if ( !req.headers.has( 'content-type' ) ||
	     !req.headers.get( 'content-type' ).toLowerCase() === 'application/x-www-form-urlencoded' ) {
		return new Response('415 Unsupported Media Type', {
			status: 415,
			statusText: 'Unsupported Media Type'
		} );
	}
	
	const fd = await req.formData();
	console.log(fd); // where does this go?
	
	if ( !fd.has('email') ||
	     !fd.has('name') ) {
		return new Response('400 Bad Request', {
			status: 400,
			statusText: 'Bad Request'
		} );
	}

	const url = 'https://hooks.airtable.com/workflows/v1/genericWebhook/appffk9L1NpnhSONs/wflXrHkPvtFKNX91y/wtrk1IkFQDIAGgEx1'
	const airtableResponse = await fetch( url, {
	    method: 'POST',
	    body: new URLSearchParams( fd )
	} );
	
	if ( airtableResponse.ok ) {
		// todo pretty page for no JS folks?
		return new Response( '200 OK', {
			status: 200,
			statusText: 'OK'
		} )
	} else {
		// todo pass errors
		return new Response( '500 Internal Server Error', {
			status: 500,
			statusText: '500 Internal Service Error'
		} )
	}

};