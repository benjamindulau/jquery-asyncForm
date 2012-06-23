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
                method: $form.attr('method').toUpperCase(),
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
                    self._trigger("complete", event, {xhr: jqXHR, status: textStatus});
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    self._trigger("error", event, {xhr: jqXHR, status: textStatus, error: errorThrown});
                    self._onError(jqXHR, errorThrown);
                },
                success: function(data, textStatus, jqXHR) {
                    self._onComplete(data, textStatus, jqXHR);
                }
            });
        },

        _onComplete: function(data, textStatus, jqXHR) {
            if (data.redirect) {
                return top.window.location.replace(data.redirect);
            }

            this._trigger("success", event, {xhr: jqXHR, status: textStatus, data: data});
        },


        // Error handling

        _onError: function(xhr, error) {
            var self = this;
            self._debug('Error ' + xhr.status + ' (' + error + ')');

            switch (xhr.status) {
                case 400:
                    self._trigger("badRequestError", null, {xhr: xhr, error: error});
                    self._onErrorBadRequest(xhr, error);
                    break;
                case 500:

                    break;

            }
        },

        _onErrorBadRequest: function(xhr, error) {
            var self = this, response = $.parseJSON(xhr.responseText);
            if ((typeof response.form === 'undefined') || (typeof response.form.children === 'undefined')) {
                return;
            }

            self._debug('Iterating errors...');

            var inputName = '';
            var errorWalk = function(name) {
                var child = this, thisInputName = inputName + '[' + name + ']';

                if (child.hasOwnProperty('errors') && child.errors.length) {
                    self._renderErrors(thisInputName, child.errors);
                }

                if (child.hasOwnProperty('children')) {
                    inputName += '[' + name + ']';
                    $.each(child.children, errorWalk);
                }
            };

            $.each(response.form.children, errorWalk);
        },

        _renderErrors: function(inputName, errors) {
            var self = this;
            var element = $('<ul class="input-error-container"></ul>')
                .hide();

            $.each(errors, function(i) {
                self._debug('Error for input "' + inputName + '" : ' + this);

                element.append(self._renderError(this));
            });

            element
                .insertAfter(self.element.find(':input[name*="' + inputName + '"]'))
                .fadeIn()
            ;
        },

        _renderError: function(error) {
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

        }
    });

}(jQuery));

/*
<script id="ano-uploader-tmpl" type="text/x-jquery-tmpl">
    <div id="ano-uploader-ui" class="ano-uploader-ui">
        <div class="dg-dp-area">
            <p class="dg-dp-text">
                Drag and drop photos here.
            </p>
            <div class="button" data-button="add">
                <span class="text">Choose photos on this computer</span>
            </div>
            <div class="uploaded-files">
                <ul class="file-list">
                    {{each photos tmpl="#ano-uploader-file-tmpl"}}
                </ul>
            </div>
            <div class="progressbar progress-all">
                <div class="progress"></div>
            </div>
            <input id="file" type="file" name="files[]" multiple="multiple" />
        </div>
    </div>
</script>

<script id="ano-uploader-file-tmpl" type="text/x-jquery-tmpl">
    <li class="file-item" data-id="{{=id}}" data-type="file" data-index="{{=$ctx.fileIndex($view)}}">
        <div class="wrapper">
            <div class="thumbnail-area">
                <img src="{{=media.content}}" alt="" class="thumbnail" />
            </div>
            <a href="#" title="Delete" class="action-delete" data-action="delete"><span>[x]</span></a>
            <a href="#" class="action-rotate" data-action="rotate" title="Pivoter de 90°" tabindex="-1" onclick="return false">
                <span>Rotate 90°</span>
            </a>

            <div class="progressbar">
                <div class="progress"></div>
            </div>
            <div class="messages">
                <ul class="message-list"></ul>
            </div>
        </div>
    </li>
</script>
*/