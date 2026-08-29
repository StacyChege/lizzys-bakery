from django import forms
from django.contrib import admin

from .models import ClockRecord, DailyStock, SaleEntry, StaffMember


class StaffMemberForm(forms.ModelForm):
    pin = forms.CharField(
        max_length=10,
        required=False,
        widget=forms.TextInput(attrs={'autocomplete': 'off'}),
        help_text='Enter a 4-6 digit PIN to set or change it. Leave blank to keep the current PIN.',
    )

    class Meta:
        model = StaffMember
        fields = ['name', 'is_active']

    def clean(self):
        cleaned = super().clean()
        # A brand-new staff member has no PIN yet — require one on creation,
        # but let edits (e.g. renaming) skip it to leave the PIN unchanged.
        if self.instance.pk is None and not cleaned.get('pin'):
            raise forms.ValidationError('A PIN is required when creating a new staff member.')
        return cleaned

    def save(self, commit=True):
        instance = super().save(commit=False)
        pin = self.cleaned_data.get('pin')
        if pin:
            instance.set_pin(pin)
        if commit:
            instance.save()
        return instance


@admin.register(StaffMember)
class StaffMemberAdmin(admin.ModelAdmin):
    form = StaffMemberForm
    list_display = ['name', 'is_active', 'created_at']


@admin.register(ClockRecord)
class ClockRecordAdmin(admin.ModelAdmin):
    list_display = ['staff', 'clock_in', 'clock_out']
    list_filter = ['staff']
    readonly_fields = ['token', 'clock_in']


@admin.register(DailyStock)
class DailyStockAdmin(admin.ModelAdmin):
    list_display = ['product', 'date', 'quantity_stocked']
    list_filter = ['date']


@admin.register(SaleEntry)
class SaleEntryAdmin(admin.ModelAdmin):
    list_display = ['product', 'quantity', 'unit_price', 'shift', 'created_at']
    list_filter = ['created_at']
    readonly_fields = ['unit_price', 'created_at']
