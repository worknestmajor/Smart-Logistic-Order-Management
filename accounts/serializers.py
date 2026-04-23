from rest_framework import serializers

from accounts.models import Role, User
from core.base_serializer import BaseSerializer


class RoleSerializer(BaseSerializer):
    class Meta:
        model = Role
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class UserSerializer(BaseSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "password",
            "first_name",
            "last_name",
            "phone",
            "role",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for key, value in validated_data.items():
            setattr(instance, key, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
