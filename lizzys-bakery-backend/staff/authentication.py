from django.core.exceptions import ValidationError
from rest_framework import authentication, exceptions

from .models import ClockRecord


class ShiftTokenAuthentication(authentication.BaseAuthentication):
    """
    Reads X-Staff-Token, resolves it to an open (not clocked-out) shift.
    request.user is set to the StaffMember, request.auth to the ClockRecord —
    views use request.auth directly rather than DRF's is_authenticated dance,
    since StaffMember isn't a Django auth User.
    """

    def authenticate(self, request):
        token = request.headers.get('X-Staff-Token')
        if not token:
            return None
        try:
            shift = ClockRecord.objects.select_related('staff').get(
                token=token, clock_out__isnull=True
            )
        except (ClockRecord.DoesNotExist, ValueError, ValidationError):
            raise exceptions.AuthenticationFailed('Invalid or expired staff session.')
        return (shift.staff, shift)

    def authenticate_header(self, request):
        # Without this, DRF returns 403 for a bad/missing token instead of
        # the more correct 401 — this just tells it a challenge exists.
        return 'X-Staff-Token'
