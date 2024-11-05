
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
				console.log( this.observedWidth );
				console.log( this.slideWrapper.getBoundingClientRect() );
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
	
		const ro_callback = ( entries => {
			entries.forEach( entry => {
				this.observedWidth = entry.borderBoxSize[ 0 ].inlineSize;
// 				console.log( this.observedWidth );
			} );
		} );
		
		this.resizeObserver = new ResizeObserver( ro_callback );
	
	}
	
	async connectedCallback() {
		
		const carousel = [ ...this.children ][ 0 ];
		const originalSlides = [ ...carousel.children ];
		
		// for finding the one slide to highlight, with CSS		
		const activeSlideWindow = document.createElement( 'div' );
		activeSlideWindow.classList.add( 'activeSlideWindow' );
		this.prepend( activeSlideWindow ); // sibling of the carousel
		
		// wrapper just for measuring
		const slideWrapper = document.createElement( 'div' );
		slideWrapper.classList.add( 'slideWrapper' );
		this.slideWrapper = slideWrapper; //todo
		carousel.prepend( slideWrapper );
		originalSlides.forEach( slide => slideWrapper.appendChild( slide ) );
		
		// after all of the images have loaded, we can measure things
		// i mean, hopefully we are reserving space, using <img height width>,
		// and we could have gotten to work immediately
		// but in case not...
		const orignalSlidesImgs = [ ...carousel.querySelectorAll( 'img' ) ];
		const imgLoadPromises = orignalSlidesImgs.map( img => 
			( new Promise( (resolve, reject ) => {
				if ( img.complete ) {
// 					console.log( img );
// 					console.log( 'was already complete' );
					resolve( img );
				} else {
					img.addEventListener( 'load', () => {
// 						console.log( img );
// 						console.log( 'finished loading' );
						resolve( img );
					} );
				}
			} ) )
		);
		await Promise.all( imgLoadPromises );
		// console.log('all of the images loaded');
		
// 		originalSlides.forEach()
		this.resizeObserver.observe( slideWrapper, { box: 'border-box' } );
		
		const beforeSlides = originalSlides
			.map( slide =>  slide.cloneNode( true ) );
		const afterSlides = originalSlides
			.map( slide =>  slide.cloneNode( true ) );
		
// 		beforeSlides.toReversed().forEach( slide =>
// 			slideWrapper.prepend( slide )
// 		);
// 		afterSlides.forEach( slide => 
// 			slideWrapper.append( slide )
// 		);
		
		[ ...beforeSlides, ...originalSlides, ...afterSlides ].forEach( slide => {
			this.intersectionObserver.observe( slide )
		} );
		originalSlides[0].scrollIntoView();
		
	}

}

customElements.define( 'looping-carousel', LoopingCarousel );

export default LoopingCarousel;