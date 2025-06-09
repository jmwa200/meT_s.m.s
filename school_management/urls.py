from django.contrib import admin
from django.urls import include, path
from api.auth import CustomAuthToken

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('login/', CustomAuthToken.as_view()),
]
