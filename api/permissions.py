from rest_framework import permissions
from .models import User

class HasPermission(permissions.BasePermission):
    """
    Custom permission to check if user has specific permission code.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        required_permission = getattr(view, 'required_permission', None)
        if required_permission is None:
            return True
            
        # Admin users have all permissions
        if request.user.role == User.Roles.ADMIN:
            return True
            
        # Check if user's role has the required permission
        try:
            user_permissions = request.user.role.permissions.values_list('code', flat=True)
            return required_permission in user_permissions
        except AttributeError:
            return False

class IsAdmin(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role == User.Roles.ADMIN
        )

class IsTeacher(permissions.BasePermission):
    """
    Allows access only to teacher users.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role == User.Roles.TEACHER
        )

class IsStudent(permissions.BasePermission):
    """
    Allows access only to student users.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role == User.Roles.STUDENT
        )

class IsTeacherOrAdmin(permissions.BasePermission):
    """
    Allows access to teachers and admins.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role in [User.Roles.TEACHER, User.Roles.ADMIN]
        )

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    Assumes the model instance has an `owner` attribute.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Instance must have an attribute named `owner`.
        return obj.owner == request.user

class IsStudentOwner(permissions.BasePermission):
    """
    Allows students to access only their own data.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role == User.Roles.ADMIN:
            return True
        
        if request.user.role == User.Roles.STUDENT:
            # Check if the object belongs to the student
            if hasattr(obj, 'student'):
                return obj.student.user == request.user
            elif hasattr(obj, 'user'):
                return obj.user == request.user
        
        return False