from rest_framework import serializers


class BaseSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        attrs = super().validate(attrs)
        cleaned = {}
        for key, value in attrs.items():
            cleaned[key] = value.strip() if isinstance(value, str) else value
        return cleaned
