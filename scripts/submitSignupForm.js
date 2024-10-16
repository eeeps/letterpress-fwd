

async function submitForm( formEl ) {

	const response = await fetch( formEl.action, {
	    method: 'POST',
	    mode: 'no-cors', // Airtable doesn't support CORS
	    body: new URLSearchParams( new FormData( formEl ) )
	} );
	
	return response;

}


function updateDomSuccess( formEl ) {

	// todo: this is provisional, do better
	formEl.innerHTML = '<p>thank u!</p>'

}


function updateDomFail( formEl, detailedError ) {

	const errorDom = `<div class="errorBar">
<p>
	There was a problem submitting your information.
	Try again, but if the problem persists,
	just send us an email at <a href="mailto:todo">todo</a>.
</p>
<details>
	<summary>Technical details:</summary>
	<p>${ detailedError }</p>
</details>
</div>`;

	formEl.prepend( errorDom );

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