/*
 * Split Slider
 * Created by Pixel-Mafia
 * www.pixel-mafia.com
*/
"use strict";

var cherga_split_sliders = [],
	cherga_split_object = {},
	$cherga_split_wrapper = jQuery('.cherga_split_wrapper'),
	lastChange = +new Date();

$cherga_split_wrapper.each(function() {
	var $this = jQuery(this),
		this_id = $this.attr('data-id');
	cherga_split_sliders[this_id] = {};

	var this_obj = cherga_split_sliders[this_id];

	this_obj.id = $this.attr('data-id');
	this_obj.obj = $this;
	this_obj.slider = $this.find('.cherga_split');
	this_obj.active_left = 0;
	this_obj.active_right = 0;
	this_obj.max_left = $this.find('.cherga_left_slide').length;
	this_obj.max_right = $this.find('.cherga_right_slide').length;
	this_obj.state = 'loading';

	this_obj.init = function() {
		var this_obj_in = this;
		this_obj_in.setup(this_obj_in,'');
		if (this_obj_in.active_slide == 0)
			this_obj_in.change.call(this_obj_in,1);

		this_obj_in.left_slides = [];
		this_obj_in.obj.find('.cherga_left_slide').each(function(){
			this_obj_in.left_slides[jQuery(this).attr('data-count')] = {};
			this_obj_in.left_slides[jQuery(this).attr('data-count')].src = jQuery(this).attr('data-src');
			this_obj_in.left_slides[jQuery(this).attr('data-count')].html = jQuery(this).html();
		});

		this_obj_in.right_slides = [];
		this_obj_in.obj.find('.cherga_right_slide').each(function(){
			this_obj_in.right_slides[jQuery(this).attr('data-count')] = {};
			this_obj_in.right_slides[jQuery(this).attr('data-count')].src = jQuery(this).attr('data-src');
			this_obj_in.right_slides[jQuery(this).attr('data-count')].html = jQuery(this).html();
		});

		this_obj_in.obj.find('.cherga_left_slide').remove();
		this_obj_in.obj.find('.cherga_right_slide').remove();

		// Slides Init
		this_obj_in.active_left = 1;
		this_obj_in.active_right = 1;
		var $this_slider = this_obj_in.slider;
		var before_slide_left, active_slide_left, after_slide_left, after_slide_left_count = 2;
		if (this_obj_in.max_left < 2)
			after_slide_left_count = 1;
		before_slide_left = '\
        <div class="cherga_left_slide cherga_split_before cherga_split_slide" data-count="'+ this_obj_in.max_left +'" style="background-image:url('+ this_obj_in.left_slides[this_obj_in.max_left].src +')">\
            '+ this_obj_in.left_slides[this_obj_in.max_left].html +'\
        </div>';
		active_slide_left = '\
        <div class="cherga_left_slide cherga_split_active cherga_split_slide" data-count="1" style="background-image:url('+ this_obj_in.left_slides[1].src +')">\
            '+ this_obj_in.left_slides[1].html +'\
        </div>';
		after_slide_left = '\
        <div class="cherga_left_slide cherga_split_after cherga_split_slide" data-count="'+ after_slide_left_count +'" style="background-image:url('+ this_obj_in.left_slides[after_slide_left_count].src +')">\
            '+ this_obj_in.left_slides[after_slide_left_count].html +'\
        </div>';
		$this_slider.append(before_slide_left).append(active_slide_left).append(after_slide_left);

		var before_slide_right, active_slide_right, after_slide_right, after_slide_right_count = 2;
		if (this_obj_in.max_right < 2)
			after_slide_right_count = 1;
		before_slide_right = '\
        <div class="cherga_right_slide cherga_split_before cherga_split_slide" data-count="'+ this_obj_in.max_right +'" style="background-image:url('+ this_obj_in.right_slides[this.max_right].src +')">\
            '+ this_obj_in.right_slides[this.max_right].html +'\
        </div>';
		active_slide_right = '\
        <div class="cherga_right_slide cherga_split_active cherga_split_slide" data-count="1" style="background-image:url('+ this_obj_in.right_slides[1].src +')">\
            '+ this_obj_in.right_slides[1].html +'\
        </div>';
		after_slide_right = '\
        <div class="cherga_right_slide cherga_split_after cherga_split_slide" data-count="'+ after_slide_right_count +'" style="background-image:url('+ this_obj_in.right_slides[after_slide_right_count].src +')">\
            '+ this_obj_in.right_slides[after_slide_right_count].html +'\
        </div>';
		$this_slider.append(before_slide_right).append(active_slide_right).append(after_slide_right);

		// Touch and Click Events
		this_obj_in.obj.on("swipeleft", function () {
			this_obj_in.change.call(this_obj_in,1);
		});
		this_obj_in.obj.on("swipeup", function () {
			this_obj_in.change.call(this_obj_in,1);
		});
		this_obj_in.obj.on("swiperight", function () {
			this_obj_in.change.call(this_obj_in,-1);
		});
		this_obj_in.obj.on("swipedown", function () {
			this_obj_in.change.call(this_obj_in,-1);
		});

		jQuery('.cherga_split_btn_prev').on('click', function(){
			this_obj_in.change.call(this_obj_in,-1);
		});
		jQuery('.cherga_split_btn_next').on('click', function(){
			this_obj_in.change.call(this_obj_in,1);
		});

		this_obj_in.obj.on('mousewheel', function(event) {
			event.preventDefault();
			if(+new Date() - lastChange > 100){
				var half_screen = cherga_window.width()/2;
				if (event.deltaY < 0) {
					if (event.pageX <= half_screen) {
						this_obj_in.change.call(this_obj_in,1);
					} else {
						this_obj_in.change.call(this_obj_in,-1);
					}
				}
				if (event.deltaY > 0) {
					if (event.pageX <= half_screen) {
						this_obj_in.change.call(this_obj_in,-1);
					} else {
						this_obj_in.change.call(this_obj_in,1);
					}
				}
				lastChange = +new Date();
			} else {
				lastChange = +new Date();
			}
		});

		// Window Events
		jQuery(window).on('load', function(){
			this_obj_in.obj.removeClass('cherga_module_loading');
			this_obj_in.setup.call(this_obj_in,'');
		});
		jQuery(window).on('resize', function(){
			this_obj_in.setup.call(this_obj_in,'');
		});
	};

	this_obj.setup = function(action) {
		var this_obj_in = this,
			$this_obj = this_obj_in.obj;
		switch (action) {
			default:
				if (cherga_window.height() > cherga_window.width()) {
					jQuery('.cherga_split_wrapper').addClass('cherga_horizontal_split');
				} else {
					jQuery('.cherga_split_wrapper').removeClass('cherga_horizontal_split');
				}

				if (jQuery('.cherga_single_gallery_wrapper').length) {
					var this_wrapper = jQuery('.cherga_single_gallery_wrapper'),
						this_height = cherga_window.height(),
						this_top = 0;

					if (jQuery('#wpadminbar').length) {
						this_height = this_height - jQuery('#wpadminbar').height();
						this_top = jQuery('#wpadminbar').height();
					}
					if (this.obj.attr('data-header') == 'yes') {
						this_height = this_height - cherga_header.height();
						this_top = this_top + cherga_header.height();
					}
					if (this.obj.attr('data-footer') == 'yes') {
						this_height = this_height - cherga_footer.height();
					}
					this.obj.height(this_height).css('top','0px');
					this_wrapper/*.css('top', this_top + 'px')*/.height(this_height);

					if (cherga_footer.length) {
						cherga_footer.css({
							'position' : 'fixed',
							'left' : '0px',
							'bottom' : '0px',
							'width' : '100%',
						});
					}
				} else {
					if ($this_obj.hasClass('auto_height')) {
						var $this_column_wrap = $this_obj.parents('.elementor-column-wrap'),
							this_height = $this_obj.parents('section.elementor-element').children('.elementor-container').height() - parseInt($this_column_wrap.css('padding-top'),10) - parseInt($this_column_wrap.css('padding-bottom'),10);
						$this_obj.height(this_height);
					}
					if ($this_obj.hasClass('screen_height')) {
						var this_height = cherga_window.height();
						if (jQuery('#wpadminbar').length) {
							this_height = this_height - jQuery('#wpadminbar').height();
						}
						if (this.obj.attr('data-header') == 'yes') {
							this_height = this_height - jQuery('header.cherga_main_header').height();
						}
						if (this.obj.attr('data-footer') == 'yes') {
							this_height = this_height - jQuery('footer.cherga_footer').height();
						}
						this_height = Math.ceil(this_height);
						$this_obj.height(this_height);
					}
				}

		}
	};

	this_obj.fix_item = function(check_item,side) {
		var this_obj_in = this;
		if(side == 'left')
			var max_count = this_obj_in.max_left;
		if(side == 'right')
			var max_count = this_obj_in.max_right;

		if (this_obj_in.obj.hasClass('infinity_scroll')) {
			if (check_item < 1)
				check_item = max_count;
			if (check_item > max_count)
				check_item = 1;
		} else {
			if (check_item < 1)
				check_item = 1;
			if (check_item > max_count)
				check_item = max_count;
		}
		return check_item;
	};

	this_obj.change = function(dir) {
		var this_obj_in = this;
		var this_obj = this;
		if (dir > 0) {
			this_obj_in.obj.find('.cherga_split_before').remove();
			this_obj_in.obj.find('.cherga_split_active').removeClass('cherga_split_active').addClass('cherga_split_before');
			this_obj_in.obj.find('.cherga_split_after').removeClass('cherga_split_after').addClass('cherga_split_active');

			this_obj_in.active_left++;
			this_obj_in.active_right++;
			this_obj_in.active_left = this_obj_in.fix_item.call(this_obj, this_obj.active_left, 'left');
			this_obj_in.active_right = this_obj_in.fix_item.call(this_obj, this_obj.active_right, 'right');

			var left_after = this_obj_in.active_left + 1,
				right_after = this_obj_in.active_right + 1;
			left_after = this_obj_in.fix_item.call(this_obj, left_after, 'left');
			right_after = this_obj_in.fix_item.call(this_obj, right_after, 'right');

			var append_left = '\
                <div class="cherga_left_slide cherga_split_after cherga_split_slide" data-count="'+ left_after +'" style="background-image:url('+ this_obj_in.left_slides[left_after].src +')">\
                    '+ this_obj_in.left_slides[left_after].html +'\
                </div>';
			var append_right = '\
                <div class="cherga_right_slide cherga_split_after cherga_split_slide" data-count="'+ right_after +'" style="background-image:url('+ this_obj_in.right_slides[right_after].src +')">\
                    '+ this_obj_in.right_slides[right_after].html +'\
                </div>';

			this_obj_in.slider.append(append_left).append(append_right);
		}
		if (dir < 0) {
			this_obj_in.obj.find('.cherga_split_after').remove();
			this_obj_in.obj.find('.cherga_split_active').removeClass('cherga_split_active').addClass('cherga_split_after');
			this_obj_in.obj.find('.cherga_split_before').removeClass('cherga_split_before').addClass('cherga_split_active');

			this_obj_in.active_left--;
			this_obj_in.active_right--;
			this_obj_in.active_left = this_obj_in.fix_item.call(this_obj_in, this_obj_in.active_left, 'left');
			this_obj_in.active_right = this_obj_in.fix_item.call(this_obj_in, this_obj_in.active_right, 'right');

			var left_before = this_obj_in.active_left - 1,
				right_before = this_obj_in.active_right - 1;
			left_before = this_obj_in.fix_item.call(this_obj_in, left_before, 'left');
			right_before = this_obj_in.fix_item.call(this_obj_in, right_before, 'right');

			var append_left = '\
                <div class="cherga_left_slide cherga_split_before cherga_split_slide" data-count="'+ left_before +'" style="background-image:url('+ this_obj_in.left_slides[left_before].src +')">\
                    '+ this_obj_in.left_slides[left_before].html +'\
                </div>';
			var append_right = '\
                <div class="cherga_right_slide cherga_split_before cherga_split_slide" data-count="'+ right_before +'" style="background-image:url('+ this_obj_in.right_slides[right_before].src +')">\
                    '+ this_obj_in.right_slides[right_before].html +'\
                </div>';

			this_obj_in.slider.append(append_left).append(append_right);
		}
	};

	this_obj.load = function() {
		var this_obj_in = this;
		if (this_obj_in.obj.find('.cherga_split2preload:first').length) {
			(function (img, src) {
				img.src = src;
				img.onload = function () {
					jQuery('.cherga_split2preload:first').removeClass('cherga_split2preload').animate({
						'z-index': '3'
					}, 10, function() {
						this_obj_in.load.call(this_obj_in);
					});
				};
			}(new Image(), jQuery('.cherga_split2preload:first').attr('data-src')));
		} else {
			this_obj_in.obj.removeClass('cherga_module_loading');
			this_obj_in.init.apply(this_obj_in);
		}
	}
});

$cherga_split_wrapper.on('mouseover', function(){
	var $this = jQuery(this),
		this_id = $this.attr('data-id'),
		this_obj = cherga_split_sliders[this_id];

	$this.addClass('cherga_kbd_activated');
});

$cherga_split_wrapper.on('mouseleave', function(){
	var $this = jQuery(this),
		this_id = $this.attr('data-id'),
		this_obj = cherga_split_sliders[this_id];

	$this.removeClass('cherga_kbd_activated');
});

/* -- */

jQuery(document.documentElement).keyup(function (event) {
	var this_id = jQuery('.cherga_kbd_activated').attr('data-id'),
		this_obj = cherga_split_sliders[this_id];

	if ((event.keyCode == 37 || event.keyCode == 38)) {
		event.preventDefault();
		this_obj.change.call(this_obj,-1);
	}
	if ((event.keyCode == 39 || event.keyCode == 40)) {
		event.preventDefault();
		this_obj.change.call(this_obj,1);
	}
});

jQuery(document).ready(function(){
	$cherga_split_wrapper.each(function() {
		var $this = jQuery(this),
			this_id = $this.attr('data-id'),
			this_obj = cherga_split_sliders[this_id];
		this_obj.load.apply(this_obj);
	});
});
