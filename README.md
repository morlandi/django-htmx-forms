
> This project is still in early construction and largely incomplete.

> Do not use in production at this time.


# django-htmx-forms

Adding editing capabilities to the frontend in a modern user interface requires the usage of modal forms.

django-htmx-forms is a package which provides tools for working with modal popups, form submission and validation via ajax in a Django project.

I also took the chance to take a closer look at htmx, a JavaScript framework that handles Ajax communication based on custom HTML attributes.


django-htmx-forms does not require jQuery, nor Bootstrap or other frameworks;
HTMX is mostly optional.

Based on my previous somehow incomplete researches as documented here:

- [Editing Django models in the front end](https://editing-django-models-in-the-frontend.readthedocs.io/en/latest/)
- [Django Frontend Forms](https://github.com/morlandi/django-frontend-forms)

[TOC]

## Installation

Install the package by running:

```bash
pip install django-htmx-forms
```

or:

```bash
pip install git+https://github.com/morlandi/django-htmx-forms
```

In your settings, add:

```python
INSTALLED_APPS = [
    ...
    'htmx_forms',
]
```

Include library's views mapping (file `urls.py`):


```python
urlpatterns = [
    ...
    path('htmx_forms/', include('htmx_forms.urls', namespace='htmx_forms')),
    ...
```

In your base template, include: the default styles, the javascript support,
and optionally the sample HTML template:

```html
<link rel='stylesheet' href="{% static 'htmx_forms.css' %}">
<script src="{% static 'htmx_forms.js' %}"></script>

{% include 'htmx_forms/dialogs.html' %}
```

# Modals with Django

In this context, our main objectives are:

- having a dialog box, to be used as "container" for user interaction, whose layout
  is coherent with the front-end pages
- the content and life cycle of the dialog can be controlled "server-side"
- the dialog will close when the user has completed or cancelled the operation

**The solution suggested by `django-htmx-forms` requires two actions:**

```
1) provide an HTML template for the dialog layout

2) attach the template to a `Dialog()` javascript object to control it's behaviour
```

Since in most cases you will be primarily interested in customizing the modal
content only, a default template is provided to render a generic dialog

file: `htmx_forms/templates/htmx_forms/dialogs.html`:

```html
<div id="dialog_generic" class="dialog draggable">
    <div class="dialog-dialog">
        <div class="dialog-content">
            <div class="dialog-header">
                <span class="spinner">
                    <i class="fa fa-spinner fa-spin"></i>
                </span>
                <span class="close">&times;</span>
                <div class="title">Title</div>
            </div>
            <div class="dialog-body ui-front">
                {% comment %}
                <p>Some text in the dialog ...</p>
                {% endcomment %}
            </div>
            <div class="dialog-footer">
                <input type="submit" value="Close" class="btn btn-close" />
                <input type="submit" value="Save" class="btn btn-save" />
                <div class="text">footer</div>
            </div>
        </div>
    </div>
</div>
```

When instantiating the javascript `Dialog` object, you can select an alternative
template instead, providing a suitable value for `djalog_selector`:

```javascript
document.addEventListener("DOMContentLoaded", function() {

    dialog1 = new Dialog({
        dialog_selector: '#dialog_generic',
        html: '<h1>Loading ...</h1>',
        width: '400px',
        min_height: '200px',
        title: '<i class="fa fa-calculator"></i> Select an object ...',
        footer_text: 'testing dialog ...'
    });

});
```

It is advisable to use an HTML structure similar to the default layout;

Notes:

- adding ".ui-front" to the ".dialog-box" element helps improving the behaviour of the dialog on a mobile client
- adding class ".draggable" makes the Dialog draggable - this is optional, ~~and requires jquery-ui~~ **TODO: MUST RESTORE THIS WITH VANILLA JS**


## Opening a Dialog

### A static Dialog

The layout of the Dialog is fully described by the referenced HTML template:
either the default "#dialog_generic" of a specific one.

You can fully customize the rendering with CSS; the default styles are provided
by `htmx_forms/static/htmx_forms.css`

```javascript
dialog1 = new Dialog({
    dialog_selector: '#dialog_generic',
    html: '<h1>Static content goes here ...</h1>',
    width: '600px',
    min_height: '200px',
    title: '<i class="fa fa-calculator"></i> Select an object ...',
    footer_text: 'testing dialog ...',
    enable_trace: true
});

dialog1.open()
```

### A dynamic Dialog

In most cases, you will rather produce the dialog content dynamically.

To obtain that, just add an "url" option to the Djalog constructor,
and it will be automatically used to obtain the Dialog content
from the server via an Ajax call.

```javascript
dialog1 = new Dialog({
    ...
    url: "/some-content/",
    ...
```

## Modal and/or standalone pages

Sometimes it is convenient to reuse the very same single view to render either a
modal dialog, or a standalone HTML page.

This can be easily accomplished providing:

- an "inner" template which renders the content
- an "outer" container template which renders the full page, then includes the "inner" template
- in the view, detect the call context and render one or another

```python

def simple_content2(request):

    try:
        is_ajax_request = request.accepts("application/json")
    except AttributeError as e:
        # Django < 4.0
        is_ajax_request = request.is_ajax()

    # Either render only the modal content, or a full standalone page
    if is_ajax_request:
        template_name = 'frontend/includes/simple_content2_inner.html'
    else:
        template_name = 'frontend/includes/simple_content2.html'

    return render(request, template_name, {
    })
```

here, the "inner" template provides the content:

```html
<div class="row">
    <div class="col-sm-4">
        {% lorem 1 p random %}
    </div>
    <div class="col-sm-4">
        {% lorem 1 p random %}
    </div>
    <div class="col-sm-4">
        {% lorem 1 p random %}
    </div>
</div>
```

while the "outer" one renders the full page:

```html
{% extends "base.html" %}
{% load static staticfiles i18n %}

{% block content %}
{% include 'frontend/includes/simple_content2_inner.html' %}
{% endblock content %}
```

## Dialog methods

| Method                          | Effects                   |
| --------------------------------|---------------------------|
| constructor(options={})         | See `options` list below  |
| open(event=null, show=true)     | Open the dialog [1]       |
| close()                         | Close (hide) the dialog   |
| show()                          | Make the dialog visible   |

[1] open():

1. the dialog body will be immediately loaded with static content provided by option "html"
2. then the dialog is shown (unless the "show" parameter is false)
3. finally, dynamic content will be loaded from remote address provided by option "url" (if supplied)
4. if successfull, a 'loaded.dialog' event is fired; you can use it to perform any action required after loading



## Dialog options

| Option                          | Default value              | Notes                                                          |
|---------------------------------|----------------------------|----------------------------------------------------------------|
| dialog_selector                 | '#dialog_generic'          | The selector for HTML dialog template                          |
| open_event                      | null                       | Used to "remember" the event which triggered Dialog opening    |
| html                            | ''                         | Static content to display in dialog body                       |
| url                             | ''                         | Optional url to retrieve dialog content via Ajax               |
| width                           | null                       |                                                                |
| min_width                       | null                       |                                                                |
| max_width                       | null                       |                                                                |
| height                          | null                       |                                                                |
| min_height                      | null                       |                                                                |
| max_height                      | null                       |                                                                |
| button_save_label               | 'Save'                     |                                                                |
| button_save_initially_hidden    | false                      | Will be shown after form rendering                             |
| button_close_label              | 'Cancel'                   |                                                                |
| title                           | ''                         |                                                                |
| subtitle                        | ''                         |                                                                |
| footer_text                     | ''                         |                                                                |
| enable_trace                    | false                      | show notifications in debug console                            |
| callback                        | null                       | a callback to receive events                                   |
| autofocus_first_visible_input   | true                       |                                                                |

Unspecified options will be retrieved from corresponding HTML attributes on the
element which fires the dialog opening;

for example:

```html
<a href="{% url 'frontend:whatever' object.id %}"
   data-title="My title"
   data-subtitle="My Subtitle"
   onclick="new Dialog().open(event); return false;">
        Open
</a>
```

| Option                        | HTML attribute           |
|-------------------------------|--------------------------|
| url                           | href                     |
| html                          | data-html                |
| width                         | data-width               |
| min_width                     | data-min-width           |
| max_width                     | data-max-width           |
| height                        | data-height              |
| min_height                    | data-min-height          |
| max_height                    | data-max-height          |
| button_save_label             | data-button-save-label   |
| button_close_label            | data-button-close-label  |
| title                         | data-title               |
| subtitle                      | data-subtitle            |
| footer_text                   | data-footer-text         |


## Dialog notifications

| event_name                    | params                            |
|-------------------------------|-----------------------------------|
| created                       | options                           |
| closed                        |                                   |
| initialized                   |                                   |
| shown                         |                                   |
| loading                       | url                               |
| loaded                        | url, data                         |
| loading_failed                | jqXHR, textStatus, errorThrown    |
| open                          |                                   |
| submitting                    | method, url, data                 |
| submission_failure            | method, url, data                 |
| submitted                     | method, url, data                 |


During it's lifetime, the Dialog will notify all interesting events to the caller,
provided he supplies a suitable callback in the contructor:

    `self.options.callback(event_name, dialog, params)`

Example:

```javascript
dialog1 = new Dialog({
    ...
    callback: function(event_name, dialog, params) {
        console.log('event_name: %o, dialog: %o, params: %o', event_name, dialog, params);
    }
});
```

Result:

```
    event_name: "created", dialog: Dialog {options: {…}, element: …}, params: {options: {…}}
    event_name: "initialized", dialog: Dialog {options: {…}, element: …}, params: {}
    event_name: "open", dialog: Dialog {options: {…}, element: …}, params: {}
    event_name: "shown", dialog: Dialog {options: {…}, element: …}, params: {}
    event_name: "loading", dialog: Dialog {options: {…}, element: …}, params: {url: "/admin_ex/popup/"}
    event_name: "loaded", dialog: Dialog {options: {…}, element: …}, params: {url: "/admin_ex/popup/"}
    event_name: "submitting", dialog: Dialog {options: {…}, element: …}, params: {method: "post", url: "/admin_ex/popup/", data: "text=&number=aaa"}
    event_name: "submitted", dialog: Dialog {options: {…}, element: …}, params: {method: "post", url: "/admin_ex/popup/", data: "text=111&number=111"}
    event_name: "closed", dialog: Dialog {options: {…}, element: …}, params: {}
```

You can also trace all events in the console setting the boolean flag `enable_trace`.


# Resources

- [How to implement modal popup django forms with bootstrap](https://www.abidibo.net/blog/2014/05/26/how-implement-modal-popup-django-forms-bootstrap/)

- [Custom Modal Dialogs](https://htmx.org/examples/modal-custom/)
- [Modal forms with Django+HTMX](https://blog.benoitblanchon.fr/django-htmx-modal-form/)
- [Modal forms with Django+HTMX](https://blog.benoitblanchon.fr/django-htmx-modal-form/)
- [Modal forms with Django+HTMX (video)](https://www.youtube.com/watch?v=3dyQigrEj8A&ab_channel=BenoitBlanchon)
- [DiangoTricks: How to Handle Django Forms within Modal Dialogs](https://djangotricks.blogspot.com/2022/10/how-to-handle-django-forms-within-modal-dialogs.html)

