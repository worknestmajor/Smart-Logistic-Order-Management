from core.base_serializer import BaseSerializer
from assignments.models import Assignment


class AssignmentSerializer(BaseSerializer):
    class Meta:
        model = Assignment
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at", "assigned_at", "assigned_by")
