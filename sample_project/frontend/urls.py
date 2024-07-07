from django.shortcuts import redirect
from django.urls import path

from . import views

app_name = "frontend"

urlpatterns = [
    path('', views.index, name="index"),
    path('vanilla_js_modal/', views.vanilla_js_modal, name="vanilla_js_modal"),
    path('modal_forms_with_django_and_htmx/', views.modal_forms_with_django_and_htmx, name="modal_forms_with_django_and_htmx"),
    path('add_user/', views.add_user, name="add_user"),
    path('user_list/', views.user_list, name="user_list"),
    path('basic_dialog/', views.basic_dialog, name="basic_dialog"),
]
