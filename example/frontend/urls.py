from django.shortcuts import redirect
from django.urls import path
from django.views.generic.base import TemplateView

from . import views

app_name = "frontend"

urlpatterns = [
    path('', views.index, name="index"),
    path('modal_forms_with_django_and_htmx/', views.modal_forms_with_django_and_htmx, name="modal_forms_with_django_and_htmx"),
    path('add_user/', views.add_user, name="add_user"),
    path('user_list/', views.user_list, name="user_list"),
    path('popup/', views.popup, name="popup"),
    path('form_submission_example/', views.form_submission_example, name="form_submission_example"),

    path('lazy-loading/', views.lazy_loading, name="lazy_loading"),
    path('graph/', views.graph, name="graph"),
]
