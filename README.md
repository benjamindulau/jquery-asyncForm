# jQuery asynchronous form widget (ajax)

## Introduction

This unobtrusive widget handles any form submission by asynchronous request instead of the default behaviour.

## Usage

Note that the example below also uses Twitter bootstrap ;-)

```javascript
$('#my-form').asyncForm({
    afterSerialize: function(event, ui) {
        // add something to ui.data
    },
    beforeSend: function(event, ui) {
        $('.btn-save').button('loading');
    },
    complete: function(event, ui) {
        $('.btn-save').button('reset');
    },
    badRequestError: function(event, ui) {
        $.liveAlert.show('error', 'Oups!', 'It seems that you made an error... Please check your inputs!');
    },
    inputError: function(event, ui) {
        ui.input.parents('div:first').addClass('invalid');
    },
    success: function(event, ui) {
        $.liveAlert.show('success', 'Nice!', 'Your information has been saved.');
    }
});
```

### Options

The following options are availabled:

 - debug
 - errors: {
       renderBubbledErrors: true,
       renderFieldErrors: true
   }

### Events

The following events are triggered when processing the form:

 - beforeSend
 - complete
 - error
 - success
 - badRequestError
 - bubbledErrors
 - inputError
 - beforeSerialize
 - afterSerialize


### Response format

The response MUST make good usage of HTTP headers.
And especially the following codes :

 - 201 => considered as a successful request
 - 400 => considered as an invalid user input
 - 500 => server error of course

When a "400 Bad Request" response is returned by the server, and in order to handle validation errors, the response
content should be a well structured JSON object like the following:

```json
{
    "form": {
        "errors": ["Please, upload a minimum of 3 photos!"],
        "children": {
            "name": {
                "errors": ["This value is too short. It should have 3 characters or more"]
            }
            "description": {
                "errors": ["This value is too short. It should have 3 characters or more"]
            }
        }
    }
}
```

 - form.errors => Form bubbled error messages
 - form.children => Form field
 - form.children.foo.errors => Error messages for input "foo"


### Performing redirections

In order to redirect the user, for instance after a successful request, the "location" response header should be used,
then the widget will automatically relocate the browser to the wanted URL.
