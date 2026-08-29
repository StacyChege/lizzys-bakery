from rest_framework import permissions


class IsClockedIn(permissions.BasePermission):
    def has_permission(self, request, view):
        return getattr(request, 'auth', None) is not None


class IsBakeryAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role == 'ADMIN')
