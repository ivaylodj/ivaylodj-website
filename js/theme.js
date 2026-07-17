/*
 * Created by Pixel-Mafia
 * www.pixel-mafia.com
*/
"use strict";

var fullscreen_elem = document.documentElement,
	cherga_window = jQuery(window),
	cherga_header = jQuery('header.cherga_main_header'),
	cherga_footer = jQuery('footer.cherga_footer'),
	cherga_header_logo_part = jQuery('.cherga_header_logo_part'),
	cherga_header_menu_part = jQuery('.cherga_header_menu_part'),
	cherga_header_socials_part = jQuery('.cherga_header_socials_part'),
	cherga_nav = jQuery('.cherga_nav'),
	cherga_menu = jQuery('.cherga_menu'),
    cherga_dp = jQuery('.cherga_dp'),
    cherga_body = jQuery('body');

// Photoswipe Lightbox
if (jQuery('.cherga_photoswipe_wrapper').length > 0) {
	var photoswipe_html = '\
	<!-- Root element of PhotoSwipe. Must have class pswp. -->\
	<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">\
		<div class="pswp__bg"></div><!-- PSWP Background -->\
		\
		<div class="pswp__scroll-wrap">\
			<div class="pswp__container">\
				<div class="pswp__item"></div>\
				<div class="pswp__item"></div>\
				<div class="pswp__item"></div>\
			</div><!-- .pswp__container -->\
			\
			<div class="pswp__ui pswp__ui--hidden">\
				<div class="pswp__top-bar">\
					<!--  Controls are self-explanatory. Order can be changed. -->\
					<div class="pswp__counter"></div>\
					\
					<button class="pswp__button pswp__button--close" title="Close (Esc)"></button>\
					<button class="pswp__button pswp__button--share" title="Share"></button>\
					<button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button>\
					\
					<!-- Preloader demo http://codepen.io/dimsemenov/pen/yyBWoR -->\
					<!-- element will get class pswp__preloader--active when preloader is running -->\
					<div class="pswp__preloader">\
						<div class="pswp__preloader__icn">\
						  <div class="pswp__preloader__cut">\
							<div class="pswp__preloader__donut"></div>\
						  </div><!-- .pswp__preloader__cut -->\
						</div><!-- .pswp__preloader__icn -->\
					</div><!-- .pswp__preloader -->\
				</div><!-- .pswp__top-bar -->\
				\
				<div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">\
					<div class="pswp__share-tooltip"></div>\
				</div><!-- .pswp__share-modal -->\
				\
				<button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"></button>\
				<button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)"></button>\
				\
				<div class="pswp__caption">\
					<div class="pswp__caption__center"></div>\
				</div><!-- .pswp__caption -->\
			</div><!-- .pswp__ui pswp__ui--hidden -->\
		</div><!-- .pswp__scroll-wrap -->\
	</div><!-- .pswp -->\
	';

	jQuery('body').append(photoswipe_html);

	var $pswp = jQuery('.pswp')[0],
		$pswp_gallery_array = [];

	jQuery('.cherga_photoswipe_wrapper').each(function(){
		var this_id = jQuery(this).attr('data-uniqid');
		$pswp_gallery_array['cherga_gallery_' + this_id] = {};
		$pswp_gallery_array['cherga_gallery_' + this_id].slides = [];
		jQuery(this).find('.cherga_pswp_slide').each(function(){
			if (jQuery(this).hasClass('cherga_pswp_video_slide')) {
				var cherga_thishref = jQuery(this).attr('href');
				if(cherga_thishref.indexOf('youtu') + 1) {
					//YT Video
					var videoid_split = cherga_thishref.split('='),
						videoid = videoid_split[1],
						cherga_pswp_html = '<div class="cherga_pswp_video_wrapper"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/' + videoid + '?controls=1&autoplay=0&showinfo=0&modestbranding=1&wmode=opaque&rel=0&hd=1&disablekb=1" frameborder="0" allowfullscreen></iframe></div>';
				}
				if(cherga_thishref.indexOf('vimeo') + 1) {
					//Vimeo Video
					var videoid_split = cherga_thishref.split('m/'),
						videoid = videoid_split[1],
						cherga_pswp_html = '<div class="cherga_pswp_video_wrapper"><iframe width="100%" height="100%" src="https://player.vimeo.com/video/' + videoid + '?api=1&amp;title=0&amp;byline=0&amp;portrait=0&autoplay=0&loop=0&controls=1" frameborder="0" webkitAllowFullScreen allowFullScreen></iframe></div>';0
				}
				var this_item = {
					html : cherga_pswp_html
				}
				$pswp_gallery_array['cherga_gallery_' + this_id].slides.push(this_item);
			} else {
				var size_attr = jQuery(this).data('size'),
					item_width = 1600,
					item_height = 1200;
				if (size_attr) {
					var item_size = size_attr.split('x');
					item_width = item_size[0] || 1600;
					item_height = item_size[1] || 1200;
				}
				var this_item = {
					src : jQuery(this).attr('href'),
					w : item_width,
					h : item_height
				};
				$pswp_gallery_array['cherga_gallery_' + this_id].slides.push(this_item);
			}
		});
	});
}

jQuery(document).on('contextmenu', function (e) {
    if (jQuery('.cherga_drc_trigger').length) {
        e.preventDefault();
        if (jQuery('.cherga_drc_trigger').hasClass('cherga_drc_alert_enabled')) {
            alert(jQuery('.cherga_drc_trigger').attr('data-alert'));
        }
    }
});
jQuery(document).on('click', '.cherga_pswp_slide', function (event) {
	event.preventDefault();
	var $index = parseInt(jQuery(this).attr('data-count'), 10),
		this_id = jQuery(this).parents('.cherga_photoswipe_wrapper').attr('data-uniqid'),
		options = {
		index: $index,
		bgOpacity: 0.7,
		showHideOpacity: true
	};

	// Initialize PhotoSwipe
	var cherga_lightBox = new PhotoSwipe($pswp, PhotoSwipeUI_Default, $pswp_gallery_array['cherga_gallery_' + this_id].slides, options);
	cherga_lightBox.init();
	cherga_lightBox.listen('gettingData', function(index, item) {
		if (jQuery('.cherga_pswp_video_wrapper').length > 0) {
			var cherga_window_height = cherga_window.height();
			if (jQuery('.pswp__top-bar').length > 0) {
				cherga_window_height = cherga_window_height - jQuery('.pswp__top-bar').height()*2;
			}
			if (jQuery('#wpadminbar').length > 0) {
				cherga_window_height = cherga_window_height - jQuery('#wpadminbar').height();
			}
			if ((cherga_window.width()/16)*9 > cherga_window_height) {
				var set_width = (cherga_window_height/9)*16,
					set_height = cherga_window_height;
			} else {
				var set_height = (cherga_window.width()/16)*9,
					set_width = cherga_window.width();
			}
			jQuery('.cherga_pswp_video_wrapper').width(set_width).height(set_height);
		}
	});
});

jQuery(document).on('click', '.grid-item-button-approve', function (event) {
	event.preventDefault();
	var item_container = jQuery(this).parents('.grid-item-proofing'),
		this_link = jQuery(this);
	if (item_container.hasClass('approved')) {
		// Already Approved
		item_container.removeClass('approved');
		item_container.addClass('unviewed');
		this_link.find('i').removeClass().addClass('fa fa-check-circle');
	} else {
		// Not Approved
		item_container.addClass('approved');
		item_container.removeClass('unviewed');
		this_link.find('i').removeClass().addClass('fa fa-minus-circle');
	}
	if (item_container.hasClass('unapproved')) {
		// Was Unapproved
		item_container.removeClass('unapproved');
		item_container.find('.grid-item-button-unapprove i').removeClass().addClass('fa fa-times-circle');
	}
});

jQuery(document).on('click', '.grid-item-button-unapprove', function (event) {
	event.preventDefault();
	var item_container = jQuery(this).parents('.grid-item-proofing'),
		this_link = jQuery(this);
	if (item_container.hasClass('unapproved')) {
		// Already Unapprved
		item_container.removeClass('unapproved');
		item_container.addClass('unviewed');
		this_link.find('i').removeClass().addClass('fa fa-times-circle');
	} else {
		// Not Unapproved
		item_container.addClass('unapproved');
		item_container.removeClass('unviewed');
		this_link.find('i').removeClass().addClass('fa fa-minus-circle');
	}
	if (item_container.hasClass('approved')) {
		// Was Approved
		item_container.removeClass('approved');
		item_container.find('.grid-item-button-approve i').removeClass().addClass('fa fa-check-circle');
	}
});

jQuery(document).on('click', '.cherga_photo_proofing_notified', function () {
	event.preventDefault();
	var this_button = jQuery(this),
		this_wrapper = this_button.parent('.cherga_photo_proofing_notified_wrapper'),
		this_message = this_wrapper.find('.cherga_photo_proofing_notified_message');
	this_button.slideUp(300);
	this_wrapper.addClass('cherga_already_notified');
});

jQuery(function() {
	// Check native support
	if (!jQuery.fullscreen.isNativelySupported()) {
		jQuery('.cherga_toogle_fullview').remove();
	}

	// Toggle Fullscreen
	jQuery('.cherga_toogle_fullview').on('click', function(){
		jQuery('html').toggleClass('cherga_in_fullview_mode');

		if (jQuery('html').hasClass('cherga_in_fullview_mode')) {
			jQuery('html').fullscreen({overflow : 'visible'});
			return false;
		} else {
			jQuery.fullscreen.exit();
			return false;
		}
	});

	// Document's event
	jQuery(document).on('fscreenchange', function(e, state, elem) {
		if (jQuery.fullscreen.isFullScreen()) {
			// We currently in fullscreen mode
		} else {
			// We exiting fullscreen mode
			jQuery('html').removeClass('cherga_in_fullview_mode');
			cherga_window.trigger('resize');
			setTimeout("cherga_window.trigger('resize')", 500);
		}
	});
});

// Contact Form
jQuery('#contact_form input[type=submit]').on('click', function () {
	var this_contact = jQuery(this).parents('form');
	
	jQuery.post('mail.php', {
		send_mail: 'true',
		form_name: this_contact.find('input[name=your_name]').val(),
		form_email: this_contact.find('input[name=your_email]').val(),
		form_text: this_contact.find('textarea[name=your_message]').val()
	}).done(function (data) {
		alert(data);
	});

	return false;
});

jQuery(document).ready(function () {
	if (jQuery('.fadeOnLoad').length) {
        if (jQuery('.cherga_preloader_wrapper').length) {

        } else {
            setTimeout("jQuery('.fadeOnLoad').removeClass('fadeOnLoad')",500);
        }
	}

	// Count Down
	if (jQuery('.cherga_element_countdown').length > 0) {
		jQuery('html').addClass('cherga_transparent_header');
		jQuery('time').countDown({
			with_separators: false
		});
	}
	
    cherga_countdown();

    jQuery('.cherga_nav a').each(function () {
        if (jQuery(this).attr('href') == '#') {
            jQuery(this).attr('href', 'javascript:void(0)');
        }
    });

	jQuery('nav.cherga_mobile_nav').find('.sub-menu').slideUp(1);

	jQuery('nav.cherga_mobile_nav a').each(function () {
		if (jQuery(this).parent('li').hasClass('menu-item-has-children')) {
			jQuery(this).addClass('open_sub_menu');
		}
	});

    if (jQuery('#wpadminbar').length > 0) {
        jQuery('html').addClass('has_admin_bar');
    }

    var cherga_js_bg_color = jQuery('.cherga_js_bg_color'),
        cherga_js_bg_image = jQuery('.cherga_js_bg_image'),
        cherga_js_color = jQuery('.cherga_js_color'),
        cherga_js_font_size = jQuery('.cherga_js_font_size'),
        cherga_js_height = jQuery('.cherga_js_height'),
        cherga_js_min_height = jQuery('.cherga_js_min_height');

    if (jQuery(cherga_js_bg_color).length > 0) {
        jQuery(cherga_js_bg_color).each(function () {
            jQuery(this).css('background-color', jQuery(this).attr('data-bgcolor'));
        });
    }

    if (jQuery(cherga_js_bg_image).length > 0) {
        jQuery(cherga_js_bg_image).each(function () {
            jQuery(this).css('background-image', 'url(' + jQuery(this).attr('data-src') + ')');
        });
    }

    if (jQuery(cherga_js_color).length > 0) {
        jQuery(cherga_js_color).each(function () {
            jQuery(this).css('color', jQuery(this).attr('data-color'));
        });
    }

    if (jQuery(cherga_js_font_size).length > 0) {
        jQuery(cherga_js_font_size).each(function(){
            var font_size = jQuery(this).attr('data-font-size'),
                line_height = jQuery(this).attr('data-line-height');
            
            if (typeof line_height !== 'undefined') {
	            jQuery(this).css({'font-size': font_size, 'line-height': line_height});
            } else {
	            jQuery(this).css({'font-size': font_size, 'line-height': font_size});
            }
        });
    }

    if (jQuery(cherga_js_height).length > 0) {
        jQuery(cherga_js_height).each(function(){
            var block_height = jQuery(this).attr('data-height');
            jQuery(this).height(block_height);
        });
    }
    
    if (jQuery(cherga_js_min_height).length > 0) {
    	jQuery(cherga_js_min_height).each(function () {
		    var block_min_height = jQuery(this).attr('data-min-height');
		    jQuery(this).css('min-height', block_min_height + 'px');
	    });
    }

    if (jQuery('.cherga_js_opacity').length > 0) {
        jQuery('.cherga_js_opacity').each(function(){
            var block_opacity = jQuery(this).attr('data-opacity');
            jQuery(this).css('opacity', block_opacity);
        });
    }

	if(jQuery('.cherga_js_transition').length > 0) {
		jQuery('.cherga_js_transition').each(function(){
			var transition_time = jQuery(this).attr('data-transition') + 'ms';
			jQuery(this).css({'transition-duration': transition_time});
		});
	}

    if (jQuery('.cherga_testimonials_carousel').length > 0) {
        jQuery(".cherga_testimonials_carousel").each(function () {
            var autoplay = jQuery(this).attr('data-autoplay'),
                speed = parseInt(jQuery(this).attr('data-speed')),
				pause = jQuery(this).attr('data-pause'),
				infinite = jQuery(this).attr('data-infinite');
			if (autoplay == 'yes') {
				autoplay = true;
			} else {
				autoplay = false;
			}
			if (pause == 'yes') {
				pause = true;
			} else {
				pause = false;
			}
			if (infinite == 'yes') {
				infinite = true;
			} else {
				infinite = false;
			}

            jQuery(this).on("initialized.owl.carousel", function (e) {
                jQuery(this).css("opacity", "1");
            });
            jQuery(this).owlCarousel(
                {
                    items: 3,
                    autoHeight: true,
                    center: true,
                    lazyLoad: true,
                    loop: infinite,
                    autoplay: autoplay,
                    autoplayTimeout: speed,
                    autoplayHoverPause: pause,
                    navigation: false,
					responsive: {
                        // breakpoint from 0 up
                        0: {
                            items: 1
                        },
						760: {
							items: 2
						},
                        960: {
                            items: 3
                        }
                    }
                }
            );
        });
    }

    if (jQuery('.cherga_albums_carousel').length > 0) {
        jQuery(".cherga_albums_carousel").each(function () {
            var autoplay = jQuery(this).attr('data-autoplay'),
				items_padding = parseInt(jQuery(this).attr('data-setpad')),
				on_screen = parseInt(jQuery(this).attr('data-onscreen')),
                speed = parseInt(jQuery(this).attr('data-speed')),
				pause = jQuery(this).attr('data-pause'),
				infinite = jQuery(this).attr('data-infinite');
			if (autoplay === 'yes') {
				autoplay = true;
			} else {
				autoplay = false;
			}
			
			if (pause === 'yes') {
				pause = true;
			} else {
				pause = false;
			}
			
			if (infinite === 'yes') {
				infinite = true;
			} else {
				infinite = false;
			}

            jQuery(this).on("initialized.owl.carousel", function (e) {
                jQuery(this).css("opacity", "1");
            });
            jQuery(this).owlCarousel(
                {
                    items: on_screen,
                    autoHeight: true,
                    center: true,
                    lazyLoad: true,
                    loop: infinite,
                    autoplay: autoplay,
                    autoplayTimeout: speed,
                    autoplayHoverPause: pause,
                    navigation: false,
					nav: false,
					dots: false,
					margin: items_padding,
					responsive: {
                        // breakpoint from 0 up
                        0: {
                            items: 1
                        },
						760: {
							items: 2
						},
                        960: {
                            items: 3
                        },
						1200: {
                            items: on_screen
                        }
                    }
                }
            );
        });
	}

	cherga_theme_setup();

	if (jQuery('.cherga_flickr_widget_wrapper').length > 0) {
		cherga_flickr_widget();
	}

	// Filter
    jQuery('.cherga_grid_filter li').eq(0).find('a').click();

    jQuery('.cherga_grid_filter li a').on('click', function(){
        jQuery(this).parents('.cherga_grid_filter').find('a').removeClass('is-checked');
        jQuery(this).parents('.cherga_grid_filter').find('li').removeClass('is-checked');
        jQuery(this).addClass('is-checked');
        jQuery(this).parent().addClass('is-checked');
        var filterSelector = jQuery(this).attr('data-category');

        jQuery(this).parents('div.cherga_front_end_display').find('.cherga_isotope_trigger').isotope({
            filter: filterSelector
        });
        return false;
    });

	if (jQuery('.cherga_site_wrapper').hasClass('fixed_header_footer')) {
		jQuery('.cherga_site_wrapper').prepend('<div class="cherga_main_header_holder"></div>');
		jQuery('.cherga_site_wrapper').append('<div class="cherga_footer_holder"></div>');

        cherga_window.on('scroll', function () {
			var max_scroll = jQuery('body').height() - cherga_window.height();
			if (jQuery('#wpadminbar').length > 0) {
				max_scroll = max_scroll + jQuery('#wpadminbar').height();
			}
            if (cherga_window.scrollTop() > 0) {
                jQuery('html').addClass('page_scrolled');
            } else {
                jQuery('html').removeClass('page_scrolled');
            }
			if (cherga_window.scrollTop() == max_scroll) {
				jQuery('html').addClass('page_reached_bottom');
			} else {
				jQuery('html').removeClass('page_reached_bottom');
			}
        });
	}

	// Back To Top
	jQuery('.cherga_back_to_top').attr('data-bottom', parseInt(jQuery('.cherga_back_to_top').css('bottom')));
	if (cherga_window.scrollTop() > cherga_window.height()) {
		jQuery('.cherga_back_to_top').addClass('cherga_show_me');
	} else {
		jQuery('.cherga_back_to_top').removeClass('cherga_show_me');
		if (jQuery('.cherga_footer').length > 0) {
			var footer_offset = jQuery('.cherga_footer').offset().top,
				check_footer_state = cherga_window.scrollTop() + cherga_window.height(),
				cherga_footer_showed = 'no',
				cherga_b2t_fixer = 0;

			if ( check_footer_state >= footer_offset) {
				cherga_b2t_fixer = check_footer_state - footer_offset;
				cherga_footer_showed = 'yes';
			} else {
				cherga_footer_showed = 'no';
				cherga_b2t_fixer = 0;
			}
			jQuery('.cherga_back_to_top').css('bottom', parseInt(jQuery('.cherga_back_to_top').attr('data-bottom')) + cherga_b2t_fixer + 'px');
		}
	}
	cherga_window.on('scroll', function(){
		if (cherga_window.scrollTop() > cherga_window.height()) {
			jQuery('.cherga_back_to_top').addClass('cherga_show_me');
		} else {
			jQuery('.cherga_back_to_top').removeClass('cherga_show_me');
		}
		if (jQuery('.cherga_footer').length > 0) {
			var footer_offset = jQuery('.cherga_footer').offset().top,
				check_footer_state = cherga_window.scrollTop() + cherga_window.height(),
				cherga_footer_showed = 'no',
				cherga_b2t_fixer = 0;

			if ( check_footer_state >= footer_offset) {
				cherga_b2t_fixer = check_footer_state - footer_offset;
				cherga_footer_showed = 'yes';
			} else {
				cherga_footer_showed = 'no';
				cherga_b2t_fixer = 0;
			}
			jQuery('.cherga_back_to_top').css('bottom', parseInt(jQuery('.cherga_back_to_top').attr('data-bottom')) + cherga_b2t_fixer + 'px');
		}
	});
	jQuery('.cherga_back_to_top').on('click', function(){
		jQuery('html, body').stop().animate({scrollTop: 0}, 400, function(){
			jQuery('.cherga_back_to_top').removeClass('cherga_show_me');
		});
	});

	// Preloader
	if (jQuery('.cherga_preloader_wrapper').length > 0) {
		jQuery('.cherga_preloader_wrapper').addClass('run_preloader');
	}

	// Itemized Links Grid
	if (jQuery('.cherga_itemized_links_grid').length > 0) {
		jQuery('.cherga_grid_inner').each(function(){
			var setPad = Math.floor(parseInt(jQuery(this).attr('data-pad'))/2);
			if (cherga_window.width() < 1200 && setPad > 20) {
				setPad = setPad/2;
			}
			if (cherga_window.width() < 760 && setPad > 10) {
				setPad = 10;
			}

			jQuery(this).css('margin', setPad+'px');

			if (jQuery(this).hasClass('vertical_paddings_on')) {
				jQuery(this).css('margin-top', -1*setPad+'px').css('margin-bottom', -1*setPad+'px');
			}

			if (jQuery(this).hasClass('side_paddings_on')) {
				jQuery(this).css('margin-left', -1*setPad+'px').css('margin-right', -1*setPad+'px');
			}
			jQuery(this).find('.grid-item-inner').css({
				'margin-left' : setPad+'px',
				'margin-top' : setPad+'px',
				'margin-right' : setPad+'px',
				'margin-bottom' : setPad+'px'
			});
			jQuery(this).isotope('layout');
			setTimeout("jQuery('.cherga_grid_inner').isotope('layout')",1000);
		});
	}

	// Featured Video Play
	jQuery('.cherga_featured_video_play').on('click', function(){
		jQuery(this).parents('.cherga_featured_video_wrapper').addClass('show_video');
		if (jQuery(this).parents('.cherga_featured_video_wrapper').find('iframe')[0].src.indexOf('youtu') + 1) {
			jQuery(this).parents('.cherga_featured_video_wrapper').find('iframe')[0].src += "&autoplay=1";
		} else {
			jQuery(this).parents('.cherga_featured_video_wrapper').find('iframe')[0].src += "?autoplay=1";
		}
	});

	// Before-After Module
	jQuery('.cherga_before_after').on('mousemove', function(e) {
		var this_offset = jQuery(this).offset().left,
			mouse_pos = e.pageX - this_offset,
			current_pos = jQuery(this).find('.cherga_after_image').width();
		jQuery(this).find('.cherga_after_image').width(mouse_pos);
		jQuery(this).find('.cherga_before_after_divider').css('left', mouse_pos + 'px');
	});
	
	jQuery('.cherga_before_after').on('touchmove', function(e) {
		var touch = e.originalEvent.touches[0],
			this_offset = jQuery(this).offset().left,
			set_pos = touch.pageX - this_offset;
		if (set_pos < 0) set_pos = 0;
		if (set_pos > jQuery(this).width()) set_pos = jQuery(this).width();
		
		jQuery(this).find('.cherga_after_image').width(set_pos);
		jQuery(this).find('.cherga_before_after_divider').css('left', set_pos + 'px');
	});
	
	if (cherga_body.hasClass('cherga_drag_protection')) {
		cherga_dp.on('mousedown',function(e){
			e.preventDefault();
		});
	}
    
    // Shop
	if (jQuery('.cherga_select_wrapper').length) {
		jQuery('.cherga_select').on('click', function () {
			jQuery(this).toggleClass('active').next('ul.select-options').toggle();
		});
		
		jQuery('.select-options li').on('click', function () {
			var select_value = jQuery(this).html();
			
			jQuery(this).parent().parent().find('.cherga_select').html(select_value);
		});
		
		jQuery(document).on('click', function (event) {
			if (jQuery(event.target).closest('.cherga_select').length) {} else {
				jQuery('.cherga_select').removeClass('active');
				jQuery('ul.select-options').css('display', 'none');
			}
		});
	}
    
    jQuery('.cherga_add_to_cart_button').on('click', function () {
    	var add_button = jQuery(this),
		    view_button = jQuery(this).parent().find('.cherga_view_cart_button'),
		    overlay = jQuery(this).parent().find('.cherga_product_buttons_overlay');
    	
	    overlay.addClass('active');
	    
	    setTimeout(function () {
		    view_button.addClass('active');
		    overlay.removeClass('active');
	    }, 1000, view_button, overlay);
    });
    
    jQuery('.cherga_tiny .cherga_stars li').on({
	    mouseenter: function () {
	    	jQuery(this).parent().find('.choosed').removeClass('choosed');
		    jQuery(this).addClass('active');
		    jQuery(this).prevAll().addClass('active');
	    },
	    
	    mouseleave: function () {
			jQuery(this).parent().find('.active').removeClass('active');
	    },
	    
	    click: function () {
		    jQuery(this).addClass('choosed');
		    jQuery(this).prevAll().addClass('choosed');
	    }
    });
    
    // Load More Items
	// Grid Albums
	jQuery('.cherga_albums_grid_page').each(function () {
		cherga_isotop_el_loading();
		
		var items_set = [
			{category_class: 'food-drink', src: 'img/clipart/albums_grid/img_13.jpg', album_href: 'album_slider.html', category_name: 'food+drink', title: 'Autumn Evening'},
			{category_class: 'portraits', src: 'img/clipart/albums_grid/img_14.jpg', album_href: 'album_split.html', category_name: 'portraits', title: 'Business Style'},
			{category_class: 'stuff', src: 'img/clipart/albums_grid/img_15.jpg', album_href: 'album_grid.html', category_name: 'stuff', title: 'Autumn Stuff'},
			{category_class: 'stuff', src: 'img/clipart/albums_grid/img_16.jpg', album_href: 'album_masonry.html', category_name: 'stuff', title: 'Rope Bundle'},
			{category_class: 'nature', src: 'img/clipart/albums_grid/img_17.jpg', album_href: 'album_kenburns.html', category_name: 'nature', title: 'Waterfall'},
			{category_class: 'fashion', src: 'img/clipart/albums_grid/img_18.jpg', album_href: 'album_packery.html', category_name: 'fashion', title: 'Fashion Jeans'},
			{category_class: 'fashion', src: 'img/clipart/albums_grid/img_19.jpg', album_href: 'album_ribbon.html', category_name: 'fashion', title: 'Street Style'},
			{category_class: 'food-drink', src: 'img/clipart/albums_grid/img_20.jpg', album_href: 'album_slider.html', category_name: 'food-drink', title: 'Breakfast'}
		];
		
		jQuery('#list').albums_listing_addon({
			load_count: 4,
			items: items_set
		});
	});
	
	// Masonry Albums
	jQuery('.cherga_albums_masonry_page').each(function () {
		cherga_isotop_el_loading();
		
		var items_set = [
			{category_class: 'food-drink', src: 'img/clipart/albums_masonry/img_13.jpg', album_href: 'album_slider.html', category_name: 'food+drink', title: 'Autumn Evening'},
			{category_class: 'portraits', src: 'img/clipart/albums_masonry/img_14.jpg', album_href: 'album_split.html', category_name: 'portraits', title: 'Business Style'},
			{category_class: 'stuff', src: 'img/clipart/albums_masonry/img_15.jpg', album_href: 'album_grid.html', category_name: 'stuff', title: 'Autumn Stuff'},
			{category_class: 'stuff', src: 'img/clipart/albums_masonry/img_16.jpg', album_href: 'album_masonry.html', category_name: 'stuff', title: 'Rope Bundle'},
			{category_class: 'nature', src: 'img/clipart/albums_masonry/img_17.jpg', album_href: 'album_kenburns.html', category_name: 'nature', title: 'Waterfall'},
			{category_class: 'fashion', src: 'img/clipart/albums_masonry/img_18.jpg', album_href: 'album_packery.html', category_name: 'fashion', title: 'Fashion Jeans'},
			{category_class: 'fashion', src: 'img/clipart/albums_masonry/img_19.jpg', album_href: 'album_ribbon.html', category_name: 'fashion', title: 'Street Style'},
			{category_class: 'food-drink', src: 'img/clipart/albums_masonry/img_20.jpg', album_href: 'album_slider.html', category_name: 'food-drink', title: 'Breakfast'}
		];
		
		jQuery('#list').albums_listing_addon({
			load_count: 4,
			items: items_set
		});
	});
	
	// Packery Albums
	jQuery('.cherga_albums_packery_page').each(function () {
		cherga_isotop_el_loading();
		
		var items_set = [
			{count: '1', category_class: 'portraits', img_src: 'img/clipart/albums_packery/thumb-9.jpg', album_href: 'album_masonry.html', category_name: 'Portraits', title: 'Beautiful Ringlets'},
			{count: '2', category_class: 'nature', img_src: 'img/clipart/albums_packery/thumb-10.jpg', album_href: 'album_packery.html', category_name: 'Nature', title: 'In the Forest'},
			{count: '3', category_class: 'food-drink', img_src: 'img/clipart/albums_packery/thumb-11.jpg', album_href: 'album_kenburns.html', category_name: 'Food+Drink', title: 'Still Life'},
			{count: '4', category_class: 'stuff', img_src: 'img/clipart/albums_packery/thumb-12.jpg', album_href: 'album_ribbon.html', category_name: 'Stuff', title: 'Light My Fire'},
			{count: '5', category_class: 'food-drink', img_src: 'img/clipart/albums_packery/thumb-13.jpg', album_href: 'album_slider.html', category_name: 'Food+Drink', title: 'Autumn Evening'},
			{count: '6', category_class: 'portraits', img_src: 'img/clipart/albums_packery/thumb-14.jpg', album_href: 'album_split.html', category_name: 'Portraits', title: 'Business Style'},
			{count: '7', category_class: 'stuff', img_src: 'img/clipart/albums_packery/thumb-15.jpg', album_href: 'album_grid.html', category_name: 'Stuff', title: 'Autumn Stuff'},
			{count: '8', category_class: 'stuff', img_src: 'img/clipart/albums_packery/thumb-16.jpg', album_href: 'album_masonry.html', category_name: 'Stuff', title: 'Rope Bundle'},
			{count: '1', category_class: 'nature', img_src: 'img/clipart/albums_packery/thumb-17.jpg', album_href: 'album_packery.html', category_name: 'Nature', title: 'Waterfall'},
			{count: '2', category_class: 'fashion', img_src: 'img/clipart/albums_packery/thumb-18.jpg', album_href: 'album_kenburns.html', category_name: 'Fashion', title: 'Fashion Jeans'},
			{count: '3', category_class: 'fashion', img_src: 'img/clipart/albums_packery/thumb-19.jpg', album_href: 'album_ribbon.html', category_name: 'Fashion', title: 'Street Style'},
			{count: '4', category_class: 'food-drink', img_src: 'img/clipart/albums_packery/thumb-20.jpg', album_href: 'album_slider.html', category_name: 'Food+Drink', title: 'Breakfast'}
		];
		
		jQuery('#list').packery_albums_listing_addon({
			load_count: 4,
			items: items_set
		});
	});
	
    // Grid Blog
	jQuery('.cherga_grid_blog_page').each(function () {
		cherga_grid_blog_loading();
		
		var items_set = [
			{post_link: 'blog_audio.html', img_url: 'img/clipart/blog_grid/blog-grid-10.jpg', post_date: 'November 14, 2017', post_category: 'Fashion', post_title: 'Fashion Shoes', post_excerpt: 'Ihendrerit felis. Quisque ut sapien fermentum sapien iaculis condimentum. Ut eget ipsum eget justo congue dapibus vitae ac tortor. Sed gravida, arcu eget pulvinar imperdiet, neque ipsum luctus velit, in luctus elit...'},
			{post_link: 'blog_standard.html', img_url: 'img/clipart/blog_grid/blog-grid-11.jpg', post_date: 'November 14, 2017', post_category: 'Music', post_title: 'Meant to Be', post_excerpt: 'Fringilla ac est. Vestibulum arcu nibh, varius sed orci eget, convallis pretium eros. Integer dignissim sapien dolor, sit amet posuere mauris imperdiet id. Aliquam at tellus vitae nunc consectetur malesuada ut...'},
			{post_link: 'blog_image.html', img_url: 'img/clipart/blog_grid/blog-grid-12.jpg', post_date: 'November 14, 2017', post_category: 'Fashion', post_title: 'Stylish Look', post_excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed facilisis mollis tellus in dictum. Sed ultrices pharetra cursus. Integer porttitor ut arcu at semper. Aenean accumsan purus sit amet semper vulputate...'},
			{post_link: 'blog_gallery.html', img_url: 'img/clipart/blog_grid/blog-grid-13.jpg', post_date: 'November 14, 2017', post_category: 'Traveling', post_title: 'Mountain Ways', post_excerpt: 'Fringilla ac est. Vestibulum arcu nibh, varius sed orci eget, convallis pretium eros. Integer dignissim sapien dolor, sit amet posuere mauris imperdiet id. Aliquam at tellus vitae nunc consectetur malesuada ut...'},
			{post_link: 'blog_video.html', img_url: 'img/clipart/blog_grid/blog-grid-14.jpg', post_date: 'November 14, 2017', post_category: 'Nature', post_title: 'Bird’s Eye View', post_excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed facilisis mollis tellus in dictum. Sed ultrices pharetra cursus. Integer porttitor ut arcu at semper. Aenean accumsan purus sit amet semper vulputate...'},
			{post_link: 'blog_audio.html', img_url: 'img/clipart/blog_grid/blog-grid-15.jpg', post_date: 'November 14, 2017', post_category: 'Music', post_title: 'Corra Music', post_excerpt: 'Ihendrerit felis. Quisque ut sapien fermentum sapien iaculis condimentum. Ut eget ipsum eget justo congue dapibus vitae ac tortor. Sed gravida, arcu eget pulvinar imperdiet, neque ipsum luctus velit, in luctus elit...'}
		];
		
		jQuery('#list').blog_listing_addon({
			load_count: 3,
			items: items_set
		});
	});
	
	// Landing Page
	jQuery('.cherga_landing_page').each(function () {
		cherga_isotop_el_loading();
	});
	
	// Tabs Widget
	jQuery('.cherga-widget-tabs').each(function () {
		jQuery(this).find('.cherga-tab-desktop-title').first().addClass('active');
		jQuery(this).find('.cherga-tab-content').first().addClass('active');
		
		jQuery(this).find('.cherga-tab-desktop-title').on('click', function () {
			var tab_number = jQuery(this).attr('data-tab');
			
			jQuery(this).parent().find('.active').removeClass('active');
			jQuery(this).addClass('active');
			jQuery(this).parent().parent().find('.cherga-tabs-content-wrapper > .active').removeClass('active');
			jQuery(this).parent().parent().find('.cherga-tabs-content-wrapper [data-tab="' + tab_number + '"]').addClass('active');
		});
	});
	
	// Checkout Page
	jQuery('.cherga_show_coupon_button').on('click', function () {
		jQuery('.cherga_checkout_coupon_form').slideToggle();
	});
	
	jQuery('.cherga_payment_method_label').on('click', function () {
		if (jQuery(this).parent().is('.active')) {} else {
			jQuery(this).parents('.cherga_payment_methods').find('.visible').slideUp().removeClass('visible');
			jQuery(this).parents('.cherga_payment_methods').find('.active').removeClass('active');
			jQuery(this).parent().addClass('active');
			jQuery(this).parent().find('.cherga_payment_box').slideDown().addClass('visible');
		}
	});
});

jQuery(document).on('click', '.reset_variations', function(){
	var $this = jQuery(this),
		$variations_table = $this.parents('.variations');
	$variations_table.find('select').each(function(){
		var $this_select = jQuery(this),
			$this_liza_select = $this_select.next('.cherga_select'),
			$this_list = $this_liza_select.next('.select-options');
		$this_liza_select.text($this_list.find('li[rel=""]').text());
	});
});

jQuery(window).on('load', function () {
	cherga_theme_setup();
	setTimeout("cherga_window.trigger('resize')",300);
	setTimeout('cherga_theme_setup()', 300);
	setTimeout("jQuery('.cherga_coming_soon_page').css('opacity', '1')", 500);
	// Preloader
	if (jQuery('.cherga_preloader_wrapper').length > 0) {
		setTimeout("jQuery('.fadeOnLoad').removeClass('fadeOnLoad')",900);
		setTimeout("jQuery('.cherga_preloader_wrapper').addClass('remove_preloader_step01')", 300);
		setTimeout("jQuery('.cherga_preloader_wrapper').addClass('remove_preloader_step02')", 800);
		setTimeout("jQuery('.cherga_preloader_wrapper').remove()", 1200);
	}

	// Sticky Menu Setup
	if (cherga_header.hasClass('cherga_sticky_menu_on') && !jQuery('.cherga_site_wrapper').hasClass('fixed_header_footer')) {
		// Create header placeholder to prevent content jump when header becomes fixed
		if (cherga_header.hasClass('cherga_header_solid_style')) {
			cherga_header.after('<div class="cherga_header_holder"></div>');
			jQuery('.cherga_header_holder').height(cherga_header.height());
		}

		// Scroll Listener
		window.addEventListener('scroll', function() {
			var scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
			if (scrollTop > 0 && window.innerWidth > 1024) {
				if (!cherga_header.hasClass('cherga_stick_me')) {
					cherga_header.addClass('cherga_stick_me');
				}
			} else {
				if (cherga_header.hasClass('cherga_stick_me')) {
					cherga_header.removeClass('cherga_stick_me');
				}
			}
		});
	}

	// Isotope Activation
	if (jQuery('.cherga_isotope_trigger').length > 0 && jQuery('.elementor-editor-active').length < 1) {
		if (jQuery('.cherga_isotope_trigger').hasClass('is_masonry')) {
			jQuery('.cherga_isotope_trigger').isotope({
				layoutMode: 'masonry'
			});
		} else if (jQuery('.cherga_isotope_trigger').hasClass('is_packery')) {
			jQuery('.cherga_isotope_trigger').isotope({
				layoutMode: 'packery'
			});
		} else {
			jQuery('.cherga_isotope_trigger').isotope({
				layoutMode: 'fitRows'
			});
		}
	}

	// Header Style
	if (cherga_header.hasClass('cherga_header_gradient_style')) {
		jQuery('html').addClass('cherga_header_gradient_page');
		if (jQuery('.page-template-page-centered').length < 1) {
			jQuery('html').addClass('cherga_content_under_header');
		}
	}
	if (cherga_header.hasClass('cherga_header_transparent_style')) {
		jQuery('html').addClass('cherga_header_transparent_page');
		if (jQuery('.page-template-page-centered').length < 1) {
			jQuery('html').addClass('cherga_content_under_header');
		}
	}
	if (jQuery('.cherga_404_content_wrapper').length > 0) {
		cherga_header.addClass('cherga_header_gradient_style');
		jQuery('html').addClass('cherga_header_gradient_page');
	}
	if (jQuery('.cherga_pp_content_wrapper').length > 0) {
		cherga_header.addClass('cherga_header_transparent_style');
		jQuery('html').addClass('cherga_header_transparent_page');
		if (jQuery('.cherga_pp_content_wrapper').hasClass('cherga_pp_demo')) {
			jQuery('.cherga_pp_content_wrapper').find('.post-password-form p:first').html(jQuery('.cherga_pp_content_wrapper').attr('data-text'));
		}
	}
	
	// Sticky Menu
	
	// OWL Carousel Activation
	jQuery(".cherga_owlCarousel").on("initialized.owl.carousel", function(e) {
		jQuery(".cherga_owlCarousel").css("opacity", "1");
	});
	jQuery(".cherga_owlCarousel").owlCarousel(
		{
			items:1,
			lazyLoad:true,
			loop:true,
			dots:false,
			nav:true,
			navText:["", ""],
			autoplay:true,
			autoplayTimeout:5000,
			autoplayHoverPause:true,
			autoHeight:true
		}
	);

	/* Before After Module */
	if (jQuery('.cherga_before_after').length > 0) {
		jQuery('.cherga_before_after').each(function() {
			var $this = jQuery(this),
				$this_after_img = $this.find('.cherga_after_img'),
				img_w = $this.find('.cherga_before_image').width(),
				img_h = $this.find('.cherga_before_image').height();

			if ($this.width() > img_w) {
				$this.css('max-width', img_w+'px');
			} else {
				$this.css('max-width', 'auto');
			}
			$this_after_img.width(img_w).height(img_h).css('max-width', img_w+'px');
			$this.find('.cherga_after_image').css('width', '50%');
			$this.find('.cherga_before_after_divider').css('left', '50%');
		});
	}
});

jQuery(window).on('resize', function () {
	cherga_theme_setup();
	setTimeout("cherga_theme_setup()",300);
});

jQuery('a[href="#"]').on('click', function(event){
    event.preventDefault();
});

function cherga_theme_setup() {
	/* Before After Module */
	if (jQuery('.cherga_before_after').length > 0) {
		jQuery('.cherga_before_after').each(function() {
			var $this = jQuery(this),
				$this_after_img = $this.find('.cherga_after_img'),
				img_w = $this.find('.cherga_before_image').width(),
				img_h = $this.find('.cherga_before_image').height();
			
			if ($this.width() > img_w) {
				$this.css('max-width', img_w+'px');
			} else {
				$this.css('max-width', 'auto');
			}
			$this_after_img.width(img_w).height(img_h).css('max-width', img_w+'px');
			$this.find('.cherga_after_image').css('width', '50%');
			$this.find('.cherga_before_after_divider').css('left', '50%');
		});
	}

	/* Header Setup */
	if (cherga_window.width() > 960) {
		if (cherga_header.hasClass('cherga_logo_middle')) {
			// Center Logo Header
			var logo_width = cherga_header_logo_part.width(),
				other_parts = (cherga_window.width() - logo_width - 1)/2;
			cherga_header_menu_part.width(other_parts);
			cherga_header_logo_part.width(logo_width);
			cherga_header_socials_part.width(other_parts);
		} else {
			// Left and Right Logo Header
			var use_width = 0,
				logo_width = cherga_header_logo_part.width(),
				socials_width = cherga_header_socials_part.width()+1;
			if (logo_width > socials_width) {
				use_width = logo_width;
			} else {
				use_width = socials_width;
			}
			var set_menu_width = cherga_header.width() - use_width*2 - 2;
			cherga_header_menu_part.width(set_menu_width);
			cherga_header_logo_part.width(use_width);
			cherga_header_socials_part.width(use_width);
		}
	}
	if (jQuery('.cherga_header_holder').length) {
		jQuery('.cherga_header_holder').height(cherga_header.height());
	}
	if (cherga_window.scrollTop() > 0 && cherga_window.width() > 1024) {
		cherga_header.addClass('cherga_stick_me');
	} else {
		cherga_header.removeClass('cherga_stick_me');
	}

	/* Set This After Header */
	if (jQuery('.cherga_set_this_after_header').length) {
		jQuery('.cherga_set_this_after_header').each(function(){
			var $this = jQuery(this),
				set_top = cherga_header.height();
			if (jQuery('#wpadminbar').length && cherga_window.width() > 760) {
				set_top = set_top + jQuery('#wpadminbar').height();
			}
			$this.css('top', set_top);
		});
	}

	/* Footer and Header Holder */
	if (jQuery('.cherga_site_wrapper').hasClass('fixed_header_footer')) {
		jQuery('.cherga_main_header_holder').height(jQuery('header.cherga_main_header').height());
		jQuery('.cherga_footer_holder').height(jQuery('footer.cherga_footer').height());
	}

	if (jQuery('html').hasClass('cherga_content_under_header')) {
		cherga_push_content_under_header();
	}

	/* Fullheight Sections Setup */
	if (jQuery('section.elementor-section-height-full').length > 0 && cherga_window.width() < 1200) {
		jQuery('section.elementor-section-height-full').height(cherga_window.height());
	}
	
	if (jQuery('.cherga_owlCarousel').length > 0) {
		jQuery('.cherga_owlCarousel').each(function () {
			jQuery(this).trigger('refresh.owl.carousel');
		});
	}

	/* Container Min-Height Setup*/
	if (jQuery('.cherga_content').length > 0) {
		var set_min_height = cherga_window.height();
		if (jQuery('header.cherga_main_header').length > 0) {
			set_min_height = set_min_height - jQuery('header.cherga_main_header').height();
		}
		if (jQuery('.footer_widgets_wrapper').length > 0) {
			set_min_height = set_min_height - jQuery('.footer_widgets_wrapper').height();
		}
		if (jQuery('footer.cherga_footer').length > 0) {
			set_min_height = set_min_height - jQuery('footer.cherga_footer').height();
		}
		if (jQuery('#wpadminbar').length > 0) {
			set_min_height = set_min_height - jQuery('#wpadminbar').height();
		}
		jQuery('.cherga_main_wrapper').css('min-height', set_min_height+'px');
	}

	/* PF Fullwidth Setup*/
	if (jQuery('.cherga_pf_fullwidth').length > 0 && jQuery('.cherga_sidebar').length < 1) {
		var set_width = jQuery('.cherga_site_wrapper').width();
		jQuery('.cherga_pf_fullwidth').each(function() {
			var set_mar = (jQuery('.cherga_container').width() - set_width)/2;
			jQuery(this).width(set_width).css('margin-left', set_mar+'px');
		});
	}

	/* PhotoSwipe Video Setup */
	if (jQuery('.cherga_pswp_video_wrapper').length > 0) {
		var cherga_window_height = cherga_window.height();
		if (jQuery('.pswp__top-bar').length > 0) {
			cherga_window_height = cherga_window_height - jQuery('.pswp__top-bar').height()*2;
		}
		if (jQuery('#wpadminbar').length > 0) {
			cherga_window_height = cherga_window_height - jQuery('#wpadminbar').height();
		}
		if ((cherga_window.width()/16)*9 > cherga_window_height) {
			var set_width = (cherga_window_height/9)*16,
				set_height = cherga_window_height;
		} else {
			var set_height = (cherga_window.width()/16)*9,
				set_width = cherga_window.width();
		}
		jQuery('.cherga_pswp_video_wrapper').width(set_width).height(set_height);
	}

	/* 404 Page */
	if (jQuery('.cherga_404_content_wrapper').length > 0) {
		if (jQuery('#wpadminbar').length > 0) {
			jQuery('.cherga_site_wrapper').css('min-height', cherga_window.height() - jQuery('#wpadminbar').height()+'px');
		} else {
			jQuery('.cherga_site_wrapper').css('min-height', cherga_window.height()+'px');
		}
	}

	/* Password Protected */
	if (jQuery('.cherga_pp_content_wrapper').length > 0) {
		if (jQuery('#wpadminbar').length > 0) {
			jQuery('.cherga_site_wrapper').css('min-height', cherga_window.height() - jQuery('#wpadminbar').height()+'px');
		} else {
			jQuery('.cherga_site_wrapper').css('min-height', cherga_window.height()+'px');
		}
	}

	/* Centered Page */
	if (jQuery('.cherga_verticaly_page_trigger').length > 0) {
		var centered_min_height = cherga_window.height();
		if (jQuery('#wpadminbar').length > 0) {
			centered_min_height = centered_min_height - jQuery('#wpadminbar').height();
			jQuery('.cherga_site_wrapper').css('min-height', (cherga_window.height() - jQuery('#wpadminbar').height())+'px');
		} else {
			jQuery('.cherga_site_wrapper').css('min-height', cherga_window.height()+'px');
		}
		if (cherga_header.length > 0) {
			centered_min_height = centered_min_height - cherga_header.height();
		}
		if (cherga_footer.length > 0) {
			centered_min_height = centered_min_height - cherga_footer.height();
		}
		if (jQuery('.cherga_verticaly_page_wrapper').length > 0) {
			var centered_page_container = jQuery('.cherga_verticaly_page_wrapper'),
				set_centered_top = cherga_header.height();
			if (centered_min_height > centered_page_container.height()) {
				set_centered_top = (centered_min_height - centered_page_container.height())/2 + cherga_header.height();
				centered_page_container.css('top', set_centered_top + 'px').addClass('centered_this');
				jQuery('html').addClass('cherga_html_centered_page');
				jQuery('html').removeClass('cherga_html_stick2top_page');
			} else {
				centered_page_container.css('top', '0px').addClass('stick_to_top');;
				jQuery('html').addClass('cherga_html_stick2top_page');
				jQuery('html').removeClass('cherga_html_centered_page');
				jQuery('html').removeClass('page_reached_bottom');
				jQuery('html').removeClass('page_reached_top');
			}
		} else {
			jQuery('html').addClass('cherga_centered_no_content');
		}

		// Video BG
		if (jQuery('.cherga_centered_page_video').length > 0) {
			var window_w = cherga_window.width(),
				window_h = cherga_window.height(),
				current_iframe = jQuery('.cherga_centered_page_video').find('iframe');
			if (((window_h + 150) / 9) * 16 > window_w) {
				current_iframe.height(window_h + 150).width(((window_h + 150) / 9) * 16);
				current_iframe.css({
					'margin-left': (-1 * current_iframe.width() / 2) + 'px',
					'top': "-75px",
					'margin-top': '0px'
				});
			} else {
				current_iframe.width(window_w).height(((window_w) / 16) * 9);
				current_iframe.css({
					'margin-left': (-1 * jQuery('iframe').width() / 2) + 'px',
					'margin-top': (-1 * jQuery('iframe').height() / 2) + 'px',
					'top': '50%'
				});
			}
		}
		if (jQuery('.cherga_verticaly_page_wrapper').length < 1) {
			jQuery('html').addClass('cherga_no_content_block');
		}
	}

	/* Stretched Video */
	if (jQuery('.cherga_video_stretch').length) {
		jQuery('.cherga_video_stretch').each(function(){
			var video_iframe =  jQuery(this).find('.elementor-background-video-container iframe'),
				container_h = jQuery(this).height(),
				container_w = jQuery(this).width();

			if (cherga_window.width() > 1024) {
				if (video_iframe.length > 0) {
					if (((container_h + 150) / 9) * 16 > container_w) {
						video_iframe.height(container_h + 150).width(((container_h + 150) / 9) * 16);
						video_iframe.css({
							'margin-left': (-1 * video_iframe.width() / 2) + 'px',
							'top': '-75px',
							'margin-top': '0px'
						});
					} else {
						video_iframe.width(container_w).height(((container_w) / 16) * 9);
						video_iframe.css({
							'margin-left': (-1 * video_iframe.width() / 2) + 'px',
							'margin-top': (-1 * video_iframe.height() / 2) + 'px',
							'top': '50%'
						});
					}
				}
			} else {
				video_iframe.height(cherga_window.height()).width(cherga_window.width()).css({
					'top': '0px',
					'margin-left' : '0px',
					'left' : '0px',
					'margin-top': '0px'
				});
			}
		});
	}
}

jQuery(document).on('click', '.cherga_header_mobile_menu_toggler', function() {
	jQuery('html').toggleClass('cherga_show_mobile_header');
	jQuery('.cherga_mobile_menu_wrapper').slideToggle(400);
});

jQuery(document).on("click", '.open_sub_menu', function () {
	jQuery(this).parent('li').toggleClass('cherga_mobile_submenu_showed');
	jQuery(this).parent('li').children('ul.sub-menu').toggleClass('cherga_mobile_submenu_showed').slideToggle(400);
});

// Nested Portfolio Menu Toggle for Mobile
jQuery(document).on("click", '.nested-toggle', function (e) {
	e.preventDefault();
	var parent_li = jQuery(this).parent('li');
	parent_li.toggleClass('expanded');
	parent_li.children('ul.sub-menu').slideToggle(300);
});

function cherga_isotop_el_loading() {
	if (jQuery('.cherga_isotop_el_loading:first').length > 0) {
		jQuery('.cherga_isotop_el_loading:first').removeClass('cherga_isotop_el_loading');
		setTimeout("cherga_isotop_el_loading()",200);
	}

}
function cherga_grid_blog_loading() {
	if (jQuery('.cherga_grid_blog_loading:first').length > 0) {
		jQuery('.cherga_grid_blog_loading:first').removeClass('cherga_grid_blog_loading');
		setTimeout("cherga_grid_blog_loading()",200);
	}

}

function cherga_countdown() {
    jQuery('.cherga_countdown').each(function(){
        var pm_year = jQuery(this).attr('data-year'),
            pm_month = jQuery(this).attr('data-month'),
            pm_day = jQuery(this).attr('data-day'),
            austDay = new Date(pm_year, pm_month - 1, pm_day);

        jQuery(this).countdown({
            until: austDay,
            padZeroes: true
        });
    });
}

// PM Flicker Widget
function cherga_flickr_widget () {
	jQuery('.cherga_flickr_widget_wrapper').each(function () {
		var flickrid = jQuery(this).attr('data-flickrid'),
			widget_id = jQuery(this).attr('data-widget_id'),
			widget_number = jQuery(this).attr('data-widget_number');

		jQuery(this).addClass('cherga_flickr_widget_wrapper'+flickrid);

		jQuery.getJSON("https://api.flickr.com/services/feeds/photos_public.gne?id="+widget_id+"&lang=en-us&format=json&jsoncallback=?", function(data){
			jQuery.each(data.items, function(i,item){
				if(i<widget_number){
					jQuery("<img/>").attr("src", item.media.m).appendTo(".cherga_flickr_widget_wrapper"+flickrid).wrap("<div class=\'cherga_flickr_badge_image\'><a href=\'" + item.link + "\' target=\'_blank\' class=\'cherga_no_select\' title=\'Flickr\'></a></div>");
				}
			});
		});
	});
}

function cherga_push_content_under_header() {
	var header_height = cherga_header.height();
	cherga_header.css('margin-bottom', -1*header_height+'px');
	jQuery('.cherga_mobile_menu_wrapper').css('margin-bottom', header_height+'px');
}

jQuery(document).on('click', '#swipebox-slider .current', function() {
    jQuery('a#swipebox-next').click();
});

// Grid Albums Listing
jQuery.fn.albums_listing_addon = function (addon_options) {
	"use strict";
	//Set Variables
	var addon_el = jQuery(this),
		addon_base = this,
		img_count = addon_options.items.length,
		img_per_load = addon_options.load_count,
		$newEls = '',
		loaded_object = '',
		$container = jQuery('.cherga_albums_grid');
	
	jQuery('.grid_albums_trigger').on('click', function () {
		$newEls = '';
		loaded_object = '';
		var loaded_images = $container.find('.added').length;
		if ((img_count - loaded_images) > img_per_load) {
			var now_load = img_per_load;
		} else {
			now_load = img_count - loaded_images;
		}
		
		if ((loaded_images + now_load) == img_count) {
			jQuery(this).fadeOut();
			jQuery(this).parent().addClass('all_posts_loaded');
		}
		
		if (loaded_images < 1) {
			var i_start = 1;
		} else {
			i_start = loaded_images + 1;
		}
		
		if (now_load > 0) {
			// load more elements
			for (var i = i_start - 1; i < i_start + now_load - 1; i++) {
				loaded_object = loaded_object +
					'<div class="cherga_albums_grid_item columns_4 ' + addon_options.items[i].category_class + ' added cherga_isotop_el_loading">' +
						'<div class="cherga_inner_cont">' +
							'<a href="' + addon_options.items[i].album_href + '" class="cherga_dp cherga_no_select">' +
								'<img src="' + addon_options.items[i].src + '" alt=""/>' +
					
								'<span class="cherga_albums_grid_content">' +
									'<span class="cherga_albums_category">' + addon_options.items[i].category_name + '</span>' +
									'<span class="cherga_albums_title">' + addon_options.items[i].title + '</span>' +
								'</span>' +
							'</a>' +
						'</div>' +
					'</div>';
			}
			
			$newEls = jQuery(loaded_object);
			$container.isotope('insert', $newEls, function () {
				$container.isotope('reLayout');
			});
			setTimeout("cherga_isotop_el_loading()", 300);
			setTimeout("jQuery('.cherga_albums_grid').isotope();", 500);
			setTimeout("jQuery('.cherga_albums_grid').isotope();", 1000);
			setTimeout("jQuery('.cherga_albums_grid').isotope();", 2000);
			setTimeout("jQuery('.cherga_albums_grid').isotope();", 3000);
		}
	});
};

// Packery Albums Listing
jQuery.fn.packery_albums_listing_addon = function (addon_options) {
	"use strict";
	//Set Variables
	var addon_el = jQuery(this),
		addon_base = this,
		img_count = addon_options.items.length,
		img_per_load = addon_options.load_count,
		$newEls = '',
		loaded_object = '',
		$container = jQuery('.cherga_albums_packery');
	
	jQuery('.packery_albums_trigger').on('click', function () {
		$newEls = '';
		loaded_object = '';
		var loaded_images = $container.find('.added').length;
		if ((img_count - loaded_images) > img_per_load) {
			var now_load = img_per_load;
		} else {
			now_load = img_count - loaded_images;
		}
		
		if ((loaded_images + now_load) == img_count) {
			jQuery(this).fadeOut();
			jQuery(this).parent().addClass('all_posts_loaded');
		}
		
		if (loaded_images < 1) {
			var i_start = 1;
		} else {
			i_start = loaded_images + 1;
		}
		
		if (now_load > 0) {
			// load more elements
			for (var i = i_start - 1; i < i_start + now_load - 1; i++) {
				loaded_object = loaded_object +
					'<div class="cherga_albums_packery_item packery-item element packery-item' + addon_options.items[i].count + ' anim_el anim_el2 load_anim packery_b2p cherga_isotop_el_loading added ' + addon_options.items[i].category_class + ' other_loaded_item" data-count="' + addon_options.items[i].count + '">' +
						'<div class="cherga_inner_cont packery-item-inner cherga_bg_image_load" data-src="' + addon_options.items[i].img_src + '">' +
							'<a href="' + addon_options.items[i].album_href + '" class="cherga_dp cherga_no_select">' +
								'<div class="cherga_albums_grid_content">' +
									'<h6 class="cherga_albums_category">' + addon_options.items[i].category_name + '</h6>' +
									'<h4 class="cherga_albums_title">' + addon_options.items[i].title + '</h4>' +
								'</div>' +
							'</a>' +
						'</div>' +
					'</div>';
			}
			
			$newEls = jQuery(loaded_object);
			$container.isotope('insert', $newEls, function () {
				$container.isotope('reLayout');
			});
			
			jQuery($container).find('.cherga_bg_image_load').each(function () {
				jQuery(this).css('background-image', 'url(' + jQuery(this).attr('data-src') + ')').removeClass('cherga_bg_image_load');
			});
			
			$container.find('.other_loaded_item').each(function () {
				var current_count = jQuery(this).attr('data-count'),
					current_width = jQuery(this).parent().find('.first_load.packery-item' + current_count + '').width(),
					current_height = jQuery(this).parent().find('.first_load.packery-item' + current_count + '').height();
				
				jQuery(this).width(current_width).height(current_height).removeClass('other_loaded_item');
			});
			
			setTimeout("jQuery('.cherga_albums_packery').isotope();", 500);
			setTimeout("jQuery('.cherga_albums_packery').isotope();", 1000);
			setTimeout("cherga_isotop_el_loading()", 1200);
			setTimeout("jQuery('.cherga_albums_packery').isotope();", 2000);
			setTimeout("jQuery('.cherga_albums_packery').isotope();", 3000);
		}
	});
};

// Grid Blog Listing
jQuery.fn.blog_listing_addon = function (addon_options) {
	"use strict";
	//Set Variables
	var addon_el = jQuery(this),
		addon_base = this,
		img_count = addon_options.items.length,
		img_per_load = addon_options.load_count,
		$newEls = '',
		loaded_object = '',
		$container = jQuery('.cherga_grid_blog_listing_cont');
	
	jQuery('.grid_blog_trigger').on('click', function () {
		$newEls = '';
		loaded_object = '';
		var loaded_images = $container.find('.added').length;
		if ((img_count - loaded_images) > img_per_load) {
			var now_load = img_per_load;
		} else {
			now_load = img_count - loaded_images;
		}
		
		if ((loaded_images + now_load) == img_count) {
			jQuery(this).fadeOut();
			jQuery(this).parent().addClass('all_posts_loaded');
		}
		
		if (loaded_images < 1) {
			var i_start = 1;
		} else {
			i_start = loaded_images + 1;
		}
		
		if (now_load > 0) {
			// load more elements
			for (var i = i_start - 1; i < i_start + now_load - 1; i++) {
				loaded_object = loaded_object +
					'<div class="cherga_grid_blog_item added cherga_grid_blog_loading">' +
						'<a class="cherga_grid_blog_image cherga_dp cherga_no_select" href="' + addon_options.items[i].post_link + '">' +
							'<img src="' + addon_options.items[i].img_url + '" alt=""/>' +
						'</a>' +
						'<div class="cherga_post_content">' +
							'<div class="cherga_post_meta">' +
								'<div class="cherga_post_meta_item">' + addon_options.items[i].post_date + '</div>' +
								'<div class="cherga_post_meta_item cherga_dp">' +
									'<a class="category tag" href="javascript:void(0)">' + addon_options.items[i].post_category + '</a>' +
								'</div>' +
							'</div>' +
							'<h4 class="cherga_post_title">' +
								'<a href="' + addon_options.items[i].post_link + '" class="cherga_dp">' + addon_options.items[i].post_title + '</a>' +
							'</h4>' +
							'<div class="cherga_post_excerpt">' +
								'' + addon_options.items[i].post_excerpt + '' +
							'</div>' +
						'</div>' +
					'</div>';
			}
			
			$newEls = jQuery(loaded_object);
			$container.isotope('insert', $newEls, function () {
				$container.isotope('reLayout');
			});
			
			// cherga_grid_blog_loading();
			setTimeout("cherga_grid_blog_loading()", 600);
			setTimeout("jQuery('.cherga_grid_blog_listing_cont').isotope();", 500);
			setTimeout("jQuery('.cherga_grid_blog_listing_cont').isotope();", 1000);
			setTimeout("jQuery('.cherga_grid_blog_listing_cont').isotope();", 2000);
			setTimeout("jQuery('.cherga_grid_blog_listing_cont').isotope();", 3000);
		}
	});
};

