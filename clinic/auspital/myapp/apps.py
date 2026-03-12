from django.apps import AppConfig


class MyappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'myapp'

    def ready(self):
        # Bootstrap main admin account from settings/env.
        from django.conf import settings
        from django.db.models.signals import post_migrate

        def ensure_main_admin(**kwargs):
            from django.contrib.auth.models import User
            from django.db import transaction
            from .models import Administration

            username = getattr(settings, "MAIN_ADMIN_USERNAME", None)
            password = getattr(settings, "MAIN_ADMIN_PASSWORD", None)
            email = getattr(settings, "MAIN_ADMIN_EMAIL", "")
            phone = getattr(settings, "MAIN_ADMIN_PHONE", "")
            code = getattr(settings, "MAIN_ADMIN_CODE", "")

            if not username or not password:
                return

            with transaction.atomic():
                user, created = User.objects.get_or_create(
                    username=username,
                    defaults={"email": email, "is_active": True},
                )

                # Keep credentials aligned with settings (dev-friendly).
                if email and user.email != email:
                    user.email = email
                user.is_active = True
                user.is_staff = True
                user.set_password(password)
                user.save()

                admin_profile, _ = Administration.objects.get_or_create(user=user, defaults={"numero_tel": phone})
                if phone and admin_profile.numero_tel != phone:
                    admin_profile.numero_tel = phone
                admin_profile.is_main_admin = True
                admin_profile.secret_code = code or admin_profile.secret_code or "1234"
                admin_profile.save()

        post_migrate.connect(ensure_main_admin, sender=self, dispatch_uid="myapp.ensure_main_admin")
