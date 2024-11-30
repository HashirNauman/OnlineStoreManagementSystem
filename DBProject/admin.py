from django.contrib import admin

# Register your models here.
from .models import User, Item, Transaction, TransactionItem, Admin, CashierSlot, DeliveryPerson, AuditLog

admin.site.register(User)
admin.site.register(Item)
admin.site.register(Transaction)
admin.site.register(TransactionItem)
admin.site.register(Admin)
admin.site.register(CashierSlot)
admin.site.register(DeliveryPerson)
admin.site.register(AuditLog)