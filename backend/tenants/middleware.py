class TenantMiddleware:
    """
    Middleware to resolve tenant context based on authenticated user's assigned barangay.
    Platform Administrators can optionally provide an 'X-Tenant-ID' header to scope views.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.tenant = None
        if hasattr(request, 'user') and request.user.is_authenticated:
            if getattr(request.user, 'role', None) == 'PLATFORM_ADMIN':
                tenant_id = request.headers.get('X-Tenant-ID')
                if tenant_id:
                    from tenants.models import Barangay
                    request.tenant = Barangay.objects.filter(id=tenant_id).first()
            else:
                request.tenant = getattr(request.user, 'barangay', None)
        return self.get_response(request)
