from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User
from .forms import UserForm


def index(request):
    return render(
        request,
        'frontend/index.html', {
        }
    )


def vanilla_js_modal(request) :
    return render(
        request,
        'frontend/vanilla_js_modal.html', {
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
