from django.http import HttpResponse


def htmx_click_test(request):
    text = "Success ! The request was %smade with htmx" % ("" if request.htmx else "NOT ")
    return HttpResponse(text)

