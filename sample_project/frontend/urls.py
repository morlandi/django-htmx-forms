from django.shortcuts import redirect
from django.urls import path

from . import views

app_name = "frontend"

urlpatterns = [
    path('', views.index, name="index"),
    path('vanilla_js_modal/', views.vanilla_js_modal, name="vanilla_js_modal"),
]
