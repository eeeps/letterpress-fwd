

async function submitForm( formEl ) {

	const response = await fetch( formEl.action, {
	    method: 'POST',
	    body: new URLSearchParams( new FormData( formEl ) )
	} );
	
	return response;

}


function updateDomSuccess( formEl ) {

	formEl.innerHTML = `<p class="thanks">Thank you!</p>
<p>We’ll be in touch.</p>`;

}


function updateDomFail( formEl, detailedError ) {

	const errorEl = document.createElement( 'div' );
	errorEl.classList.add( 'errorBar' );
	
	const p = document.createElement( 'p' );
	p.innerHTML = `
There was a problem submitting your information.
Try again, but if the problem persists,
just send us an email at <a href="mailto:hello@letterpressfwd.org">hello@letterpressfwd.org</a>.
`;

	const details = document.createElement( 'details' );
	const summary = document.createElement( 'summary' );
	const detailed_p = document.createElement( 'p' );
	
	summary.textContent = 'Technical details:';
	detailed_p.textContent = detailedError;

	details.appendChild( summary );
	details.appendChild( detailed_p );
	
	errorEl.appendChild( p );
	errorEl.appendChild( details );

	formEl.prepend( errorEl );

}

async function submitFormAndUpdateDom( formEl ) {	

	const response = await submitForm( formEl );
	
	if ( response.ok ) { // do I need to look for errors or messages in the JSON object, too?
		updateDomSuccess( formEl );
		return;
	} else {
		const detailedError = `The server responded with status ${ response.status }, “${ response.statusText }”`;
		updateDomFail( formEl, detailedError );
		return;
	}

}

export default function enhanceForm( formEl ) {

	formEl.addEventListener( 'submit', ( event ) => {
		// todo: some kind of loading indicator?
		// simplest might be cursor:wait (i guess via a submitting-in-progress class)
		// (undoing that after success or fail would require making this fn async too)
		event.preventDefault();
		submitFormAndUpdateDom( formEl );
	} );

}