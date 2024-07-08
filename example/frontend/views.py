import time
from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.urls import reverse
from .forms import UserForm
from .forms import PopupForm


def index(request):
    return render(
        request,
        'frontend/index.html', {
        }
    )


def modal_forms_with_django_and_htmx(request) :
    return render(
        request,
        'frontend/modal_forms_with_django_and_htmx.html', {
        }
    )

def user_list(request):
    return render(
        request,
        'frontend/user_list.html', {
            'users': User.objects.all(),
        }
    )


def add_user(request):
    if request.method == "POST":
        form = UserForm(request.POST)
        if form.is_valid():
            form.save()
            return HttpResponse("ciao", status=204, headers={'HX-Trigger': 'userListChanged'})
    else:
        form = UserForm()
    return render(request, 'frontend/user_form.html', {
        'form': form,
    })


def basic_dialog(request) :
    return render(
        request,
        'frontend/basic_dialog.html', {
        }
    )


def popup(request):

    time.sleep(1)

    try:
        is_ajax_request = request.accepts("application/json")
    except AttributeError as e:
        # Django < 4.0
        is_ajax_request = request.is_ajax()

    # Either render only the modal content, or a full standalone page
    if is_ajax_request:
        template_name = 'htmx_forms/generic_form_inner.html'
    else:
        template_name = 'htmx_forms/generic_form.html'

    if request.method == 'POST':
        form = PopupForm(data=request.POST)
        if form.is_valid():
            form.save(request)
    else:
        form = PopupForm()

    return render(request, template_name, {
        'form': form,
        'action': reverse('frontend:popup'),
    })


def form_submission_example(request):
    #time.sleep(1)
    # Either render only the modal content, or a full standalone page
    is_ajax_request = request.accepts("application/json")
    if is_ajax_request:
        template_name = 'htmx_forms/generic_form_inner.html'
    else:
        template_name = 'htmx_forms/generic_form.html'
    return render(request, template_name, {
        # 'form': form,
        # 'action': reverse('frontend:popup'),
    })


# class SimpleForm(forms.Form):

#     value = forms.IntegerField(required=True, label='value', help_text='Enter a value between 1 and 10')

#     def save(self):
#         return True

#     def clean_value(self):
#         value = self.cleaned_data['value']
#         if value is not None:
#             if value < 1 or value > 10:
#                 raise forms.ValidationError('This value is not accepteble')
#         return value

# def form_validation_with_feedback(request):

#     simulate_network_latency()

#     if is_ajax(request):
#         template_name = 'dialogs/simple_form_inner.html'
#     else:
#         template_name = 'dialogs/simple_form.html'

#     if request.method == 'POST':
#         form = SimpleForm(data=request.POST)
#         if form.is_valid():
#             form.save()
#             if not is_ajax(request):
#                 messages.info(request, "Form has been validated")
#             else:
#                 return HttpResponse("<h1>Great !</h1> Your form has been validated")
#     else:
#         form = SimpleForm()

#     return render(request, template_name, {
#         'action': reverse('samples:form-validation-with-feedback'),
#         'form': form,
#     })

