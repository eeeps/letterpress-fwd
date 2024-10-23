
// <looping-carousel> element

class LoopingCarousel extends HTMLElement {

	constructor() {

		super(); // duper
	
	
		const threshold = 0.99 // weird misses when it's 1
		const options = {
			root: this,
			rootMargin: "0px",
			threshold: threshold 
		};
		
		const callback = ( entries, observer ) => {
			entries.forEach( entry => {
				console.log( entry );
				if ( entry.intersectionRatio >= threshold ) { // if element just became fully visible
					entry.target.classList.add( 'visible' );
				}
				else { // otherwise it just became *not* fully visible
					entry.target.classList.remove( 'visible' );
				}
				// css uses these classes to style...
			} );
		}

		this.intersectionObserver = new IntersectionObserver( callback, options );
	
	}
	
	connectedCallback() {
		
		const carousel = [ ...this.children ][ 0 ];
		const slides = [ ...carousel.children ];
		
		slides.forEach( slide => {
			this.intersectionObserver.observe( slide )
		} );
		
	}

}

customElements.define( 'looping-carousel', LoopingCarousel );

export default LoopingCarousel;