from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from menu.models import Product
from .authentication import ShiftTokenAuthentication
from .models import ClockRecord, DailyStock, SaleEntry, StaffMember
from .permissions import IsBakeryAdmin, IsClockedIn
from .serializers import (
    ClockInSerializer,
    DailyStockSerializer,
    SaleEntrySerializer,
    ShiftSummarySerializer,
    StaffMemberPublicSerializer,
)


class StaffRosterView(generics.ListAPIView):
    # Just names — used to populate the "who are you" picker before PIN entry.
    queryset = StaffMember.objects.filter(is_active=True)
    serializer_class = StaffMemberPublicSerializer
    permission_classes = [AllowAny]


class ClockInView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ClockInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        staff = serializer.validated_data['staff']
        shift = ClockRecord.objects.create(staff=staff)
        return Response(
            {
                'token': str(shift.token),
                'staff_id': staff.id,
                'staff_name': staff.name,
                'clock_in': shift.clock_in,
            },
            status=status.HTTP_201_CREATED,
        )


class ClockOutView(APIView):
    authentication_classes = [ShiftTokenAuthentication]
    permission_classes = [IsClockedIn]

    def post(self, request):
        shift = request.auth
        shift.clock_out = timezone.now()
        shift.save()
        return Response(ShiftSummarySerializer(shift).data)


class MyShiftView(APIView):
    # Lets the staff page re-hydrate "your sales so far" after a refresh,
    # without ending the shift the way clock-out does.
    authentication_classes = [ShiftTokenAuthentication]
    permission_classes = [IsClockedIn]

    def get(self, request):
        return Response(ShiftSummarySerializer(request.auth).data)


class DailyStockView(APIView):
    authentication_classes = [ShiftTokenAuthentication]
    permission_classes = [IsClockedIn]

    def get(self, request):
        today = timezone.localdate()
        stock = DailyStock.objects.filter(date=today).select_related('product')
        return Response(DailyStockSerializer(stock, many=True).data)

    def post(self, request):
        product_id = request.data.get('product')
        quantity = request.data.get('quantity_stocked')
        if product_id is None or quantity is None:
            return Response(
                {'detail': 'product and quantity_stocked are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'detail': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        stock, _ = DailyStock.objects.update_or_create(
            date=timezone.localdate(),
            product=product,
            defaults={'quantity_stocked': quantity},
        )
        return Response(DailyStockSerializer(stock).data)


class SaleEntryView(generics.ListCreateAPIView):
    serializer_class = SaleEntrySerializer
    authentication_classes = [ShiftTokenAuthentication]
    permission_classes = [IsClockedIn]

    def get_queryset(self):
        return self.request.auth.sales.select_related('product').all()


class AdminDailySummaryView(APIView):
    # Separate auth path from the rest of this app on purpose — this is the
    # baker reviewing the day from the real site, not a staff kiosk action.
    permission_classes = [IsAuthenticated, IsBakeryAdmin]

    def get(self, request):
        date_param = request.query_params.get('date')
        target_date = parse_date(date_param) if date_param else timezone.localdate()
        if target_date is None:
            return Response({'detail': 'Invalid date.'}, status=status.HTTP_400_BAD_REQUEST)

        shifts = (
            ClockRecord.objects.filter(clock_in__date=target_date)
            .select_related('staff')
            .prefetch_related('sales__product')
        )

        by_staff = []
        grand_total_quantity = 0
        grand_total_revenue = 0
        for shift in shifts:
            sales = list(shift.sales.all())
            total_quantity = sum(s.quantity for s in sales)
            total_revenue = sum(s.unit_price * s.quantity for s in sales)
            grand_total_quantity += total_quantity
            grand_total_revenue += total_revenue
            by_staff.append({
                'staff_name': shift.staff.name,
                'clock_in': shift.clock_in,
                'clock_out': shift.clock_out,
                'total_quantity': total_quantity,
                'total_revenue': total_revenue,
                'sales': SaleEntrySerializer(sales, many=True).data,
            })

        return Response({
            'date': target_date,
            'by_staff': by_staff,
            'grand_total_quantity': grand_total_quantity,
            'grand_total_revenue': grand_total_revenue,
        })
