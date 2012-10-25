/*!
 * Anonymation async form widget for jQuery UI
 * http://www.anonymation.com/
 *
 * Version: 1.0
 *
 * Depends:
 */

(function ($) {
    jQuery.fn.serializeObject = function() {
        var arrayData, objectData;
        arrayData = this.serializeArray();
        objectData = {};

        $.each(arrayData, function () {
            var value;

            if (this.value != null) {
                value = this.value;
            } else {
                value = '';
            }

            if (objectData[this.name] != null) {
                if (!objectData[this.name].push) {
                    objectData[this.name] = [objectData[this.name]];
                }

                objectData[this.name].push(value);
            } else {
                objectData[this.name] = value;
            }
        });

        return objectData;
    };


    $.widget("ano.asyncForm", {
        _create: function () {
            this._initForm();
            this._initSubmitEventHandlers();
        },

        // Initialization methods

        _initForm: function() {
            var $form = this.element;

            this._form = {
                action: $form.attr('action'),
                method: $form.attr('method').toUpperCase()
            };
        },

        _initSubmitEventHandlers: function() {
            var self = this;

            this.element.bind('submit', function(event) {
                self._submit(event);

                event.preventDefault();
            })
        },

        _submit: function(event) {
            var self = this;

            $.ajax({
                url: self._form.action,
                type: self._form.method,
                dataType: 'json',
                data: self._serialize(),
                beforeSend: function(jqXHR, settings) {
                    self._trigger("beforeSend", event, {xhr: jqXHR});
                },
                complete: function(jqXHR, textStatus) {
                    self._trigger("complete", event, {xhr: jqXHR, status: textStatus, element: self.element});
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    self._trigger("error", event, {xhr: jqXHR, status: textStatus, error: errorThrown, element: self.element});
                    self._onError(jqXHR, errorThrown);
                },
                success: function(data, textStatus, jqXHR) {
                    self._onComplete(jqXHR, data);
                }
            });
        },

        _onComplete: function(xhr, data) {
            var location = xhr.getResponseHeader('location');

            if (location) {
                return window.location.replace(location);
            }

            this._trigger("success", event, {xhr: xhr, data: data});
        },


        // Error handling

        _onError: function(xhr, error) {
            var self = this;
            self._debug('Error ' + xhr.status + ' (' + error + ')');

            switch (xhr.status) {
                case 400:
                    self._trigger("badRequestError", null, {xhr: xhr, error: error, element: self.element});
                    self._onErrorBadRequest(xhr, error);
                    break;
                case 500:

                    break;

            }
        },

        _onErrorBadRequest: function(xhr, error) {
            var self = this, response = $.parseJSON(xhr.responseText);
            if (typeof response.form === 'undefined') {
                return;
            }

            // General form errors
            if (!(typeof response.form.errors === 'undefined') && response.form.errors.length) {
                self._trigger("bubbledErrors", null, {xhr: xhr, errors: response.form.errors, element: self.element});
                self._renderBubbledErrors(response.form.errors);
            }

            // Form field errors
            if (typeof response.form.children === 'undefined') {
                return;
            }

            self._debug('Iterating errors...');

            var inputName = '';
            var errorWalk = function(name) {
                var
                    child = this,
                    thisInputName = inputName + '[' + name + ']',
                    thisInputElement = self.element.find(':input[name*="' + thisInputName + '"]')
                ;

                if (child.hasOwnProperty('errors') && child.errors.length) {
                    self._trigger("inputError", null, {xhr: xhr, error: error, input: thisInputElement, element: self.element});
                    self._renderFieldErrors(thisInputName, child.errors);
                }

                if (child.hasOwnProperty('children')) {
                    inputName += '[' + name + ']';
                    $.each(child.children, errorWalk);
                }
            };

            $.each(response.form.children, errorWalk);
        },

        _renderBubbledErrors: function(errors) {
            var self = this;
            var element = $('<ul class="bubbled-error-container"></ul>')
                .hide();

            $.each(errors, function(i) {
                self._debug('Bubbled error: ' + this);

                element.append(self._renderBubbledError(this));
            });

            // removing existing error element
            this.element.find('.bubbled-error-container').remove();

            // appending error element
            element
                .prependTo(this.element)
                .fadeIn()
            ;
        },

        _renderBubbledError: function(error) {
            var element = $('<li class="bubbled-error"></li>');

            return element.text(error);
        },

        _renderFieldErrors: function(inputName, errors) {
            var self = this, inputElement;
            var element = $('<ul class="input-error-container"></ul>')
                .hide();

            $.each(errors, function(i) {
                self._debug('Error for input "' + inputName + '": ' + this);

                element.append(self._renderFieldError(this));
            });

            inputElement = self.element.find(':input[name*="' + inputName + '"]');

            if (inputElement.length) {
                // removing existing error element
                inputElement
                    .next('.input-error-container')
                    .remove()
                ;

                // appending error element
                element
                    .insertAfter(inputElement)
                    .fadeIn()
                ;
            }
        },

        _renderFieldError: function(error) {
            var element = $('<li class="input-error"></li>');

            return element.text(error);
        },

        _serialize: function() {
            var self = this, data = {};

            self._trigger("beforeSerialize", null, {data: data});
            data = $.extend(data, self.element.serializeObject());
            self._trigger("afterSerialize", null, {data: data});

            return data;
        },

        _debug: function(message) {
            if (this.options.debug && !(typeof console == 'undefined'))  {
                console.log(message);
            }
        },

        // PUBLIC methods

        options: {
            debug: false,
            errors: {
                renderBubbledErrors: true,
                renderFieldErrors: true
            }
        }
    });

}(jQuery));