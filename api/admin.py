from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, Student, Teacher, Class, Subject, Attendance, 
    Grade, Assignment, Submission, Permission, Role
)

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_active')
    list_filter = ('role', 'is_active', 'is_staff', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('username',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('role', 'phone_number', 'date_of_birth', 'address', 'profile_picture')
        }),
    )

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'get_full_name', 'grade_level', 'enrollment_date')
    list_filter = ('grade_level', 'enrollment_date')
    search_fields = ('student_id', 'user__first_name', 'user__last_name', 'user__email')
    raw_id_fields = ('user',)
    
    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Full Name'

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'get_full_name', 'department', 'hire_date')
    list_filter = ('department', 'hire_date')
    search_fields = ('employee_id', 'user__first_name', 'user__last_name', 'department')
    raw_id_fields = ('user',)
    filter_horizontal = ('subjects',)
    
    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Full Name'

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'credits')
    search_fields = ('name', 'code')
    ordering = ('code',)

@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ('name', 'subject', 'teacher', 'room_number', 'student_count')
    list_filter = ('subject', 'teacher')
    search_fields = ('name', 'subject__name', 'teacher__user__first_name')
    raw_id_fields = ('teacher',)
    filter_horizontal = ('students',)
    
    def student_count(self, obj):
        return obj.students.count()
    student_count.short_description = 'Students'

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'class_session', 'date', 'status', 'marked_by')
    list_filter = ('status', 'date', 'class_session')
    search_fields = ('student__user__first_name', 'student__user__last_name')
    raw_id_fields = ('student', 'class_session', 'marked_by')
    date_hierarchy = 'date'

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject', 'assignment_name', 'grade', 'max_grade', 'percentage')
    list_filter = ('subject', 'date_assigned')
    search_fields = ('student__user__first_name', 'assignment_name')
    raw_id_fields = ('student', 'teacher')
    
    def percentage(self, obj):
        if obj.max_grade > 0:
            return f"{(obj.grade / obj.max_grade) * 100:.1f}%"
        return "0%"

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'class_session', 'teacher', 'due_date', 'status', 'submission_count')
    list_filter = ('status', 'due_date', 'class_session')
    search_fields = ('title', 'description')
    raw_id_fields = ('class_session', 'teacher')
    
    def submission_count(self, obj):
        return obj.submissions.count()
    submission_count.short_description = 'Submissions'

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('assignment', 'student', 'submitted_at', 'is_late')
    list_filter = ('is_late', 'submitted_at')
    search_fields = ('assignment__title', 'student__user__first_name')
    raw_id_fields = ('assignment', 'student')

@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')
    search_fields = ('name', 'code')

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name',)
    filter_horizontal = ('permissions',)