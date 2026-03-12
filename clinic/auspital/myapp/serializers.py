from rest_framework import serializers
from django.contrib.auth.models import User
from .models import ConsultationTemporaire, ConsultationPaye, Doctor, Secreteur, Administration

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }

class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password', 'email']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    username = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)
    class Meta:
        model = Doctor
        fields = ['id', 'user', 'username', 'password', 'email', 'specialite', 'date_disponible', 'numero_tel', 'photo']
        read_only_fields = ['user']
    

    def create(self, validated_data):
        username = validated_data.pop('username', None)
        password = validated_data.pop('password', None)
        email = validated_data.pop('email', None)

        if username and password:
            user_data = {
                'username': username,
                'password': password,
                'email' : email
            }
            user = User.objects.create_user(**user_data)
            user.is_active = True
            user.save()
        else:
            user = None
        doctor = Doctor.objects.create(user=user, **validated_data)
        return doctor
    
    def update(self, instance, validated_data):
        username = validated_data.pop('username', None)
        email = validated_data.pop('email', None)
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            instance.save()

        if instance.user:
           user = instance.user
           if username is not None:
              user.username = username
           if email is not None:
               user.email = email
           if password:
              user.set_password(password)
           user.save()
        else:
          if username and password:
            user = User.objects.create_user(username=username, password=password, email=email)
            instance.user = user
            instance.save()
          else:
            raise serializers.ValidationError("User required")
        return instance
    
class SecreteurSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    class Meta:
        model = Secreteur
        fields = ['id', 'user', 'username', 'password', 'email', 'numero_tel']
    
    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        email = validated_data.pop('email')

        user = User.objects.create_user(
            username=username,
            password=password
        )
        user.is_active = True
        user.save()
        
        secretaire = Secreteur.objects.create(user=user, **validated_data)
        return secretaire

    def update(self, instance, validated_data):
        username = validated_data.pop('username', None)
        email = validated_data.pop('email', None)
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            instance.save()

        if instance.user:
           user = instance.user
           if username is not None:
              user.username = username
           if email is not None:
               user.email = email
           if password:
              user.set_password(password)
           user.save()
        else:
          if username and password:
            user = User.objects.create_user(username=username, password=password, email=email)
            instance.user = user
            instance.save()
          else:
            raise serializers.ValidationError("User required")
        return instance

class AdministrationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    email = serializers.CharField(write_only=True)
    
    class Meta:
        model = Administration
        fields = ['id', 'user', 'username', 'password', 'email', 'numero_tel']
    
    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        email = validated_data.pop('email')

        # Empêcher la création avec un username déjà pris
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({"username": "Ce nom d’utilisateur existe déjà."})

        user = User.objects.create_user(username=username, password=password, email=email)
        user.is_active = True
        user.save()
        
        admin_profile = Administration.objects.create(user=user, **validated_data)
        return admin_profile

    def update(self, instance, validated_data):
        username = validated_data.pop('username', None)
        email = validated_data.pop('email', None)
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            instance.save()

        if instance.user:
           user = instance.user
           if username is not None:
              user.username = username
           if email is not None:
               user.email = email
           if password:
              user.set_password(password)
           user.save()
        else:
          if username and password:
            user = User.objects.create_user(username=username, password=password, email=email)
            instance.user = user
            instance.save()
          else:
            raise serializers.ValidationError("User required")
        return instance
    
class ConsultationTemporaireSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.user.get_full_name', read_only=True)
    doctor_specialite = serializers.CharField(source='doctor.specialite', read_only=True)
    doctor_photo = serializers.ImageField(source='doctor.photo', read_only=True)
    class Meta:
        model = ConsultationTemporaire
        fields = ['id', 'doctor', 'doctor_name', 'doctor_specialite', 'doctor_photo',
                  'date_fin', 'montant', 'n_places']


class ConsultationPayeSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.user.get_full_name', read_only=True)

    class Meta:
        model = ConsultationPaye
        fields = ['id', 'nom_complet', 'numero_tel', 'date', 'NNI',
                 'doctor', 'doctor_name', 'specialite', 'diagnostic', 'temporaire_id', 'numero_reservation']
        extra_kwargs = {
            'diagnostic': {'required': False},
            'temporaire_id':{'write_only':True, 'required':True},
            'numero_reservation': {'read_only': False},
            'doctor': {'read_only': True},
            'date': {'read_only': False},
            'NNI': {'required': True},
            'specialite': {'required':False}
        }
    


class ConsultationTemporaireListSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()
    doctor_specialite = serializers.CharField(source="doctor.specialite", read_only=True)
    doctor_photo = serializers.ImageField(source='doctor.photo', read_only=True)

    class Meta:
        model = ConsultationTemporaire
        fields = ["id", "doctor", "doctor_name", "doctor_specialite", "doctor_photo", "date_fin", "montant", "n_places"]

    def get_doctor_name(self, obj):
        return obj.doctor.user.username if obj.doctor.user else obj.doctor.id


class OpenWindowResponseSerializer(serializers.Serializer):
    consultation_id = serializers.IntegerField()
    window_start = serializers.DateTimeField()
    window_end = serializers.DateTimeField()
    receiver = serializers.CharField()
    montant = serializers.IntegerField()
    window_minutes = serializers.IntegerField()


class PayRequestSerializer(serializers.Serializer):
    nomComplet_patient = serializers.CharField(max_length=200)
    numero_tel_patient = serializers.CharField(max_length=20)
    photo_nni = serializers.ImageField()
    capture_paiement = serializers.ImageField()


class PayResponseSerializer(serializers.Serializer):
    paiement_id = serializers.IntegerField()
    places_restantes = serializers.IntegerField()
    message = serializers.CharField()


class SecretaryReservationSerializer(serializers.Serializer):
    nomComplet_patient = serializers.CharField(max_length=200)
    numero_tel_patient = serializers.CharField(max_length=20)
    NNI = serializers.CharField(max_length=20)