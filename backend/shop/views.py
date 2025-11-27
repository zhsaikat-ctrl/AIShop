from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth.models import User
from django.db import transaction

from .models import Product, Order, OrderItem
from .serializers import ProductSerializer, OrderSerializer

from .ai_utils import ai_generate_product_meta


# -------------------------
# PUBLIC PRODUCT LIST
# -------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def product_list(request):
    qs = Product.objects.all().order_by("-created_at")
    ser = ProductSerializer(qs, many=True)
    return Response(ser.data)


# -------------------------
# AI PRODUCT GENERATOR + SAVE
# -------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def ai_create_product(request):
    title = request.data.get("title", "")
    if not title:
        return Response({"detail": "Title is required"}, status=400)

    try:
        result = ai_generate_product_meta(title)
        p = Product.objects.create(
            title_en=result["title_en"],
            title_bn=result["title_bn"],
            description_en=result["description_en"],
            description_bn=result["description_bn"],
            category=result["category"],
            price=result["suggested_price"],
        )

        return Response({
            "message": "AI product created",
            "product": ProductSerializer(p).data,
            "ai_raw": result
        })

    except Exception as e:
        return Response({"detail": str(e)}, status=500)


# -------------------------
# CART SYSTEM (simple session cart)
# -------------------------

@api_view(["GET"])
@permission_classes([AllowAny])
def cart_detail(request):
    cart = request.session.get("cart", {})
    return Response(cart)


@api_view(["POST"])
@permission_classes([AllowAny])
def cart_add(request):
    pid = str(request.data.get("product_id"))
    qty = int(request.data.get("qty", 1))

    if not pid:
        return Response({"detail": "product_id required"}, status=400)

    cart = request.session.get("cart", {})
    cart[pid] = cart.get(pid, 0) + qty

    request.session["cart"] = cart
    request.session.modified = True

    return Response({"message": "Added", "cart": cart})


@api_view(["DELETE"])
@permission_classes([AllowAny])
def cart_remove(request, pk):
    cart = request.session.get("cart", {})
    pk = str(pk)

    if pk in cart:
        del cart[pk]

    request.session["cart"] = cart
    request.session.modified = True

    return Response({"message": "Removed", "cart": cart})


# -------------------------
# CHECKOUT + ORDER CREATE
# -------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def checkout(request):
    cart = request.session.get("cart", {})
    if not cart:
        return Response({"detail": "Cart empty"}, status=400)

    with transaction.atomic():
        order = Order.objects.create(
            user=request.user,
            is_paid=False
        )

        for pid, qty in cart.items():
            try:
                p = Product.objects.get(pk=pid)
            except Product.DoesNotExist:
                continue

            OrderItem.objects.create(
                order=order,
                product=p,
                quantity=qty
            )

        request.session["cart"] = {}
        request.session.modified = True

    return Response({
        "message": "Order created",
        "order_id": order.id
    })


# -------------------------
# PAYMENT CREATE (Dummy)
# -------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_payment(request):
    """
    আপনি চাইলে এখানে bKash / Nagad / Stripe implement করতে পারবেন।
    এখন শুধু successful true দিচ্ছি।
    """
    order_id = request.data.get("order_id")

    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response({"detail": "Order not found"}, status=404)

    order.is_paid = True
    order.save()

    return Response({"message": "Payment successful"})


# -------------------------
# USER ORDERS
# -------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_orders(request):
    qs = Order.objects.filter(user=request.user).order_by("-created_at")
    ser = OrderSerializer(qs, many=True)
    return Response(ser.data)


# -------------------------
# ANALYTICS (Admin + Vendor)
# -------------------------
def is_admin_or_vendor(user):
    if user.is_staff:
        return True
    prof = getattr(user, "profile", None)
    return prof and prof.role in ["ADMIN", "VENDOR"]


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_analytics(request):
    if not is_admin_or_vendor(request.user):
        return Response({"detail": "Forbidden"}, status=403)

    total_products = Product.objects.count()
    total_orders = Order.objects.count()
    total_paid_orders = Order.objects.filter(is_paid=True).count()
    total_revenue = sum([
        sum(i.product.price * i.quantity for i in o.items.all())
        for o in Order.objects.filter(is_paid=True)
    ])

    return Response({
        "total_products": total_products,
        "total_orders": total_orders,
        "total_paid_orders": total_paid_orders,
        "estimated_revenue": total_revenue
    })


# -------------------------
# ADMIN PRODUCT CRUD
# -------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_product_list(request):
    if not is_admin_or_vendor(request.user):
        return Response({"detail": "Forbidden"}, status=403)

    qs = Product.objects.all().order_by("-created_at")
    ser = ProductSerializer(qs, many=True)
    return Response(ser.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_product_create(request):
    if not is_admin_or_vendor(request.user):
        return Response({"detail": "Forbidden"}, status=403)

    ser = ProductSerializer(data=request.data)
    if ser.is_valid():
        ser.save()
        return Response(ser.data, status=201)
    return Response(ser.errors, status=400)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def admin_product_detail(request, pk):
    if not is_admin_or_vendor(request.user):
        return Response({"detail": "Forbidden"}, status=403)

    try:
        p = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({"detail": "Not found"}, status=404)

    if request.method == "DELETE":
        p.delete()
        return Response(status=204)

    ser = ProductSerializer(p, data=request.data, partial=True)
    if ser.is_valid():
        ser.save()
        return Response(ser.data)
    return Response(ser.errors, status=400)


# -------------------------
# ADMIN ORDER LIST
# -------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_order_list(request):
    if not is_admin_or_vendor(request.user):
        return Response({"detail": "Forbidden"}, status=403)

    qs = Order.objects.all().order_by("-created_at")
    ser = OrderSerializer(qs, many=True)
    return Response(ser.data)
