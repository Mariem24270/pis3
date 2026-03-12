from django.contrib.auth.models import User
from django.db import models

class Administration(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    numero_tel = models.CharField(max_length=20)  
    is_main_admin = models.BooleanField(default=False)
    secret_code = models.CharField(max_length=32, blank=True, default="")
    
    def __str__(self):
        return self.user.username

class Secreteur(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    numero_tel = models.CharField(max_length=20)  
    
    def __str__(self):
        return self.user.username

class Doctor(models.Model):
    id = models.CharField(max_length=50, primary_key=True) 
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    specialite = models.CharField(max_length=100)
    date_disponible = models.DateField()
    numero_tel = models.CharField(max_length=20) 
    photo = models.ImageField(upload_to='doctors/', null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} ({self.specialite})"

class ConsultationTemporaire(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='consultations_temporaires')
    date_fin = models.DateTimeField()
    montant = models.IntegerField()
    n_places = models.IntegerField(default=1)  
   
    def __str__(self):
        return f"Consultation {self.doctor.user.username} - {self.date_fin}"

class ConsultationPaye(models.Model):
    nom_complet = models.CharField(max_length=200)
    numero_tel = models.CharField(max_length=11)
    date = models.DateTimeField()
    NNI = models.CharField(max_length=10)
    temporaire_id = models.PositiveIntegerField(null=True, blank=True)
    numero_reservation = models.PositiveIntegerField(null=True, blank=True)
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, related_name='consultations_payees')
    specialite = models.CharField(max_length=100)
    diagnostic = models.CharField(max_length=3000)

    def __str__(self):
        return f"{self.nom_complet} - {self.date}"
        