from django.urls import path
from . import views
from .views import StudentList, TeacherList, ClassList

urlpatterns = [
    path('register/', views.RegisterView.as_view()),
    path('login/', views.CustomAuthToken.as_view(), name='api-login'),
    path('students/', StudentList.as_view(), name='student-list'),
    path('teachers/', TeacherList.as_view(), name='teacher-list'),
    path('classes/', ClassList.as_view(), name='class-list'),
    ]
