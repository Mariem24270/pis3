from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import Administration, Secreteur, Doctor, ConsultationTemporaire, ConsultationPaye

class AdministrationInline(admin.StackedInline):
    model = Administration
    can_delete = False
    verbose_name_plural = 'Administration Profile'

class SecreteurInline(admin.StackedInline):
    model = Secreteur
    can_delete = False
    verbose_name_plural = 'Secreteur Profile'

class DoctorInline(admin.StackedInline):
    model = Doctor
    can_delete = False
    verbose_name_plural = 'Doctor Profile'

class CustomUserAdmin(UserAdmin):
    inlines = [AdministrationInline, SecreteurInline, DoctorInline]

    def get_inline_instances(self, request, obj=None):
        if not obj:
            return []
        return super().get_inline_instances(request, obj)

admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

@admin.register(ConsultationTemporaire)
class ConsultationTemporaireAdmin(admin.ModelAdmin):
    list_display = ['id', 'doctor', 'date_fin', 'montant', 'n_places']
    list_filter = ['doctor']
    search_fields = ['doctor__user__username', 'doctor__specialite']

@admin.register(ConsultationPaye)
class ConsultationPayeAdmin(admin.ModelAdmin):
    list_display = ['id', 'nom_complet', 'doctor', 'date', 'specialite', 'diagnostic']
    list_filter = ['doctor', 'date']
    search_fields = ['nom_complet', 'numero_tel', 'doctor__user__username']
