import time
from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.urls import reverse
from .forms import UserForm
from .forms import PopupForm
from .forms import SimpleForm


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


def popup(request):

    time.sleep(0.1)

    try:
        #is_ajax_request = request.accepts("application/json")
        is_ajax_request = request.headers.get('x-requested-with') == 'XMLHttpRequest'
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
    # time.sleep(1)
    #is_ajax_request = request.accepts("application/json")
    is_ajax_request = request.headers.get('x-requested-with') == 'XMLHttpRequest'

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


def graph(request):
    time.sleep(2.0)
    return HttpResponse("<img alt='Tokyo Climate' src='/static/images/tokyo.png'>")


def lazy_loading(request):
    is_ajax_request = request.headers.get('x-requested-with') == 'XMLHttpRequest'
    if is_ajax_request:
        template_name = "frontend/pages/lazy_loading_inner.html"
    else:
        template_name = "frontend/pages/lazy_loading.html"
    return render(request, template_name, {
    })
