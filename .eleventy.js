module.exports = function( eleventyConfig ) {
	eleventyConfig.addPassthroughCopy( 'style.css' );
	eleventyConfig.addPassthroughCopy( 'fonts/Inter/static/Inter-Bold.woff2' );
	eleventyConfig.addPassthroughCopy( 'fonts/Inter/static/Inter-Regular.woff2' );
	eleventyConfig.addPassthroughCopy( 'fonts/EB_Garamond/static/EBGaramond-Regular.woff2' );
} 