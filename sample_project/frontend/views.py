from django.shortcuts import render


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
