/*
 * douzo.js 1.3.0
 * https://github.com/gimu/douzo.js
 *
 * Copyright 2014 mail@gimu.org
 * http://gimu.org
 *
 * Licensed under the MIT license:
 * http://opensource.org/licenses/MIT
 */

(function ($) {
    'use strict';

    function Douzo(data, options) {
        var douzo = this;

        // initializing
        douzo.options = $.extend({}, Douzo.prototype.options, options);
        douzo.template = $(douzo.template);
        douzo.setContent(data);

        // adjust the title heading
        if (douzo.options.title == null) {
            $('.douzo-title', douzo.template).addClass('douzo-empty-title');
        } else {
            $('.douzo-title', douzo.template).addClass('douzo-has-title').append(douzo.options.title);
            // add custom title class
            if (douzo.options.titleClass != null) {
                $('.douzo-titlebox', douzo.template).addClass(douzo.options.titleClass);
            }
        }

        // append close button if no buttons available
        if (douzo.options.buttons.length == 0) {
            var close = $('<span class="douzo-close-button"><i class="icon-remove"></i></span>');
            close.bind('click', function () {
                douzo.hide();
            });
            $('.douzo-content', douzo.template).prepend(close);
        }
        

        // prepare the buttons
        if (douzo.options.buttons.length > 0) {
            // loop through the given array
            for (var i = 0; i < douzo.options.buttons.length; i++) {
                var buttonContainer = $('<div>', {'class':'douzo-btnbox'});
                // add custom given id/classname
                var buttonIdname = (douzo.options.buttons[i]['id']) ? douzo.options.buttons[i]['id'] : '';
                var buttonClassname = (douzo.options.buttons[i]['classname']) ? douzo.options.buttons[i]['classname'] : '';

                // construct button with click function
                var button = $('<button>', {
                    href: 'javascript:void(0)',
                    'id': buttonIdname,
                    'class': 'btn ' + buttonClassname,
                    'data-value': douzo.options.buttons[i].val,
                    'click': function() {
                        var value = $(this).attr('data-value');
                        var str = $('#douzo-prompt-input').val();

                        if (typeof douzo.options.callback === 'function') {
                            if (douzo.options.extension == 'prompt') {
                                if (douzo.options.callback(value, str) == false) {
                                    return this;
                                }
                            } else {
                                if (douzo.options.callback(value) == false) {
                                    return this;
                                }
                            }
                        }
                        // close after click
                        douzo.hide();
                    }
                }).text(douzo.options.buttons[i].label);

                // finally append to popup
                buttonContainer.append(button);
                $('.douzo-actions', douzo.template).append(buttonContainer);
            }

        } else {
            // remove footer if no buttons given
            $('.douzo-footbox', douzo.template).remove();
        }

        // spawn modal
        if (douzo.options.modal) {
            douzo.modal = $('<div class="douzo-modal"><div class="douzo-loading"><p>Loading...</p><div class="douzo-dot"></div><div class="douzo-dot"></div><div class="douzo-dot"></div><div class="douzo-dot"></div></div></div>').css({
                width: $(document).width(),
                height: $(document).height(),
                opacity: douzo.options.modalOpacity
            }).appendTo(document.body);
        }

        // final call
        douzo.show();

        // update popup when resizing etc.
        $(window).bind('resize scroll', function() {
            douzo.resize();
        });

        // modal click to close douzo
        if (douzo.options.modalClick) {
            $('.douzo-modal').bind('click', function() {
                douzo.hide();
            });
        }

        // autoclose
        if (douzo.options.autoclose != null) {
            setTimeout(function() {
                douzo.hide();
            }, douzo.options.autoclose);
        }
    }

    Douzo.prototype = {
        options: {
            width: 'auto',
            height: 'auto',
            viewport: { 
                top: '0px', 
                left: '0px' 
            },
            buttons: [],
            center: true,
            title: null,
            titleClass: null,
            modal: true,
            modalOpacity: 0.5,
            modalClick: false,
            padding: '15px 10px 5px',
            unload: true,
            extension: null,
            autoclose: null,
            callback: null
        },
        template: '<div class="douzo"><div class="douzo-box"><div class="douzo-wrapper"><div class="douzo-titlebox"><span class="douzo-title"></span></div><div class="douzo-content"></div><div class="douzo-footbox"><div class="douzo-actions"></div></div></div></div></div>',
        visible: false,

        // set content depending on extension
        setContent: function (data) {
            $('.douzo-box', this.template).css({height: this.options.height, width: this.options.width});
            if (this.options.extension == 'alert' || this.options.extension == 'ask') {
                $('.douzo-content', this.template).css({padding: this.options.padding}).empty().append('<div class="douzo-icon-warning"><i class="icon-exclamation-sign"></i></div>').append('<div class="douzo-text">' + data + '</div>');
            } else if (this.options.extension == 'confirm') {
                $('.douzo-content', this.template).css({padding: this.options.padding}).empty().append('<div class="douzo-icon-confirm"><i class="icon-bullhorn douzo-icon"></i></div>').append('<div class="douzo-text">' + data + '</div>');
            } else if (this.options.extension == 'prompt') {
                $('.douzo-content', this.template).css({padding: this.options.padding}).empty().append(data).append('<input id="douzo-prompt-input" type="text">');
            } else {
                $('.douzo-content', this.template).css({padding: this.options.padding}).empty().append(data);
            }
        },

        // center/return new viewport
        center: function() {
            return {
                top: ($(window).height()/2) - (this.template.height()/2) + "px",
                left: ($(window).width()/2) - (this.template.width()/2) + "px"
            }
        },

        // spawn popup
        show: function () {
            // make sure that only one instance is running
            if (this.visible) return;

            // hide loading
            $('.douzo-loading').remove();

            // append to document
            this.template.appendTo(document.body);

            // center if true
            if (this.options.center) this.options.viewport = this.center();
            
            // viewport depending on extension
            if (this.options.extension != null) {
                this.template.css({top: -100, left: this.options.viewport.left}).animate({top: 0});
            } else {
                this.template.css({top: this.options.viewport.top, left: this.options.viewport.left}).hide().fadeIn();
            }

            this.visible = true;
        },

        // hide popup
        hide: function(after) {
            // must be running
            if (!this.visible) return;
            var douzo = this;

            // fade out modal
            if (douzo.options.modal && douzo.modal != null) {
                this.modal.animate({opacity: 0}, 300, function() { 
                    douzo.modal.remove();
                });
            }

            // fade out douzo content
            this.template.animate({opacity: 0}, 300, function() {
                douzo.template.remove();
                douzo.visible = false;

                // unload from document if true
                if (douzo.options.unload) douzo.unload();
            });
        },
        
        // resize function
        resize: function() {
            // resize modal
            if (this.options.modal) {
                $('.douzo-modal').css({width: $(document).width(), height: $(document).height()});
            }

            // adjust centering
            if (this.options.center) {
                this.options.viewport = this.center();
                if (this.options.extension != null) {
                    this.template.css({top: 0, left: this.options.viewport.left});
                } else {
                    this.template.css({top: this.options.viewport.top, left: this.options.viewport.left});
                }
            }
        },

        // true removing from document
        unload: function() {
            // error procedure?
            if (this.visible) this.hide();
            $(window).unbind('resize', function () { this.resize(); });
            this.template.remove();
        }
    };

    window.Douzo = Douzo;

    // preconfigured popups
    window.Douzo.notify = function(data, callback, options) {
        var settings  = {
            extension: 'notify',
            unload: true,
            modal: false,
            autoclose: 2500,
            callback: callback
        }
        $.extend(settings, options);

        return new Douzo(data, settings);
    }

    window.Douzo.alert = function(data, callback, options) {
        var settings  = {
            buttons: [{
                id: 'confirm',
                classname: 'douzo-danger',
                label: 'OK',
                val: 'confirm'
            }],
            extension: 'alert',
            unload: true,
            callback: callback
        }
        $.extend(settings, options);

        return new Douzo(data, settings);
    }

    window.Douzo.confirm = function(data, callback, options) {
        var settings = {
            buttons: [{
                id: 'confirm',
                classname: 'douzo-success',
                label: 'OK',
                val: 'confirm'
            }],
            extension: 'confirm',
            unload: true,
            callback: callback
        };
        $.extend(settings, options);

        return new Douzo(data, settings);
    }

    window.Douzo.prompt = function(data, callback, options) {
        var settings = {
            buttons: [{
                id: 'yes',
                classname: 'douzo-success',
                label: 'Submit',
                val: 'yes'
            },
            {
                id: 'no',
                classname: 'douzo-danger',
                label: 'Cancel',
                val: 'no'
            }],
            extension: 'prompt',
            unload: true,
            callback: callback
        };
        $.extend(settings, options);

        return new Douzo(data, settings);
    }

    window.Douzo.ask = function(data, callback, options) {
        var settings = {
            buttons: [{
                id: 'yes',
                classname: 'douzo-success',
                label: 'Yes',
                val: 'yes'
            },
            {
                id: 'no',
                classname: 'douzo-danger',
                label: 'No',
                val: 'no'
            }],
            extension: 'ask',
            unload: true,
            callback: callback
        };
        $.extend(settings, options);

        return new Douzo(data, settings);
    }

    window.Douzo.ajax = function(url, options) {
        var settings = {
            params: {},
            unload: true
        };
        $.extend(settings, options);
        
        var request = {
            url: url,
            data: settings.params,
            dataType: 'html',
            error: function(request, status, error) {
                console.log(request.responseText);
            },
            success: function(html) {
                new Douzo(html, settings);
            }
        }

        $.ajax(request);
    }

    window.Douzo.img = function(url, options) {
        var settings = {
            width: 'auto',
            height: 'auto',
            unload: true
        };
        $.extend(settings, options);

        var img = new Image();
        img.src = url;

        // resize if custom width
        if (settings.width != 'auto') {
            img.className  = 'douzo-resize-img';
        }

        new Douzo(img, settings);
    }
})($);