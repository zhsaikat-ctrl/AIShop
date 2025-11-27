from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .serializers import (
    RegisterSerializer,
    UserSerializer,
    UserRoleUpdateSerializer,
)
from .models import Profile


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    ser = RegisterSerializer(data=request.data)
    if ser.is_valid():
        user = ser.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    """
    বর্তমান লগইন user info + role
    """
    return Response(UserSerializer(request.user).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_list(request):
    """
    শুধুমাত্র admin/staff সব user দেখতে পারবে
    """
    if not request.user.is_staff:
        return Response({"detail": "Forbidden"}, status=403)

    qs = User.objects.all().order_by("id")
    ser = UserSerializer(qs, many=True)
    return Response(ser.data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_user_role(request, pk):
    """
    শুধুমাত্র admin/staff user role পরিবর্তন করতে পারবে
    body: { "role": "ADMIN" / "VENDOR" / "CUSTOMER" }
    """
    if not request.user.is_staff:
        return Response({"detail": "Forbidden"}, status=403)

    try:
        profile = Profile.objects.get(user__pk=pk)
    except Profile.DoesNotExist:
        return Response({"detail": "Profile not found"}, status=404)

    ser = UserRoleUpdateSerializer(profile, data=request.data, partial=True)
    if ser.is_valid():
        ser.save()
        return Response({"detail": "Role updated"})
    return Response(ser.errors, status=400)
