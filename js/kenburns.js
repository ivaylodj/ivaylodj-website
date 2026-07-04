/*
    Ken Burns effect JQuery plugin
    Copyright (C) 2011 Will McGugan http://www.willmcgugan.com
*/

(function(e){e.fn.kenburns=function(t){function g(){var e=new Date;return e.getTime()-i}function y(e,t,n,r,i){return{x:e+(n-e)*i,y:t+(r-t)*i}}function b(e,t,n){var r=y(e[0],e[1],t[0],t[1],n);var i=y(e[2],e[3],t[2],t[3],n);return[r.x,r.y,i.x,i.y]}function w(e,t){var n=e[2]-e[0];var r=e[3]-e[1];var i=(e[2]+e[0])/2;var s=(e[3]+e[1])/2;var o=n*t;var u=r*t;return[i-o/2,s-u/2,i+o/2,s+u/2]}function E(e,t,n,r){var i=e/t;var s=n/r;var o=t*s;var u=t;if(o>e){var o=e;var u=e/s}var a=(e-o)/2;var f=(t-u)/2;return[a,f,a+o,f+u]}function S(e,t){var n=m[e];if(!n.initialized){var r=new Image;n.image=r;n.loaded=false;r.onload=function(){n.loaded=true;var i=r.width;var u=r.height;var a=E(i,u,s,o);var f=w(a,d);var l=Math.floor(Math.random()*3)-1;var c=Math.floor(Math.random()*3)-1;l/=2;c/=2;var h=f[0];f[0]+=h*l;f[2]+=h*l;var p=f[1];f[1]+=p*c;f[3]+=p*c;if(e%2){n.r1=a;n.r2=f}else{n.r1=f;n.r2=a}if(t){t()}};n.initialized=true;r.src=n.path}return n}function x(e,t,n){if(t>1){return}var i=S(e);if(i.loaded){var u=b(i.r1,i.r2,t);var a=Math.min(1,n);if(a>0){r.save();r.globalAlpha=Math.min(1,a);r.drawImage(i.image,u[0],u[1],u[2]-u[0],u[3]-u[1],0,0,s,o);r.restore()}}}function T(){r.save();r.globalAlpha=1;r.fillStyle=v;r.fillRect(0,0,r.canvas.width,r.canvas.height);r.restore()}function N(){function u(e){return(e+m.length)%m.length}var e=g();var i=Math.floor(e/(a-f));var s=i*(a-f);var o=e-s;if(o<f){var l=i-1;var c=s-a+f;var h=e-c;if(e<f){T()}else{x(u(l),h/a,1)}}x(u(i),o/a,o/f);if(t.post_render_callback){t.post_render_callback(n,r)}var p=u(i+1);S(p)}var n=e(this);var r=this[0].getContext("2d");var i=null;var s=n.width();var o=n.height();var u=t.images;var a=t.display_time||7e3;var f=Math.min(a/2,t.fade_time||1e3);var l=a-f*2;var c=f-a;var h=t.frames_per_second||30;var p=1/h*1e3;var d=1/(t.zoom||2);var v=t.background_color||"#000000";var m=[];e(u).each(function(e,t){m.push({path:t,initialized:false,loaded:false})});S(0,function(){S(1,function(){i=g();setInterval(N,p)})})}})(jQuery)

var gallery_set_string = jQuery('.cherga_kenburns').attr('data-slides'),
	gallery_set = gallery_set_string.split(','),
	kenburns_time = jQuery('.cherga_kenburns').attr('data-time'),
	kenburns_fade = jQuery('.cherga_kenburns').attr('data-fade'),
	kenburns_zoom = jQuery('.cherga_kenburns').attr('data-zoom');

jQuery(document).ready(function(){
	setTimeout("jQuery('.cherga_kenburns').addClass('cherga_kenburns_started')",700);
	setTimeout("cherga_kenburns_resize()",200);
});

jQuery(window).resize(function(){ 
	jQuery('#kenburns').remove();
	setTimeout('cherga_kenburns_resize()', 200);
});

function cherga_kenburns_resize() {
	/* Setup Thumbs */
	if (jQuery('.cherga_kenburns_wrapper.auto_height').length > 0) {
		jQuery('.cherga_kenburns_wrapper.auto_height').each(function() {
			var setHeight = jQuery(this).parents('section.elementor-element').children('.elementor-container').height() - parseInt(jQuery(this).parents('.elementor-column-wrap').css('padding-top'),10) - parseInt(jQuery(this).parents('.elementor-column-wrap').css('padding-bottom'),10);
			jQuery(this).height(setHeight);
		});
	}
	
	if (jQuery('.cherga_kenburns_wrapper.screen_height').length > 0) {
		jQuery('.cherga_kenburns_wrapper.screen_height').each(function() {
			var setHeight = cherga_window.height();
			if (jQuery('#wpadminbar').length > 0) {
				setHeight = setHeight - jQuery('#wpadminbar').height();
			}
			if (jQuery(this).attr('data-header') == 'yes') {
				setHeight = setHeight - jQuery('header.cherga_main_header').height();
			}
			if (jQuery(this).attr('data-footer') == 'yes') {
				setHeight = setHeight - jQuery('footer.cherga_footer').height();
			}
			jQuery(this).height(setHeight);
		});
	}

	var set_width = jQuery('.cherga_kenburns').width(),
		set_height = jQuery('.cherga_kenburns').height();

	if (jQuery('.cherga_kenburns').find('#kenburns').length > 0) {
		jQuery('.cherga_kenburns').find('#kenburns').remove();
	}
	jQuery('.cherga_kenburns').append('<canvas id=\"kenburns\"><p>Your browser does not support canvas!</p></canvas>');
	
	jQuery('#kenburns').attr('width', set_width);
	jQuery('#kenburns').attr('height', set_height);
	
	jQuery('#kenburns').kenburns({
		images: gallery_set,
		frames_per_second: 30,
		display_time: kenburns_time,
		fade_time: kenburns_fade,
		zoom: kenburns_zoom,
		background_color:'#000000'
	});
	jQuery('#kenburns').css('top', '0px');
}