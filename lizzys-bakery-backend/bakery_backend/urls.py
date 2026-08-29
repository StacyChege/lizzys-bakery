"""
URL configuration for bakery_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.contrib import admin
from django.db import connection
from django.http import JsonResponse
from django.urls import include, path, re_path
from django.views.static import serve


def health_check(request):
    # Used by Dokploy/Docker (and anyone curling the deploy) to confirm the
    # container is up AND actually able to reach the database — not just that
    # the process started.
    try:
        connection.ensure_connection()
        db_ok = True
    except Exception:
        db_ok = False
    return JsonResponse(
        {'status': 'ok' if db_ok else 'error', 'database': db_ok},
        status=200 if db_ok else 503,
    )


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    path('api/auth/', include('users.urls')),  # Include the users app URLs
    path('api/menu/', include('menu.urls')),  # Include the Menu app URLs
    path('api/staff/', include('staff.urls')),  # Staff clock-in/stock/sales tools
    # Not gated behind DEBUG — django.conf.urls.static.static() is a no-op
    # when DEBUG=False, which would silently 404 every uploaded product
    # photo in production. Fine for this project's scale; a real CDN/object
    # store would replace this if traffic ever justified it.
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
