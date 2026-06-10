from rest_framework import permissions

class IsPlatformAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'PLATFORM_ADMIN'
        )


class IsBarangayAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'BARANGAY_ADMIN' or request.user.role == 'PLATFORM_ADMIN')
        )


class IsBarangayStaffOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in ['BARANGAY_STAFF', 'BARANGAY_ADMIN', 'PLATFORM_ADMIN']
        )


class IsVerifiedResident(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.role in ['PLATFORM_ADMIN', 'BARANGAY_ADMIN', 'BARANGAY_STAFF']:
            return True
        return request.user.role == 'RESIDENT' and request.user.verification_status == 'VERIFIED' and request.user.is_active


class IsTenantMember(permissions.BasePermission):
    """
    Ensures that the requested object belongs to the user's barangay,
    unless the user is a Platform Administrator.
    """
    def has_object_permission(self, request, view, obj):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.role == 'PLATFORM_ADMIN':
            return True
        obj_barangay = getattr(obj, 'barangay', None)
        if obj_barangay is None and hasattr(obj, 'user'):
            obj_barangay = getattr(obj.user, 'barangay', None)
        return obj_barangay == request.user.barangay
