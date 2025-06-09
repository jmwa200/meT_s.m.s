from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Roles(models.IntegerChoices):
        ADMIN = 1, 'Admin'
        TEACHER = 2, 'Teacher'
        STUDENT = 3, 'Student'

    role = models.IntegerField(choices=Roles.choices, default=Roles.STUDENT)
    role_profile = models.ForeignKey('Role', on_delete=models.SET_NULL, null=True, blank=True, related_name='users')

class Permission(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=255, unique=True)

class Role(models.Model):
    name = models.CharField(max_length=255)
    permissions = models.ManyToManyField(Permission)

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile', primary_key=True)

class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile', primary_key=True)

class Class(models.Model):
    name = models.CharField(max_length=255)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)


