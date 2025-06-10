from rest_framework import generics, status, viewsets, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import authenticate
from django.db.models import Q, Count, Avg
from django.utils import timezone

from .serializers import (
    RegisterSerializer, UserSerializer, StudentSerializer, TeacherSerializer,
    ClassSerializer, SubjectSerializer, AttendanceSerializer, GradeSerializer,
    AssignmentSerializer, SubmissionSerializer, PermissionSerializer, RoleSerializer
)
from .models import (
    User, Student, Teacher, Class, Subject, Attendance, 
    Grade, Assignment, Submission, Permission, Role
)
from .permissions import (
    HasPermission, IsAdmin, IsTeacher, IsStudent, 
    IsTeacherOrAdmin, IsStudentOwner
)

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)

class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                token, created = Token.objects.get_or_create(user=user)
                return Response({
                    'token': token.key,
                    'user': UserSerializer(user).data
                })
            else:
                return Response(
                    {'error': 'Invalid credentials'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
        else:
            return Response(
                {'error': 'Username and password required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            request.user.auth_token.delete()
            return Response({'message': 'Successfully logged out'})
        except:
            return Response({'error': 'Error logging out'}, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['username', 'email', 'date_joined']

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def profile(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name', 'code']

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.select_related('user').all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['grade_level', 'enrollment_date']
    search_fields = ['user__first_name', 'user__last_name', 'student_id', 'user__email']
    ordering_fields = ['student_id', 'enrollment_date']

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == User.Roles.STUDENT:
            # Students can only see their own profile
            queryset = queryset.filter(user=self.request.user)
        return queryset

    @action(detail=True, methods=['get'])
    def grades(self, request, pk=None):
        student = self.get_object()
        grades = Grade.objects.filter(student=student).select_related('subject', 'teacher')
        serializer = GradeSerializer(grades, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def attendance(self, request, pk=None):
        student = self.get_object()
        attendance = Attendance.objects.filter(student=student).select_related('class_session')
        serializer = AttendanceSerializer(attendance, many=True)
        return Response(serializer.data)

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.select_related('user').prefetch_related('subjects').all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'hire_date']
    search_fields = ['user__first_name', 'user__last_name', 'employee_id', 'department']
    ordering_fields = ['employee_id', 'hire_date']

    @action(detail=True, methods=['get'])
    def classes(self, request, pk=None):
        teacher = self.get_object()
        classes = Class.objects.filter(teacher=teacher).select_related('subject')
        serializer = ClassSerializer(classes, many=True)
        return Response(serializer.data)

class ClassViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.select_related('teacher', 'subject').prefetch_related('students').all()
    serializer_class = ClassSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['teacher', 'subject']
    search_fields = ['name', 'teacher__user__first_name', 'subject__name']

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == User.Roles.STUDENT:
            # Students can only see classes they're enrolled in
            try:
                student = Student.objects.get(user=self.request.user)
                queryset = queryset.filter(students=student)
            except Student.DoesNotExist:
                queryset = queryset.none()
        elif self.request.user.role == User.Roles.TEACHER:
            # Teachers can only see their own classes
            try:
                teacher = Teacher.objects.get(user=self.request.user)
                queryset = queryset.filter(teacher=teacher)
            except Teacher.DoesNotExist:
                queryset = queryset.none()
        return queryset

    @action(detail=True, methods=['post'], permission_classes=[IsTeacherOrAdmin])
    def enroll_student(self, request, pk=None):
        class_obj = self.get_object()
        student_id = request.data.get('student_id')
        
        try:
            student = Student.objects.get(id=student_id)
            class_obj.students.add(student)
            return Response({'message': 'Student enrolled successfully'})
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], permission_classes=[IsTeacherOrAdmin])
    def remove_student(self, request, pk=None):
        class_obj = self.get_object()
        student_id = request.data.get('student_id')
        
        try:
            student = Student.objects.get(id=student_id)
            class_obj.students.remove(student)
            return Response({'message': 'Student removed successfully'})
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related('student', 'class_session', 'marked_by').all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'date', 'class_session']
    ordering_fields = ['date', 'created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == User.Roles.STUDENT:
            try:
                student = Student.objects.get(user=self.request.user)
                queryset = queryset.filter(student=student)
            except Student.DoesNotExist:
                queryset = queryset.none()
        elif self.request.user.role == User.Roles.TEACHER:
            try:
                teacher = Teacher.objects.get(user=self.request.user)
                queryset = queryset.filter(class_session__teacher=teacher)
            except Teacher.DoesNotExist:
                queryset = queryset.none()
        return queryset

    def perform_create(self, serializer):
        serializer.save(marked_by=self.request.user)

class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.select_related('student', 'subject', 'teacher').all()
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['subject', 'student', 'teacher']
    ordering_fields = ['date_assigned', 'grade']

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == User.Roles.STUDENT:
            try:
                student = Student.objects.get(user=self.request.user)
                queryset = queryset.filter(student=student)
            except Student.DoesNotExist:
                queryset = queryset.none()
        elif self.request.user.role == User.Roles.TEACHER:
            try:
                teacher = Teacher.objects.get(user=self.request.user)
                queryset = queryset.filter(teacher=teacher)
            except Teacher.DoesNotExist:
                queryset = queryset.none()
        return queryset

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.select_related('class_session', 'teacher').all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'class_session', 'teacher']
    ordering_fields = ['due_date', 'created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == User.Roles.STUDENT:
            try:
                student = Student.objects.get(user=self.request.user)
                queryset = queryset.filter(class_session__students=student, status='P')
            except Student.DoesNotExist:
                queryset = queryset.none()
        elif self.request.user.role == User.Roles.TEACHER:
            try:
                teacher = Teacher.objects.get(user=self.request.user)
                queryset = queryset.filter(teacher=teacher)
            except Teacher.DoesNotExist:
                queryset = queryset.none()
        return queryset

    def perform_create(self, serializer):
        try:
            teacher = Teacher.objects.get(user=self.request.user)
            serializer.save(teacher=teacher)
        except Teacher.DoesNotExist:
            raise serializers.ValidationError("Only teachers can create assignments")

class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.select_related('assignment', 'student').all()
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['assignment', 'student', 'is_late']
    ordering_fields = ['submitted_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == User.Roles.STUDENT:
            try:
                student = Student.objects.get(user=self.request.user)
                queryset = queryset.filter(student=student)
            except Student.DoesNotExist:
                queryset = queryset.none()
        elif self.request.user.role == User.Roles.TEACHER:
            try:
                teacher = Teacher.objects.get(user=self.request.user)
                queryset = queryset.filter(assignment__teacher=teacher)
            except Teacher.DoesNotExist:
                queryset = queryset.none()
        return queryset

    def perform_create(self, serializer):
        try:
            student = Student.objects.get(user=self.request.user)
            assignment = serializer.validated_data['assignment']
            is_late = timezone.now() > assignment.due_date
            serializer.save(student=student, is_late=is_late)
        except Student.DoesNotExist:
            raise serializers.ValidationError("Only students can submit assignments")

# Dashboard and Analytics Views
class DashboardView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {}

        if user.role == User.Roles.ADMIN:
            data = {
                'total_students': Student.objects.count(),
                'total_teachers': Teacher.objects.count(),
                'total_classes': Class.objects.count(),
                'total_subjects': Subject.objects.count(),
                'recent_registrations': User.objects.filter(
                    date_joined__gte=timezone.now() - timezone.timedelta(days=7)
                ).count()
            }
        elif user.role == User.Roles.TEACHER:
            try:
                teacher = Teacher.objects.get(user=user)
                data = {
                    'my_classes': teacher.classes.count(),
                    'total_students': Student.objects.filter(classes__teacher=teacher).distinct().count(),
                    'pending_assignments': Assignment.objects.filter(teacher=teacher, status='P').count(),
                    'recent_submissions': Submission.objects.filter(assignment__teacher=teacher).count()
                }
            except Teacher.DoesNotExist:
                pass
        elif user.role == User.Roles.STUDENT:
            try:
                student = Student.objects.get(user=user)
                data = {
                    'enrolled_classes': student.classes.count(),
                    'pending_assignments': Assignment.objects.filter(
                        class_session__students=student, 
                        status='P',
                        due_date__gt=timezone.now()
                    ).count(),
                    'average_grade': Grade.objects.filter(student=student).aggregate(
                        avg=Avg('grade')
                    )['avg'] or 0,
                    'attendance_rate': self._calculate_attendance_rate(student)
                }
            except Student.DoesNotExist:
                pass

        return Response(data)

    def _calculate_attendance_rate(self, student):
        total_attendance = Attendance.objects.filter(student=student).count()
        if total_attendance == 0:
            return 100
        present_count = Attendance.objects.filter(
            student=student, 
            status__in=['P', 'L']
        ).count()
        return round((present_count / total_attendance) * 100, 2)