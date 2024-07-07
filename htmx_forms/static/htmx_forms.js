
////////////////////////////////////////////////////////////////////////////////
// base Dialog

window.HtmxForms = (function() {

    class Dialog {

        /**
         * Constructor
         *
         * @param {object} options - check "this.options" defaults for a full list of available options
         */

        constructor(options={}) {

            self = this;

            // Default options
            self.options = {
                dialog_selector: '#dialog_generic',
                open_event: null,
                html: '',
                url: '',
                width: null,
                min_width: null,
                max_width: null,
                height: null,
                min_height: null,
                max_height: null,
                //button_save_label: gettext('Save'),  TODO: add gettext() support
                button_save_label: 'Save',
                button_save_initially_hidden: false,
                //button_close_label: gettext('Cancel'),
                button_close_label: 'Cancel',
                title: '',
                subtitle: '',
                footer_text: '',
                enable_trace: false,
                callback: null,
                autofocus_first_visible_input: true
            };

            // Override with user-supplied custom options
            if (options) {
                Object.assign(self.options, options);
            }

            //self.element = jQuery(self.options.dialog_selector);
            //if (self.element.length <= 0) {
            self.element = document.querySelector(self.options.dialog_selector);
            if (self._check_dialog_element()) {
                self._notify("created", {options: self.options});
            }
        }

        _check_dialog_element() {
            if (self.element === null) {
                let message = 'ERROR: dialog "' + self.options.dialog_selector + '" not found';
                console.log(message);
                HtmxForms.display_server_error(message);
                return false;
            }
            return true;
        }

        /**
         * Fire a custom "Dialog" event.
         *
         * Sample usage in this class:
         *    this._notify("created", ['foo', 'bar']);
         *
         * Sample usage client-side:
         *
         *  jQuery('#dialog_generic').on('created.dialog', function(event, arg1, arg2) {
         *      var target = jQuery(event.target);
         *      console.log('Dialog created: target=%o, arg1=%o, arg2=%o', target, arg1, arg2);
         *  });
         */

        // _notify(event_name, event_info=[]) {
        //     var self = this;
        //     if (self.options.enable_trace) {
        //         console.log('[Dialog] ' + event_name + ' %o', event_info);
        //     }
        //     self.element.trigger(event_name + ".dialog", [self].concat(event_info));
        // }

        _notify(event_name, params={}) {
            let self = this;
            if (self.options.enable_trace) {
                console.log('[Dialog ' + event_name + '] dialog: %o; params:%o', self, params);
            }
            if (self.options.callback) {
                self.options.callback(event_name, self, params);
            }
        }

        /**
         * Getters and setters
         */

        //get element() { return this._element; }
        //get options() { return this._options; }

        /**
         * Close (hide) the dialog
         */

        close() {
            let self = this;

            // Remove close handlers
            document.querySelectorAll('.dialog-header .close, .dialog-footer .btn-close').forEach(item => {
                self._off(item);
            });
            //jQuery(window).off();
            self.element.style.display = 'none';

            // Restore normal page scrolling in case the recently opened modal
            // had disable it to scroll it's own contents instead
            document.querySelector('body').style.overflow = 'auto';

            self._notify('closed');
        }

        _off(element) {
            // Remove all event handlers from element
            // https://stackoverflow.com/questions/4386300/javascript-dom-how-to-remove-all-event-listeners-of-a-dom-object
            if (element !== null) {
                // Clone the element and replace the element with its clone.
                // Events are not cloned.
                element.replaceWith(element.cloneNode(true));
            }
        }

        _initialize(open_event) {
            let self = this;

            // Retrieve missing options from open_event
            if (open_event && open_event.target) {
                let target = open_event.target;
                let options = self.options;
                if (!options.url) options.url = target.getAttribute('href') || '';
                if (!options.html) options.html = target.dataset.html || '';
                if (!options.width) options.width = target.dataset.width || '';
                if (!options.min_width) options.min_width = target.dataset.minWidth || '';
                if (!options.max_width) options.max_width = target.dataset.maxWidth || '';
                if (!options.height) options.height = target.dataset.height || '';
                if (!options.min_height) options.min_height = target.dataset.minHeight || '';
                if (!options.max_height) options.max_height = target.dataset.maxHeight || '';
                if (!options.button_save_label) options.button_save_label = target.dataset.buttonSaveLabel || '';
                if (!options.button_close_label) options.button_close_label = target.dataset.buttonCloseLabel || '';
                if (!options.title) options.title = target.dataset.title || '';
                if (!options.subtitle) options.subtitle = target.dataset.subtitle || '';
                if (!options.footer_text) options.footer_text = target.dataset.footerText || '';
            }

            self.options.open_event = open_event;

            let content = self.element.querySelector('.dialog-content');
            let header = content.querySelector('.dialog-header');
            let body = content.querySelector('.dialog-body');
            let footer = content.querySelector('.dialog-footer');

            if (self.options.width) { content.style.width = self.options.width; }
            if (self.options.min_width) { content.style.minWidth = self.options.min_width; }
            if (self.options.max_width) { content.style.maxWidth = self.options.max_width; }
            if (self.options.height) { body.style.height = self.options.height; }
            if (self.options.min_height) { body.style.minHeight = self.options.min_height; }
            if (self.options.max_height) { body.style.maxHeight = self.options.max_height; }

            header.querySelector('.title').innerHTML = '&nbsp;' + self.options.title;
            if (!self.options.subtitle) {
                header.querySelector('.subtitle').style.display = 'none';
            }
            else {
                header.querySelector('.subtitle').innerHTML = '&nbsp;' + self.options.subtitle;
            }
            footer.querySelector('.text').innerHTML = '&nbsp;' + self.options.footer_text;

            let btn_save = footer.querySelector('.btn-save');
            if (!self.options.button_save_label) {
                btn_save.style.display = 'none';
            }
            else {
                btn_save.value = self.options.button_save_label;
                if (self.options.button_save_initially_hidden) {
                    // Visualization postponed after form rendering
                    btn_save.style.display = 'none';
                }
            }
            let btn_close = footer.querySelector('.btn-close');
            if (!self.options.button_close_label) {
                btn_close.style.display = 'none';
            }
            else {
                btn_close.value = self.options.button_close_label;
            }

            self._notify('initialized');
        }

        /**
         * Show the dialog
         */

        show() {
            let self = this;
            //self.element.show();
            self.element.style.display = 'block';
            self._notify('shown');
        }


        _load() {

            let self = this;
            let header = self.element.querySelector('.dialog-header');

            self._notify('loading', {url: self.options.url});
            header.classList.add('loading');

            /*
            var promise = $.ajax({
                type: 'GET',
                url: self.options.url,
                cache: false,
                crossDomain: true,
                headers: {
                    // make sure request.is_ajax() return True on the server
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }).done(function(data, textStatus, jqXHR) {
                self.element.find('.dialog-body').html(data);
                self._notify('loaded', {url: self.options.url, data: data});
            }).fail(function(jqXHR, textStatus, errorThrown) {
                self._notify('loading_failed', {jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown});
                console.log('ERROR: errorThrown=%o, textStatus=%o, jqXHR=%o', errorThrown, textStatus, jqXHR);
                HtmxForms.display_server_error(errorThrown);
            }).always(function() {
                header.removeClass('loading');
            });
            */

            let promise = fetch(
                self.options.url, {
                    method: 'GET',  // *GET, POST, PUT, DELETE, etc.
                    mode: 'cors',   // 'no-cors',
                    cache: 'no-cache',
                    credentials: 'same-origin',
                    headers: {
                        // make sure request.is_ajax() return True on the server
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                }
            );
            promise.then(response => {
                if (response.ok) {
                    response.text().then(data => {
                        self.element.querySelector('.dialog-body').innerHTML = data;
                        self._notify('loaded', {url: self.options.url, data: data});

                        let form = self.element.querySelector('.dialog-content .dialog-body form');
                        if (form !== null) {
                            // Manage form
                            self._form_ajax_submit();
                        }
                    })
                }
                else {
                    self._notify('loading_failed', {error: response.statusText});
                    HtmxForms.display_server_error(response.statusText);
                }
            }).catch(error => {
                self._notify('loading_failed', {error: error});
                HtmxForms.display_server_error(error.toString());
            }).finally(() => {
                header.classList.remove('loading');
            });

            return promise;
        }

        /**
         * Open the dialog
         *
         * 1. dialog body will be immediately loaded with static content "options.html"
         * 2. then the dialog is shown (unless the "show" parameter is false)
         * 3. finally, dynamic content will be loaded from remote address "options.url" (if supplied)
         * 4. if successfull, a 'loaded.dialog' event is fired; you can use it to perform any action required after loading
         */

        open(event=null, show=true) {

            let self = this;
            if (!self._check_dialog_element()) {
                return;
            }
            self._initialize(event);

            // When the user clicks on any '.btn-close' element, close the modal
            // Also handle Close botton in the footer, if any
            document.querySelectorAll('.dialog-header .close, .dialog-footer .btn-close').forEach(item => {
                console.log(item);
                item.addEventListener('click', function(event) {
                    event.preventDefault();
                    self.close();
                });
            });

            //// When the user clicks anywhere outside of the modal, close it
            //jQuery(window).off().on('click', function(event) {
            //    //if (event.target.id == modal.attr('id')) {
            //    if (event.target == self.element.get(0)) {
            //        self.close();
            //    }
            //});

            if (self.element.classList.contains('draggable')) {
                console.log("[TODO] add support for draggable modals");

                // TODO
                // See: "Drag-n-Drop with Vanilla JavaScript"
                // https://medium.com/codex/drag-n-drop-with-vanilla-javascript-75f9c396ecd

                //self.element.querySelector('.dialog-content').draggable({
                //    handle: '.dialog-header'
                //});
            }

            // Load static content
            self.element.querySelector('.dialog-body').innerHTML = self.options.html;
            self._notify('open');

            // Show the dialog
            if (show) {
                self.show();
            }

            /*
            // Load remote content
            if (self.options.url) {
                self._load().done(function(data, textStatus, jqXHR) {
                    var form = self.element.find('.dialog-content .dialog-body form');
                    if (form.length == 1) {
                        // Manage form
                        self._form_ajax_submit();
                    }
                });
            }
            */

            // Load remote content
            if (self.options.url) {
                self._load();
                // the following has been moved inside _load() as we are not able to
                // read the reponse content (which is itself a provise) twice

                //    var form = self.element.find('.dialog-content .dialog-body form');
                //    if (form.length == 1) {
                //        // Manage form
                //        self._form_ajax_submit();
                //    }
            }
        }

        _form_ajax_submit(with_errors=false) {

            let self = this;

            let content = self.element.querySelector('.dialog-content');
            let header = content.querySelector('.dialog-header');
            let body = content.querySelector('.dialog-body');
            let footer = content.querySelector('.dialog-footer');
            let form = content.querySelector('.dialog-body form');

            // use footer save button, if available
            let btn_save = footer.querySelector('.btn-save');
            if (self.options.button_save_label !== null && btn_save) {

                let submit_row = form.querySelector('.form-submit-row');
                if (submit_row) {
                    submit_row.style.display = 'none';
                }
                //btn_save.off().on('click', function(event) {
                //    form.submit();
                //});
                self._off(btn_save);
                btn_save = footer.querySelector('.btn-save');

                btn_save.addEventListener('click', function(event) {
                    //form.submit();
                    form.requestSubmit();
                });

                btn_save.style.display = 'block';
            }


            // Give focus to first visible form field
            if (self.options.autofocus_first_visible_input) {

                // TODO: rewrite as vanilla js
                try {
                    if (with_errors) {
                        // In case of error, move focus to first failing input
                        form.find('.field-with-errors input:visible').first().focus().select();
                    }
                    else {
                        form.find('input:visible').first().focus().select();
                    }
                }
                catch (error) {
                    console.log('[TODO] give focus to first visible field')
                }
            }

            // bind to the form’s submit event
            form.addEventListener('submit', function(event) {

                // prevent the form from performing its default submit action
                event.preventDefault();
                header.classList.add('loading');

                // serialize the form’s content and send via an AJAX call
                // using the form’s defined method and action
                let url = form.getAttribute('action') || self.options.url;
                let method = form.getAttribute('method') || 'post';
                // We use FormData // to allow files upload (i.e. process <input type="file"> as expected)
                // Note that, using FormData, we also need (with jQuery):
                // - processData: false
                // - contentType: false
                let data = new FormData(form);
                //console.log('form data: %o', new URLSearchParams(data).toString());

                self._notify('submitting', {method: method, url: url, data:data});

                let promise = fetch(
                    url, {
                        method: method,
                        body: data,
                        mode: 'cors',   // 'no-cors',
                        cache: 'no-cache',
                        credentials: 'same-origin',
                        headers: {
                            // make sure request.is_ajax() return True on the server
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    }
                );
                promise.then(response => {
                    if (response.ok) {
                        // Upon receiving a JSON response, we assume that the form has been validated,
                        // so we can close the modal
                        if (response.headers.get('Content-Type') === 'application/json') {
                            response.json().then(data => {
                                self._notify('submitted', {method: method, url: url, data: data});
                                self.close();
                            })
                            .catch(error => {
                                HtmxForms.display_server_error(error);
                            })
                        }
                        else {
                            response.text().then(data => {

                                // update the modal body with the new form
                                body.innerHTML = data;

                                // Does the response contain a form ?
                                let form = self.element.querySelector('.dialog-content .dialog-body form');
                                if (form !== null) {
                                    // If the server sends back a successful response,
                                    // we need to further check the HTML received

                                    // If xhr contains any field errors,
                                    // the form did not validate successfully,
                                    // so we keep it open for further editing
                                    //if (jQuery(xhr).find('.has-error').length > 0) {

                                    if (form.querySelectorAll('.has-error').length > 0 || form.querySelectorAll('.errorlist').length > 0) {
                                        self._notify('loaded', {url: url});
                                        self._form_ajax_submit(true);
                                    } else {
                                        // otherwise, we've done and can close the modal
                                        self._notify('submitted', {method: method, url: url, data: data});
                                        self.close();
                                    }
                                }
                                // If not, assume we received a feedback for the user after successfull submission, so:
                                // - keep the dialog open
                                // - hide the save button
                                else {
                                    // We also notify the user about successful submission
                                    self._notify('submitted', {method: method, url: url, data: data});
                                    btn_save.style.display = 'none';
                                }
                            });
                        }

                    } else {
                        self._notify('submission_failure', {method: method, url: url, data: data, error: response.statusText});
                        HtmxForms.display_server_error(response.statusText);
                    }

                }).catch(error => {
                    self._notify('submission_failure', {method: method, url: url, data: data, error:error});
                    HtmxForms.display_server_error(error.toString());
                }).finally(() => {
                    header.classList.remove('loading');
                });

                /*
                $.ajax({
                    type: method,
                    url: url,
                    data: data,
                    processData: false,
                    contentType: false,
                    cache: false,
                    crossDomain: true,
                    headers: {
                        // make sure request.is_ajax() return True on the server
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                }).done(function(xhr, textStatus, jqXHR) {

                    // update the modal body with the new form
                    body.html(xhr);

                    // Does the response contain a form ?
                    var form = self.element.find('.dialog-content .dialog-body form');
                    if (form.length > 0) {
                        // If the server sends back a successful response,
                        // we need to further check the HTML received

                        // If xhr contains any field errors,
                        // the form did not validate successfully,
                        // so we keep it open for further editing
                        //if (jQuery(xhr).find('.has-error').length > 0) {
                        if (jQuery(xhr).find('.has-error').length > 0 || jQuery(xhr).find('.errorlist').length > 0) {
                            self._notify('loaded', {url: url});
                            self._form_ajax_submit(true);
                        } else {
                            // otherwise, we've done and can close the modal
                            self._notify('submitted', {method: method, url: url, data: data});
                            self.close();
                        }
                    }
                    // If not, assume we received a feedback for the user after successfull submission, so:
                    // - keep the dialog open
                    // - hide the save button
                    else {
                        // We also notify the user about successful submission
                        self._notify('submitted', {method: method, url: url, data: data});
                        btn_save.hide();
                    }

                }).fail(function(jqXHR, textStatus, errorThrown) {
                    self._notify('submission_failure', {method: method, url: url, data:data});
                    console.error('ERROR: errorThrown=%o, textStatus=%o, jqXHR=%o', errorThrown, textStatus, jqXHR);
                    console.error(jqXHR.responseText);
                    HtmxForms.display_server_error(errorThrown);
                }).always(function() {
                    header.removeClass('loading');
                });

                */
            });
        }
    }

    /*
     * Routing
     */

    function redirect(url, show_layer=false) {
        // see: http://stackoverflow.com/questions/503093/how-can-i-make-a-redirect-page-in-jquery-javascript
        // similar behavior as an HTTP redirect
        console.log('redirect(): ' + url);
        if (show_layer) {
            overlay_show('body');
        }
        window.location.replace(url);
    }

    function gotourl(url, show_layer=false) {
        // see: http://stackoverflow.com/questions/503093/how-can-i-make-a-redirect-page-in-jquery-javascript
        // similar behavior as clicking on a link
        console.log('gotourl(): ' + url);
        if (show_layer) {
            overlay_show('body');
        }
        window.location.href = url;
    }

    function reload_page(show_layer=false) {
        if (show_layer) {
            overlay_show('body');
        }
        window.location.reload(true);
    }

    function overlay_show(element) {
        /*
            Requires:

                {% include 'frontend_forms/overlay.html' %}

            References:
                - "Custom Loading Animation on Fetch Call in Vanilla Javascript / CSS / HTML 5", at:
                  https://dev.to/hariseldon27/custom-loading-animation-on-fetch-call-in-vanilla-javascript-css-html-5-1a9n
                - "SVG Spinners collection", at:
                  https://github.com/n3r4zzurr0/svg-spinners
        */
        let overlay = document.querySelector('#htmx_forms_overlay');
        if (overlay !== null) {
            overlay.style.display = 'block';
        }
        else {
            console.error('Overlay "#htmx_forms_overlay" not found. Did you forget to include "htmx_forms/overlay.html" ?');
        }
    }

    function overlay_hide(element) {
        let overlay = document.querySelector('#htmx_forms_overlay');
        if (overlay !== null) {
            overlay.style.display = 'none';
        }
        else {
            console.error('Overlay "#htmx_forms_overlay" not found. Did you forget to include "htmx_forms/overlay.html" ?');
        }
    }

    function hide_mouse_cursor() {
        // https://stackoverflow.com/questions/9681080/changing-cursor-to-waiting-in-javascript-jquery#25207986
        document.querySelector('body').style.cursor = 'none';
    }
    function getCookie(name) {
        var value = '; ' + document.cookie,
            parts = value.split('; ' + name + '=');
        if (parts.length == 2) return parts.pop().split(';').shift();
    }

    function display_server_error(message) {
        // TODO: add something more appropriate here
        alert(message);
    }

    // http://stackoverflow.com/questions/16086162/handle-file-download-from-ajax-post#23797348
    function downloadFromAjaxPost(url, params, headers, callback) {

        // NOTE:
        // jQuery ajax is not able to handle binary responses properly (can't set responseType),
        // so it's better to use a plain XMLHttpRequest call.
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
            if (this.status === 200) {
                var filename = "";
                var disposition = xhr.getResponseHeader('Content-Disposition');
                if (disposition && disposition.indexOf('attachment') !== -1) {
                    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    var matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
                }
                var type = xhr.getResponseHeader('Content-Type');

                var blob = new Blob([this.response], { type: type });
                if (typeof window.navigator.msSaveBlob !== 'undefined') {
                    // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
                    window.navigator.msSaveBlob(blob, filename);
                } else {
                    var URL = window.URL || window.webkitURL;
                    var downloadUrl = URL.createObjectURL(blob);

                    if (filename) {
                        // use HTML5 a[download] attribute to specify filename
                        var a = document.createElement("a");
                        // safari doesn't support this yet
                        if (typeof a.download === 'undefined') {
                            window.location = downloadUrl;
                        } else {
                            a.href = downloadUrl;
                            a.download = filename;
                            document.body.appendChild(a);
                            a.click();
                        }
                    } else {
                        window.location = downloadUrl;
                        // if (target !== undefined) {
                        //     window.open(downloadUrl, target);
                        // }
                        // else {
                        //     window.location.href = downloadUrl;
                        // }
                    }

                    setTimeout(function() { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
                }
            }
            if (callback) {
                callback();
            }
        };
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        $.each(headers, function(key, value) {
            xhr.setRequestHeader(key, value);
        });

        xhr.send($.param(params));
    }

    return {
        Dialog,
        redirect: redirect,
        gotourl: gotourl,
        reload_page: reload_page,
        overlay_show: overlay_show,
        overlay_hide: overlay_hide,
        getCookie: getCookie,
        display_server_error: display_server_error,
        downloadFromAjaxPost: downloadFromAjaxPost
    };

})();

