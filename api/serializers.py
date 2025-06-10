from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import (
    User, Student, Teacher, Class, Subject, Attendance, 
    Grade, Assignment, Submission, Permission, Role
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 
                 'phone_number', 'date_of_birth', 'address', 'profile_picture']
        read_only_fields = ['id']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 
                 'last_name', 'role', 'phone_number', 'date_of_birth']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Password fields didn't match.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'description', 'credits']

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Student
        fields = ['id', 'user', 'user_id', 'student_id', 'enrollment_date', 
                 'grade_level', 'parent_name', 'parent_phone', 'parent_email']

class TeacherSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    subjects = SubjectSerializer(many=True, read_only=True)
    subject_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = Teacher
        fields = ['id', 'user', 'user_id', 'employee_id', 'hire_date', 
                 'department', 'subjects', 'subject_ids', 'qualification', 'experience_years']

    def create(self, validated_data):
        subject_ids = validated_data.pop('subject_ids', [])
        teacher = Teacher.objects.create(**validated_data)
        if subject_ids:
            teacher.subjects.set(subject_ids)
        return teacher

class ClassSerializer(serializers.ModelSerializer):
    teacher = TeacherSerializer(read_only=True)
    teacher_id = serializers.IntegerField(write_only=True)
    subject = SubjectSerializer(read_only=True)
    subject_id = serializers.IntegerField(write_only=True)
    students = StudentSerializer(many=True, read_only=True)
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = Class
        fields = ['id', 'name', 'teacher', 'teacher_id', 'subject', 'subject_id', 
                 'students', 'room_number', 'schedule_time', 'schedule_days', 
                 'max_capacity', 'student_count']

    def get_student_count(self, obj):
        return obj.students.count()

class AttendanceSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    student_id = serializers.IntegerField(write_only=True)
    class_session = ClassSerializer(read_only=True)
    class_id = serializers.IntegerField(write_only=True)
    marked_by = UserSerializer(read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'student', 'student_id', 'class_session', 'class_id', 
                 'date', 'status', 'notes', 'marked_by', 'created_at']

class GradeSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    student_id = serializers.IntegerField(write_only=True)
    subject = SubjectSerializer(read_only=True)
    subject_id = serializers.IntegerField(write_only=True)
    teacher = TeacherSerializer(read_only=True)
    teacher_id = serializers.IntegerField(write_only=True)
    percentage = serializers.SerializerMethodField()

    class Meta:
        model = Grade
        fields = ['id', 'student', 'student_id', 'subject', 'subject_id', 
                 'teacher', 'teacher_id', 'assignment_name', 'grade', 'max_grade', 
                 'percentage', 'date_assigned', 'date_submitted', 'comments']

    def get_percentage(self, obj):
        if obj.max_grade > 0:
            return round((obj.grade / obj.max_grade) * 100, 2)
        return 0

class AssignmentSerializer(serializers.ModelSerializer):
    class_session = ClassSerializer(read_only=True)
    class_id = serializers.IntegerField(write_only=True)
    teacher = TeacherSerializer(read_only=True)
    submission_count = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = ['id', 'title', 'description', 'class_session', 'class_id', 
                 'teacher', 'due_date', 'max_points', 'status', 'submission_count',
                 'created_at', 'updated_at']

    def get_submission_count(self, obj):
        return obj.submissions.count()

class SubmissionSerializer(serializers.ModelSerializer):
    assignment = AssignmentSerializer(read_only=True)
    assignment_id = serializers.IntegerField(write_only=True)
    student = StudentSerializer(read_only=True)
    student_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Submission
        fields = ['id', 'assignment', 'assignment_id', 'student', 'student_id', 
                 'content', 'file_attachment', 'submitted_at', 'is_late']

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'code', 'description']

class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'permissions', 'permission_ids']

    def create(self, validated_data):
        permission_ids = validated_data.pop('permission_ids', [])
        role = Role.objects.create(**validated_data)
        if permission_ids:
            role.permissions.set(permission_ids)
        return role