
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

    # Either render only the modal content, or a full standalone page
    if request.is_ajax():
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



# Resources

- [Custom Modal Dialogs](https://htmx.org/examples/modal-custom/)
- [Modal forms with Django+HTMX](https://blog.benoitblanchon.fr/django-htmx-modal-form/)

