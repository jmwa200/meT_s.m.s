from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

class User(AbstractUser):
    class Roles(models.IntegerChoices):
        ADMIN = 1, 'Admin'
        TEACHER = 2, 'Teacher'
        STUDENT = 3, 'Student'

    role = models.IntegerField(choices=Roles.choices, default=Roles.STUDENT)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

class Permission(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Role(models.Model):
    name = models.CharField(max_length=255)
    permissions = models.ManyToManyField(Permission, blank=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Subject(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True, null=True)
    credits = models.IntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(10)])

    def __str__(self):
        return f"{self.code} - {self.name}"

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    student_id = models.CharField(max_length=20, unique=True)
    enrollment_date = models.DateField(default=timezone.now)
    grade_level = models.CharField(max_length=20)
    parent_name = models.CharField(max_length=255, blank=True, null=True)
    parent_phone = models.CharField(max_length=15, blank=True, null=True)
    parent_email = models.EmailField(blank=True, null=True)

    def __str__(self):
        return f"{self.student_id} - {self.user.get_full_name()}"

class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    employee_id = models.CharField(max_length=20, unique=True)
    hire_date = models.DateField(default=timezone.now)
    department = models.CharField(max_length=100)
    subjects = models.ManyToManyField(Subject, blank=True)
    qualification = models.CharField(max_length=255, blank=True, null=True)
    experience_years = models.IntegerField(default=0, validators=[MinValueValidator(0)])

    def __str__(self):
        return f"{self.employee_id} - {self.user.get_full_name()}"

class Class(models.Model):
    name = models.CharField(max_length=255)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='classes')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    students = models.ManyToManyField(Student, blank=True, related_name='classes')
    room_number = models.CharField(max_length=20, blank=True, null=True)
    schedule_time = models.TimeField(blank=True, null=True)
    schedule_days = models.CharField(max_length=20, blank=True, null=True)  # e.g., "Mon,Wed,Fri"
    max_capacity = models.IntegerField(default=30, validators=[MinValueValidator(1)])

    def __str__(self):
        return f"{self.name} - {self.subject.name}"

    class Meta:
        verbose_name_plural = "Classes"

class Attendance(models.Model):
    class Status(models.TextChoices):
        PRESENT = 'P', 'Present'
        ABSENT = 'A', 'Absent'
        LATE = 'L', 'Late'
        EXCUSED = 'E', 'Excused'

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendances')
    class_session = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField(default=timezone.now)
    status = models.CharField(max_length=1, choices=Status.choices, default=Status.PRESENT)
    notes = models.TextField(blank=True, null=True)
    marked_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='marked_attendances')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} - {self.class_session} - {self.date} - {self.get_status_display()}"

    class Meta:
        unique_together = ['student', 'class_session', 'date']

class Grade(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='grades')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    assignment_name = models.CharField(max_length=255)
    grade = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    max_grade = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    date_assigned = models.DateField()
    date_submitted = models.DateField(blank=True, null=True)
    comments = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.student} - {self.subject} - {self.assignment_name}: {self.grade}/{self.max_grade}"

class Assignment(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'D', 'Draft'
        PUBLISHED = 'P', 'Published'
        CLOSED = 'C', 'Closed'

    title = models.CharField(max_length=255)
    description = models.TextField()
    class_session = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='assignments')
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    due_date = models.DateTimeField()
    max_points = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    status = models.CharField(max_length=1, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.class_session}"

class Submission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='submissions')
    content = models.TextField()
    file_attachment = models.FileField(upload_to='submissions/', blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_late = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.student} - {self.assignment.title}"

    class Meta:
        unique_together = ['assignment', 'student']