/*
 * Packery Gallery
 * Created by Pixel-Mafia
 * www.pixel-mafia.com
*/
"use strict";
var $cherga_container = jQuery('.cherga_packery_inner'),
	cherga_packery_array = [],
	$cherga_packery_gallery_array = jQuery('.cherga_packery_gallery_array'),
	$cherga_packery_wrapper = jQuery('.cherga_packery_wrapper');

$cherga_packery_wrapper.each(function() {
	var $this_obj = jQuery(this);
	cherga_packery_array["cherga_packery_" + $this_obj.attr('data-uniqid')] = {};
	var this_array = cherga_packery_array["cherga_packery_" + $this_obj.attr('data-uniqid')];
	this_array.id = jQuery(this).attr('data-uniqid');
	this_array.showed = 0;
	this_array.items = [];
	
	var this_items_array = this_array.items;
	if ($this_obj.find('.cherga_packery_gallery_array').length) {
		$this_obj.find('.cherga_packery_gallery_array').each(function() {
			jQuery(this).find('.cherga_packery_array_item').each(function(){
				var $this = jQuery(this),
					cherga_packery_item = {};
				cherga_packery_item.slide_type = $this.attr('data-type');
				cherga_packery_item.img = $this.attr('data-img');
				cherga_packery_item.thmb = $this.attr('data-thmb');
				cherga_packery_item.title = $this.attr('data-title');
				cherga_packery_item.alt = $this.attr('data-alt');
				cherga_packery_item.overlay = $this.attr('data-overlay');
				cherga_packery_item.counter = $this.attr('data-counter');
				cherga_packery_item.size = $this.attr('data-size');
				this_items_array.push(cherga_packery_item);
			});
			jQuery(this).remove();
		});
	}

	this_array.obj = jQuery('.cherga_packery_'+this_array.id);
	
	this_array.init = function () {
		var this_obj = this;
		this.obj.find('.packery_load_more').on("click", function () {
			this_obj.loadmore.call(this_obj);
			setTimeout("cherga_isotop_el_loading()", 100);
		});
		this.setup.call(this);
		this.preloader.call(this);
	};
	
	this_array.preloader = function() {
		var this_obj = this,
			$this_dom = this.obj;
		if ($this_dom.find('.load_anim:first').length > 0) {
			(function (img, src) {
				var loaded = false;
				var proceed = function() {
					if (loaded) return;
					loaded = true;
					$this_dom.find('.load_anim:first').removeClass('load_anim').removeClass('anim_el').animate({
						'z-index': '15'
					}, 200, function() {
						$this_dom.find('.cherga_packery_inner').isotope('layout');
						this_obj.setup.call(this_obj);
						this_obj.preloader.call(this_obj);
					});
				};
				img.onload = proceed;
				img.onerror = proceed;
				setTimeout(proceed, 3000);
				img.src = src;
			}(new Image(), $this_dom.find('.load_anim:first').find('.packery-item-inner').attr('data-src')));
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
		
		$this_dom.find('.cherga_packery_inner').each(function() {
			var side_padding = Math.floor(parseInt(jQuery(this).attr('data-pad'))/2);
			jQuery(this).parent('.cherga_packery_wrapper').css('padding', side_padding+'px');
			if (cherga_window.width() < 1200 && side_padding > 20) {
				side_padding = side_padding/2;
			}
			if (cherga_window.width() < 760 && side_padding > 10) {
				side_padding = 10;
			}
			if (cherga_window.width() > 760) {
					small_item = Math.floor((jQuery(this).width())/4);
					large_item = small_item*2;
			} else {
				var	small_item = Math.floor(jQuery(this).width()),
					large_item = small_item;
			}
			if (jQuery(this).hasClass('side_paddings_on')) {
				jQuery(this).css('margin-left', -1*side_padding+'px').css('margin-right', -1*side_padding+'px');
				jQuery(this).parent('.cherga_packery_wrapper').css('padding-left','0px').css('padding-right','0px');
			}
			jQuery(this).find('.packery-item').each(function(){
				if (jQuery(this).hasClass('anim_el2')) {
					jQuery(this).removeClass('anim_el2');
				}
				var set_item_width = small_item,
					set_item_height = small_item;					
				if (jQuery(this).hasClass('packery-item1') || jQuery(this).hasClass('packery-item7')) {
					set_item_width = large_item;
					set_item_height = large_item;
				}
				if (jQuery(this).hasClass('packery-item4') || jQuery(this).hasClass('packery-item8')) {
					set_item_width = large_item;
					set_item_height = small_item;
				}
				jQuery(this).find('.packery-item-inner').css({
					'margin-left' : side_padding+'px',
					'margin-top' : side_padding+'px',
					'margin-right' : side_padding+'px',
					'margin-bottom' : side_padding+'px',
					'width' : (set_item_width-side_padding*2)+'px',
					'height' : (set_item_height-side_padding*2)+'px'
				});
				jQuery(this).css({
					'width' : set_item_width+'px',
					'height' : set_item_height+'px'
				});
				if (jQuery(this).hasClass('anim_el2')) {
					jQuery(this).removeClass('anim_el2');
				}				
			});
		});
		
	};
							   
	this_array.loadmore = function() {
		var this_obj = this,
			$this_dom = this.obj,
			cherga_what_to_append = '',		
			cherga_packery_post_per_page = $this_dom.attr('data-perload'),
			cherga_uniqid = this.id,
			cherga_allposts = this.items.length,
			cherga_overlay = $this_dom.find('.cherga_packery_inner').attr('data-overlay'),
			cherga_count = $this_dom.find('.packery-item').length,
			cherga_ins_container = $this_dom.find('.cherga_packery_inner'),
			cherga_load_more_button = $this_dom.find('.packery_load_more');
		var current_count = parseInt($this_dom.find('.packery-item:last').attr('data-count'));
		
		if (this.showed >= cherga_allposts) {
			cherga_load_more_button.slideUp(300);
		} else {
			var cherga_now_step = this.showed + parseInt(cherga_packery_post_per_page) - 1;
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
			for (var i = this_obj.showed; i <= cherga_limit; i++) {
				current_count ++;
				if (current_count > 8) {
					current_count = 1;
				}
				var cherga_thishref = this_obj.items[i].img,
				cherga_what_to_append = cherga_what_to_append +'\
				<div class="packery-item packery-item'+ current_count +' element anim_el anim_el2 load_anim packery_b2p cherga_isotop_el_loading" data-count="'+ current_count +'">\
					<div class="packery-item-inner" data-src="'+ this_obj.items[i].thmb +'" style="background-image: url('+ this_obj.items[i].thmb +');">\
						<a href="' + cherga_thishref +'" class="cherga_pswp_slide cherga_dp cherga_no_select" data-elementor-open-lightbox="no" data-size="'+ this_obj.items[i].size +'" data-count="'+ cherga_count +'">\
							<div class="packery-item-content">\
								<h4>'+ this_obj.items[i].title +'</h4>\
							</div>\
							<div class="packery-item-overlay cherga_js_bg_color" style="background-color: '+ this_obj.items[i].overlay +'"></div>\
						</a>\
						<div class="cherga-img-preloader"></div>\
					</div>\
				</div>';

				cherga_count++;
				var item_size = this_obj.items[i].size.split('x'),
					item_width = item_size[0],
					item_height = item_size[1],
					this_item = {
						src : cherga_thishref,
						w : item_width,
						h : item_height
					};
				$pswp_gallery_array['cherga_gallery_' + cherga_uniqid].slides.push(this_item);

				this_obj.showed++;
			}

			var $cherga_newItems = jQuery(cherga_what_to_append);

			if (cherga_ins_container.data('isotope')) {
				cherga_ins_container.isotope('insert', $cherga_newItems, function() {
					cherga_ins_container.find('.cherga_packery_inner').ready(function() {
						cherga_ins_container.isotope('layout');
						cherga_setup_packery();
					});
				});
			} else {
				reinsert_items_2_isotope(cherga_ins_container, $cherga_newItems, 'packery');
			}
			this_obj.setup.call(this_obj);
			this_obj.preloader.call(this_obj);
		}
		jQuery('.cherga_packery_inner').isotope("layout");
		setTimeout(function () {jQuery('.gallery_packery').isotope("layout");}, 1500);
	}
});

jQuery(document).ready(function(){
	$cherga_packery_wrapper.each(function() {
		var $this_obj = jQuery(this),
			this_obj = cherga_packery_array["cherga_packery_" + $this_obj.attr('data-uniqid')];
		this_obj.init.call(this_obj);
	});
});

jQuery(window).on('load', function () {
	$cherga_packery_wrapper.each(function() {
		var $this_obj = jQuery(this),
			this_obj = cherga_packery_array["cherga_packery_" + $this_obj.attr('data-uniqid')];
		this_obj.setup.call(this_obj);
	});
});

jQuery(window).on('resize', function () {
	$cherga_packery_wrapper.each(function() {
		var $this_obj = jQuery(this),
			this_obj = cherga_packery_array["cherga_packery_" + $this_obj.attr('data-uniqid')];
		this_obj.setup.call(this_obj);
	});
});
