from rest_framework import permissions
from .models import User, Permission, Role

class HasPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        required_permission = getattr(view, 'required_permission', None)
        if required_permission is None:
            return True
        if not request.user.is_authenticated or not request.user.role_profile:
            return False
        user_permissions = request.user.role_profile.permissions.values_list('code', flat=True)
        return required_permission in user_permissions

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'role') and request.user.role == User.Roles.ADMIN

class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'role') and request.user.role == User.Roles.TEACHER

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'role') and request.user.role == User.Roles.STUDENT


