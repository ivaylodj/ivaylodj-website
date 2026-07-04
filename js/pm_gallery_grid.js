/*
 * Grid Gallery
 * Created by Pixel-Mafia
 * www.pixel-mafia.com
*/
"use strict";
var $cherga_container = jQuery('.cherga_grid_inner'),
	cherga_grid_array = [],
	$cherga_grid_gallery_array = jQuery('.cherga_grid_gallery_array'),
	$cherga_grid_wrapper = jQuery('.cherga_grid_wrapper');

$cherga_grid_wrapper.each(function() {
	var $this_obj = jQuery(this);
	cherga_grid_array["cherga_grid_" + $this_obj.attr('data-uniqid')] = {};
	var this_array = cherga_grid_array["cherga_grid_" + $this_obj.attr('data-uniqid')];
	this_array.id = jQuery(this).attr('data-uniqid');
	this_array.showed = 0;
	this_array.items = [];
	
	var this_items_array = this_array.items;
	if ($this_obj.find('.cherga_grid_gallery_array').length) {
		$this_obj.find('.cherga_grid_gallery_array').each(function() {
			jQuery(this).find('.cherga_grid_array_item').each(function() {
				var $this = jQuery(this),
					cherga_grid_item = {};
				cherga_grid_item.slide_type = $this.attr('data-type');
				cherga_grid_item.img = $this.attr('data-img');
				cherga_grid_item.thmb = $this.attr('data-thmb');
				cherga_grid_item.title = $this.attr('data-title');
				cherga_grid_item.alt = $this.attr('data-alt');
				cherga_grid_item.overlay = $this.attr('data-overlay');
				cherga_grid_item.counter = $this.attr('data-counter');
				cherga_grid_item.size = $this.attr('data-size');
				this_items_array.push(cherga_grid_item);
			});
			jQuery(this).remove();
		});
	}
	
	this_array.obj = jQuery('.cherga_grid_'+this_array.id);
	
	this_array.init = function () {
		var this_obj = this;
		this.obj.find('.grid_load_more').on("click", function () {
			this_obj.loadmore.call(this_obj);
			setTimeout("cherga_isotop_el_loading()", 600);
		});
		this.setup.call(this);
		this.preloader.call(this);
	};
	
	this_array.preloader = function() {
		var this_obj = this,
			$this_dom = this.obj;
		if ($this_dom.find('.load_anim_grid:first').length > 0) {
			(function (img, src) {
				img.src = src;
				img.onload = function () {
					$this_dom.find('.load_anim_grid:first').removeClass('load_anim_grid').removeClass('anim_el').animate({
						'z-index': '15'
					}, 200, function() {
						$this_dom.find('.cherga_grid_inner').isotope('layout');
						this_obj.setup.call(this_obj);
						this_obj.preloader.call(this_obj);
					});
				};
			}(new Image(), $this_dom.find('.load_anim_grid:first').find('img').attr('src')));
		} else {
			this_obj.setup.call(this_obj);
		}
	};
	
	this_array.setup = function() {
		var this_obj = this,
			$this_dom = this.obj,
            $cherga_dp = $this_dom.find('.cherga_dp');
        if (cherga_body.hasClass('cherga_drag_protection')) {
            $cherga_dp.on('mousedown',function(e){
                e.preventDefault();
            });
        }
		if ($this_dom.find('.cherga_js_bg_color').length) {
			$this_dom.find('.cherga_js_bg_color').each(function () {
				jQuery(this).css('background-color', jQuery(this).attr('data-bgcolor'));
			});
		}
		var side_padding = Math.floor(parseInt($this_dom.find('.cherga_grid_inner').attr('data-pad'))/2,10);
		if (cherga_window.width() < 1200 && side_padding > 20) {
			side_padding = side_padding/2;
		}
		if (cherga_window.width() < 760 && side_padding > 10) {
			side_padding = 10;
		}
		if (jQuery('.cherga_single_gallery_grid').length) {
			$this_dom.find('.cherga_grid_inner').css('margin', side_padding+'px').css('margin-bottom', '0px');
			jQuery('.cherga_single_gallery_grid').css('padding-bottom', side_padding+'px');
		} else {
			$this_dom.find('.cherga_grid_inner').css('margin', side_padding+'px').css('margin-top', -1*side_padding+'px');
		}
		if ($this_dom.find('.cherga_grid_inner').hasClass('side_paddings_on')) {
			$this_dom.find('.cherga_grid_inner').css('margin-left', -1*side_padding+'px').css('margin-right', -1*side_padding+'px');
		}
		$this_dom.find('.grid-item-inner').css({
			'margin-left' : side_padding+'px',
			'margin-top' : side_padding+'px',
			'margin-right' : side_padding+'px',
			'margin-bottom' : side_padding+'px'
		});
		$this_dom.find('.grid-item').each(function(){
			if (jQuery(this).hasClass('anim_el2')) {
				jQuery(this).removeClass('anim_el2');
			}
		});
		$this_dom.find('.cherga_grid_inner').isotope('layout');
		setTimeout("jQuery('.cherga_grid_inner').isotope('layout')",1000);
	};
							   
	this_array.loadmore = function() {
		var this_obj = this,
			$this_dom = this.obj,
			cherga_what_to_append = '',		
			cherga_grid_post_per_page = $this_dom.attr('data-perload'),
			cherga_uniqid = this.id,
			cherga_allposts = this.items.length,
			cherga_overlay = $this_dom.find('.cherga_grid_inner').attr('data-overlay'),
			cherga_count = $this_dom.find('.grid-item').length,
			cherga_ins_container = $this_dom.find('.cherga_grid_inner'),
			cherga_load_more_button = $this_dom.find('.grid_load_more');
	
		if (this.showed >= cherga_allposts) {
			cherga_load_more_button.slideUp(300);
		} else {
			var cherga_now_step = this.showed + parseInt(cherga_grid_post_per_page) - 1;
			if ((cherga_now_step + 1) < cherga_allposts) {
				var cherga_limit = cherga_now_step;
			} else {
				var cherga_limit = cherga_allposts - 1;
				cherga_load_more_button.slideUp(300);
			}
			
			var cherga_swipebox_class = '';
			if (jQuery('.cherga_single_gallery_wrapper ').length > 0) {
				cherga_swipebox_class = 'swipebox';
			}
			for (var i = this.showed; i <= cherga_limit; i++) {
				var cherga_thishref = this.items[i].img,
				cherga_what_to_append = cherga_what_to_append +'\
				<div class="grid-item element anim_el anim_el2 load_anim_grid grid_b2p cherga_isotop_el_loading">\
					<div class="grid-item-inner">\
						<a href="' + cherga_thishref +'" class="cherga_pswp_slide cherga_dp cherga_no_select" data-elementor-open-lightbox="no" data-size="'+ this.items[i].size +'" data-count="'+ cherga_count +'">\
							<img src="'+ this.items[i].thmb +'" alt="' + this.items[i].alt + '" class="grid_thmb"/>\
							<div class="grid-item-content">\
								<h4>'+ this.items[i].title +'</h4>\
							</div>\
							<div class="grid-item-overlay cherga_js_bg_color" data-bgcolor="'+ this.items[i].overlay +'"></div>\
						</a>\
						<div class="cherga-img-preloader"></div>\
					</div>\
				</div>';
				cherga_count++;
				
				// PSWP React
				if (this.items[i].slide_type == 'video') {				
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
							cherga_pswp_html = '<div class="cherga_pswp_video_wrapper"><iframe width="100%" height="100%" src="https://player.vimeo.com/video/' + videoid + '?api=1&amp;title=0&amp;byline=0&amp;portrait=0&autoplay=0&loop=0&controls=1" frameborder="0" webkitAllowFullScreen allowFullScreen></iframe></div>';
					}
					var this_item = {
						html : cherga_pswp_html
					};
					$pswp_gallery_array['cherga_gallery_' + cherga_uniqid].slides.push(this_item);
				} else {
					var item_size = this.items[i].size.split('x'),
						item_width = item_size[0],
						item_height = item_size[1],
						this_item = {
							src : cherga_thishref,
							w : item_width,
							h : item_height
						};
					$pswp_gallery_array['cherga_gallery_' + cherga_uniqid].slides.push(this_item);
				}

				this.showed++;
			}

			var $cherga_newItems = jQuery(cherga_what_to_append);

			if (cherga_ins_container.data('isotope')) {
				cherga_ins_container.isotope('insert', $cherga_newItems, function() {
					cherga_ins_container.find('.cherga_grid_inner').ready(function() {
						cherga_ins_container.isotope('layout');
						this_obj.setup.call(this_obj);
					});
				});
			}
			this_obj.setup.call(this_obj);
			this_obj.preloader.call(this_obj);
		}
		jQuery('.cherga_grid_inner').isotope("layout");
		setTimeout(function () {jQuery('.gallery_grid').isotope("layout");}, 1500);
	}
});

jQuery(document).ready(function(){
	$cherga_grid_wrapper.each(function() {
		var $this_obj = jQuery(this),
			this_obj = cherga_grid_array["cherga_grid_" + $this_obj.attr('data-uniqid')];
		this_obj.init.call(this_obj);
	});
});

jQuery(window).on('load', function () {
	$cherga_grid_wrapper.each(function() {
		var $this_obj = jQuery(this),
			this_obj = cherga_grid_array["cherga_grid_" + $this_obj.attr('data-uniqid')];
		this_obj.setup.call(this_obj);
	});
});

jQuery(window).on('resize', function () {
	$cherga_grid_wrapper.each(function() {
		var $this_obj = jQuery(this),
			this_obj = cherga_grid_array["cherga_grid_" + $this_obj.attr('data-uniqid')];
		this_obj.setup.call(this_obj);
	});
});
