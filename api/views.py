from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from .serializers import RegisterSerializer, UserSerializer, StudentSerializer, TeacherSerializer, ClassSerializer
from .models import User, Student, Teacher, Class
from .permissions import HasPermission, IsAdmin, IsTeacher, IsStudent

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = Token.objects.create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })

class StudentList(generics.ListAPIView):
    required_permission = 'view_students'
    permission_classes = [HasPermission]
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class TeacherList(generics.ListAPIView):
    required_permission = 'view_teachers'
    permission_classes = [HasPermission]
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer

class ClassList(generics.ListAPIView):
    required_permission = 'view_classes'
    permission_classes = [HasPermission]
    queryset = Class.objects.all()
    serializer_class = ClassSerializer

