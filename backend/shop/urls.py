from django.urls import path
from . import views

urlpatterns = [
    # products public
    path("products/", views.product_list, name="product_list"),
    path("products/ai-create/", views.ai_create_product, name="product_ai_create"),

    # cart
    path("cart/", views.cart_detail, name="cart_detail"),
    path("cart/add/", views.cart_add, name="cart_add"),
    path("cart/remove/<int:pk>/", views.cart_remove, name="cart_remove"),

    # checkout + payment
    path("checkout/", views.checkout, name="checkout"),
    path("payment/create/", views.create_payment, name="payment_create"),

    # orders & analytics
    path("orders/my/", views.my_orders, name="my_orders"),
    path("admin/analytics/", views.admin_analytics, name="admin_analytics"),
    path("admin/orders/", views.admin_order_list, name="admin_order_list"),

    # admin product management
    path("admin/products/", views.admin_product_list, name="admin_product_list"),
    path("admin/products/create/", views.admin_product_create, name="admin_product_create"),
    path("admin/products/<int:pk>/", views.admin_product_detail, name="admin_product_detail"),
]
