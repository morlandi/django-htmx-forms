from django.shortcuts import redirect
from django.urls import path

from . import ajax

app_name = "backend"

urlpatterns = [
    path('htmx_click_test/', ajax.htmx_click_test, name='j-htmx_click_test'),
]
