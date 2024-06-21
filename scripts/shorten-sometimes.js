
// <shorten-sometimes> (& <sometimes-hidden>) elements

class ShortenSometimes extends HTMLElement {

	constructor() {

		super(); // duper

		// need this to enable custom states
		this._internals = this.attachInternals();

	}

	connectedCallback() {

		const sometimesHidden = this.querySelector( 'sometimes-hidden' );
		const shortenWhenAttr = this.getAttribute( 'shorten-when' );

		// element does nothing without both:
		// - `shorten-when` attribute
		// - a `<sometimes-hidden>` child
		if ( !shortenWhenAttr || !sometimesHidden ) { 
			return;
		}

		// styles
		// get these in frist to prevent repaints
		const styleEl = document.createElement('style');
		styleEl.textContent = `
shorten-sometimes[aria-expanded=false] sometimes-hidden {
  display: none;
}

shorten-sometimes[aria-expanded=false] button.less {
  display: none;
}

shorten-sometimes[aria-expanded=true] button.more {
  display: none;
}
shorten-stometimes:state(shortenable) {
outline: 1em solid green;
}
shorten-sometimes:not(:state(shortenable)) {
  sometimes-hidden {
    display: unset; /* show */
  }
  button.more,
  button.less {
    display: none; /* hide */
  }
}    
`;

		// add the style to the dom
		this.prepend( styleEl );


		// shortenable state
		// based on shorten-when attribute

		const shortenWhenMq = window.matchMedia( shortenWhenAttr );

		const respondToMq = () => {
			if ( shortenWhenMq.matches ) {
				this.setAttribute( 'aria-expanded', 'false' );
				this._internals.states.add( 'shortenable' );
			} else {
				this.setAttribute( 'aria-expanded', 'true' );
				this._internals.states.delete( 'shortenable' );
			}
		}
		shortenWhenMq.addEventListener( 'change', respondToMq );
		respondToMq();
		
		// more and less toggles
		
		// create
		const more = document.createElement( 'button' );
		more.setAttribute( 'type', 'button' );
		more.classList.add('more');
		more.textContent = " More";
		const less = document.createElement( 'button' );
		less.setAttribute( 'type', 'button' );
		less.classList.add('less');
		less.textContent = "Less";
		
		// make them do stuff
		more.addEventListener( 'click', () => {
			this.setAttribute( 'aria-expanded', 'true' ); 
		} );
		
		less.addEventListener( 'click', () => {
			this.setAttribute( 'aria-expanded', 'false' ); 
		} );
		
		// add to the DOM
		sometimesHidden.before( more );
		sometimesHidden.after( less );
		
	}
}

customElements.define( 'shorten-sometimes', ShortenSometimes);

export default ShortenSometimes;
