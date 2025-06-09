from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Roles(models.IntegerChoices):
        ADMIN = 1, 'Admin'
        TEACHER = 2, 'Teacher'
        STUDENT = 3, 'Student'

    role = models.IntegerField(choices=Roles.choices, default=Roles.STUDENT)

class Permission(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=255, unique=True)

class Role(models.Model):
    name = models.CharField(max_length=255)
    permissions = models.ManyToManyField(Permission)

class Student(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)

class Teacher(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)

class Class(models.Model):
    name = models.CharField(max_length=255)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)


