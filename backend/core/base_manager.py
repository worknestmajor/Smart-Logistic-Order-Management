from django.db import transaction


class BaseManager:
    model = None

    def __init__(self, model=None):
        if model is not None:
            self.model = model
        if self.model is None:
            raise ValueError("model must be defined for manager")

    def pre_create(self, data, context=None):
        return data

    def post_create(self, instance, context=None):
        return instance

    def pre_update(self, instance, data, context=None):
        return data

    def post_update(self, instance, context=None):
        return instance

    def pre_delete(self, instance, context=None):
        return instance

    def post_delete(self, instance, context=None):
        return instance

    @transaction.atomic
    def create(self, data, context=None):
        data = self.pre_create(data, context=context)
        instance = self.model.objects.create(**data)
        return self.post_create(instance, context=context)

    @transaction.atomic
    def update(self, instance, data, context=None):
        data = self.pre_update(instance, data, context=context)
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return self.post_update(instance, context=context)

    @transaction.atomic
    def delete(self, instance, soft=True, context=None):
        instance = self.pre_delete(instance, context=context)
        if soft and hasattr(instance, "is_active"):
            instance.is_active = False
            instance.save(update_fields=["is_active", "updated_at"])
        else:
            instance.delete()
        return self.post_delete(instance, context=context)

    def get(self, **filters):
        queryset = self.model.objects.filter(**filters)
        if hasattr(self.model, "is_active") and "is_active" not in filters:
            queryset = queryset.filter(is_active=True)
        return queryset.first()

    def list(self, filters=None, order_by=None):
        filters = filters or {}
        queryset = self.model.objects.filter(**filters)
        if hasattr(self.model, "is_active") and "is_active" not in filters:
            queryset = queryset.filter(is_active=True)
        if order_by:
            queryset = queryset.order_by(*order_by)
        return queryset
