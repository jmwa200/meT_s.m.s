from rest_framework import serializers
from .models import User, Student, Teacher, Class, Role

class UserSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role_profile.name', read_only=True, allow_null=True)
    role_profile_id = serializers.PrimaryKeyRelatedField(source='role_profile', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'role_name', 'role_profile_id']

class RegisterSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role_name']

    def create(self, validated_data):
        role_name = validated_data.pop('role_name')
        user_password = validated_data.pop('password') # Keep password handling

        try:
            role_obj = Role.objects.get(name__iexact=role_name)
        except Role.DoesNotExist:
            raise serializers.ValidationError(f"Role '{role_name}' does not exist.")

        user = User(**validated_data)
        user.set_password(user_password) # Hash the password
        user.role_profile = role_obj

        # Optional: Map role_name to the integer User.role if still needed
        # This assumes User.Roles enum (ADMIN=1, TEACHER=2, STUDENT=3) matches Role names
        if role_name.lower() == 'admin':
            user.role = User.Roles.ADMIN
        elif role_name.lower() == 'teacher':
            user.role = User.Roles.TEACHER
        elif role_name.lower() == 'student':
            user.role = User.Roles.STUDENT
        else:
            # Default or handle error if role_name is unexpected for the integer field
            user.role = User.Roles.STUDENT # Example default

        user.save()
        return user

class StudentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    # Assuming User model has first_name and last_name for get_full_name()
    # If not, this might need adjustment or User model update.
    # For now, we'll include it as per the plan.
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Student
        # 'id' here will refer to user_id because user is the primary_key for Student
        fields = ['id', 'username', 'full_name', 'email']

class TeacherSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Teacher
        # 'id' here will refer to user_id because user is the primary_key for Teacher
        fields = ['id', 'username', 'full_name', 'email']

class ClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = ['id', 'name', 'teacher']


