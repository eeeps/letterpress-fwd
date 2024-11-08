
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
		
		const io_callback = ( entries, observer ) => {
			entries.forEach( entry => {
				//console.log( entry );
				if ( entry.intersectionRatio >= threshold ) { // if element just became fully visible
					entry.target.classList.add( 'visible' );
				}
				else { // otherwise it just became *not* fully visible
					entry.target.classList.remove( 'visible' );
				}
				// css uses these classes to style...
			} );
		}

		this.intersectionObserver = new IntersectionObserver( io_callback, options );
	
	}
	
	async connectedCallback() {
		
		const carousel = [ ...this.children ][ 0 ];
		const originalSlides = [ ...carousel.children ];
		
		// for finding the one slide to highlight, with CSS		
		const activeSlideWindow = document.createElement( 'div' );
		activeSlideWindow.classList.add( 'activeSlideWindow' );
		this.prepend( activeSlideWindow ); // sibling of the carousel
		
		originalSlides.forEach( slide => {
			this.intersectionObserver.observe( slide )
		} );
		originalSlides[1].scrollIntoView();
		
	}

}

customElements.define( 'looping-carousel', LoopingCarousel );

export default LoopingCarousel;