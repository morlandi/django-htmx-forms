from django import forms
from django.contrib import messages
from django.contrib.auth.forms import UserCreationForm


class UserForm(UserCreationForm):
    pass


class PopupForm(forms.Form):
    text = forms.CharField(max_length=15, required=True, help_text="Required; enter a string")
    number = forms.CharField(max_length=10, required=False, help_text="Enter a numeric value")

    def clean_number(self):
        data = self.cleaned_data['number']
        if data:
            try:
                value = int(data)
            except:
                raise forms.ValidationError("Enter a numeric value")
        return data

    def save(self, request):
        messages.info(request, 'Form has been saved with data: "%s"' % str(self.cleaned_data))


