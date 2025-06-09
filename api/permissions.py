from rest_framework import permissions
from .models import Permission

class HasPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        required_permission = getattr(view, 'required_permission', None)
        if required_permission is None:
            return True
        user_permissions = request.user.role.permissions.values_list('code', flat=True)
        return required_permission in user_permissions

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == User.Roles.ADMIN

class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == User.Roles.TEACHER

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == User.Roles.STUDENT


