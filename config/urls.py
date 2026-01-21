# config/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from race.views import RacerViewSet, NoticeViewSet, StartListViewSet # StartListViewSet 추가

router = DefaultRouter()
router.register(r'racers', RacerViewSet)
router.register(r'notices', NoticeViewSet)
router.register(r'startlist', StartListViewSet, basename='startlist')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]