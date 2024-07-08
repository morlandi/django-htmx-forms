
# django-htmx-forms

Adding editing capabilities to the frontend in a modern user interface requires the usage of modal forms.

django-htmx-forms is a package which provides tools for working with modal popups, form submission and validation via ajax in a Django project.

I also took the chance to take a closer look at [HTMX](https://htmx.org/), a JavaScript framework that handles Ajax communication based on custom HTML attributes.


django-htmx-forms does not require jQuery, nor Bootstrap or other frameworks;
HTMX is mostly optional.

Based on my previous somehow incomplete researches as documented here:

- [Editing Django models in the front end](https://editing-django-models-in-the-frontend.readthedocs.io/en/latest/)
- [Django Frontend Forms](https://github.com/morlandi/django-frontend-forms)

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

2) attach the template to a `HtmxForms.Dialog()` javascript object to control it's behaviour
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

When instantiating the javascript `HtmxForms.Dialog` object, you can select an alternative
template instead, providing a suitable value for `djalog_selector`:

```javascript
document.addEventListener("DOMContentLoaded", function() {

    dialog1 = new HtmxForms.Dialog({
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
- adding class ".draggable" makes the Dialog draggable - this is optional, ~~and requires jquery-ui~~ **TODO: NEED TO RESTORE THIS WITH VANILLA JS**


## Opening a Dialog

### A static Dialog

The layout of the Dialog is fully determined by the referenced HTML template:
either the default "#dialog_generic" of a custom one.

You can further customize the rendering with CSS; the default styles are provided
by `htmx_forms/static/htmx_forms.css`

```javascript
dialog1 = new HtmxForms.Dialog({
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
dialog1 = new HtmxForms.Dialog({
    ...
    url: "/some-remote-endpoint/",
    ...
```

## Modal and/or standalone pages

Sometimes it is convenient to reuse the same view to render either a
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

here, the "inner" template provides the content; for example:

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
3. then, dynamic content will be loaded from remote address provided by option "url" (if supplied)
4. if successfull, a 'loaded.dialog' event is fired; you can use it to perform any action required after loading



## Dialog options

| Option                          | Default value              | Notes                                                          |
|---------------------------------|----------------------------|----------------------------------------------------------------|
| dialog_selector                 | '#dialog_generic'          | The selector for HTML dialog template                          |
| open_event                      | null                       | Used to "remember" the event which triggered Dialog opening and the associated target    |
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

Unspecified options will be retrieved from corresponding HTML attributes from the
element which fires the dialog opening;

for example:

```html
<a href="{% url 'frontend:whatever' object.id %}"
   data-title="My title"
   data-subtitle="My Subtitle"
   onclick="new HtmxForms.Dialog().open(event); return false;">
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
dialog1 = new HtmxForms.Dialog({
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


# Forms submission

We've successfully injected data retrieved from the server in our modals,
but did not really interact with the user yet.

When the modal body contains a form, things start to become interesting and tricky.

## Handling form submission

When a form submission is involved, the modal life cycle has to be modified as follows:

- First and foremost, we need to **prevent the form from performing its default submit**.

  If not, after submission we'll be redirected to the form action, outside the context
  of the dialog.

  We'll do this binding to the form's submit event, where we'll serialize the form's
  content and sent it to the view for validation via an Ajax call.

- Then, upon a successufull response from the server, **we'll need to further investigate
  the HTML received**:

    + if it contains any field error, the form did not validate successfully,
      so we update the modal body with the new form and its errors

    + otherwise, user interaction is completed, and we can finally close the modal

`django-htmx-forms` already takes care of all these needs automatically,
when a form is detected in the content downloaded from the server.

It keeps refreshing the modal after each submission while validation errors
are detected, and dismisses it only when the form validation finally succeedes.

## Implementation

If you're curious, here below is a detailed explanation of how all this is achieved.

Form detection happens after loading the remote content from the server:

```javascript
... fetch ...

    if (response.ok) {
        ...
        let form = self.element.querySelector('.dialog-content .dialog-body form');
        if (form !== null) {
            // Manage form
            self._form_ajax_submit();
        }
    }
```


In this case, the code triggers a call to the helper method `_form_ajax_submit()`,
which is the real workhorse.

I developed it adapting the inspiring ideas presented in the brilliant article: [Use Django's Class-Based Views with Bootstrap Modals](https://dmorgan.info/posts/django-views-bootstrap-modals/)

The full code can found in the source file `htmx_forms.js`;
here below I will briefly summarize a simplified form of the most significant steps.

We start by taking care of the submit button embedded in the form.
While it's useful and necessary for the rendering of the form in a standalone page, it's
rather disturbing in the modal dialog.

So we look for it in the element conventionally identified by the class `form-submit-row`,
and if found we will hide and replace it with the "Save" button from the modal footer.

```javascript
// use footer save button, if available
let btn_save = footer.querySelector('.btn-save');
if (self.options.button_save_label !== null && btn_save) {

    let submit_row = form.querySelector('.form-submit-row');
    if (submit_row) {
        submit_row.style.display = 'none';
    }
    self._off(btn_save);
    btn_save = footer.querySelector('.btn-save');

    btn_save.addEventListener('click', function(event) {
        form.requestSubmit();
    });

    btn_save.style.display = 'block';
}
```

Then, we proceed by hijacking the form submission:

```javascript
// bind to the form’s submit event
form.addEventListener('submit', function(event) {

    // prevent the form from performing its default submit action
    event.preventDefault();

    // serialize the form’s content and send via an AJAX call
    // using the form’s defined method and action
    let url = form.getAttribute('action') || self.options.url;
    let method = form.getAttribute('method') || 'post';
    let data = new FormData(form);

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
```

Finally, we need to detect any form errors after submission, and either
repeat the whole process or close the dialog:

```javascript
...
if (form.querySelectorAll('.has-error').length > 0 || form.querySelectorAll('.errorlist').length > 0) {
    self._form_ajax_submit(true);
} else {
    // otherwise, we've done and can close the modal
    self.close();
}
```

One last detail: during content loading, we add a "loading" class to the dialog header,
to make a spinner icon visible until we're ready to either update or close the modal.

## Giving a feedback after successful form submission

Sometimes, you might want to notify the user after successful form submission.

To obtain this, all you have to do, after the form has been validated and saved,
is to return an HTML fragment with no forms in it; in this case:

- the popup will not close
- the "save" button will be hidden

thus giving to the user a chance to read your feedback.

### Example

In the following example, a form is rendered is a modal and later submitted;
form validation will happen as described above.

When the form validates, the user receives a feedback and the modal can be dismissed.

Note that the whole life cycle of the modal is fully controlled by the server.

```html
<a href="/form_submission_example/" onclick="dialog1.open(event); return false;">Form submission and validation ...</a>

<script>
    dialog1 = new HtmxForms.Dialog({
        dialog_selector: '#dialog_generic',
        html: '<h1>Loading ...</h1>',
        width: '400px',
        min_height: '200px',
        title: '<i class="fa fa-calculator"></i> A numeric value is required ...',
        button_save_initially_hidden: true,
        enable_trace: true
    });
</script>
```

or, equivalently:

```html
<a href="/form_submission_example/"
   onclick="new HtmxForms.Dialog().open(event); return false;"
   data-html="<h1>Loading ...</h1>"
   data-width="400px"
   data-min-height="200px"
   data-title="<i class='fa fa-calculator'></i> A numeric value is required ..."
   data-button-save-initially-hidden="true"
   data-enable-trace="true"
   >
    Form submission and validation ...
</a>
```

where the url "/form_submission_example/" points to the following view:

```python

def form_submission_example(request):
    if request.method == 'POST':
        form = SimpleForm(data=request.POST)
        if form.is_valid():
            form.save()
            return HttpResponse("<h1>Great !</h1> Your form has been validated")
    else:
        form = SimpleForm()

    return render(request, template_name, {
        'form': form,
    })



class SimpleForm(forms.Form):
    value = forms.IntegerField(required=True, label='value', help_text='Enter a value between 1 and 10')

    def save(self):
        return True

    def clean_value(self):
        value = self.cleaned_data['value']
        if value is not None:
            if value < 1 or value > 10:
                raise forms.ValidationError('This value is not accepteble')
        return value
```

In the following variation, the same view can be used to render and validate the
form both in a modal or in a standalone page:

```python
def form_submission_example(request):
    is_ajax_request = request.accepts("application/json")

    # Either render only the modal content, or a full standalone page
    if is_ajax_request:
        template_name = 'htmx_forms/generic_form_inner.html'
    else:
        template_name = 'htmx_forms/generic_form.html'

    if request.method == 'POST':
        form = SimpleForm(data=request.POST)
        if form.is_valid():
            form.save()
            if not is_ajax_request:
                messages.info(request, "Form has been validated")
            else:
                return HttpResponse("<h1>Great !</h1> Your form has been validated")
    else:
        form = SimpleForm()

    return render(request, template_name, {
        'form': form,
    })
```

# HTMX

**The solutions discussed so far do not require HTMX**.

This is nice, since in some contexts it's convinient to avoid any external dependencies.

Having said this, we will now investigate how HTML can help us in obtaining
the same results writing less javascript.


*TODO ...*



# Resources

- [Use Django's Class-Based Views with Bootstrap Modals](https://dmorgan.info/posts/django-views-bootstrap-modals/)
- [How to implement modal popup django forms with bootstrap](https://www.abidibo.net/blog/2014/05/26/how-implement-modal-popup-django-forms-bootstrap/)
- [Custom Modal Dialogs](https://htmx.org/examples/modal-custom/)
- [Modal forms with Django+HTMX](https://blog.benoitblanchon.fr/django-htmx-modal-form/)
- [Modal forms with Django+HTMX (video)](https://www.youtube.com/watch?v=3dyQigrEj8A&ab_channel=BenoitBlanchon)
- [DiangoTricks: How to Handle Django Forms within Modal Dialogs](https://djangotricks.blogspot.com/2022/10/how-to-handle-django-forms-within-modal-dialogs.html)
