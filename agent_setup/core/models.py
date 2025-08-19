from django.db import models
import uuid

class Organization(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)  # Add unique=True
    is_demo = models.BooleanField(default=False)
    data_source_connected = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class User(models.Model):
    username = models.CharField(max_length=255)
    email = models.EmailField()
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=50)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)

# Temporarily commented out Agent model until migrations are set up
# class Agent(models.Model):
#     id = models.BigAutoField(primary_key=True)
#     name = models.CharField(max_length=255)
#     description = models.TextField()
#     category = models.CharField(max_length=100)
#     icon = models.CharField(max_length=10, default='🤖')
#     capabilities = models.JSONField(default=list)
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return self.name

#     class Meta:
#         ordering = ['name']

class AgentInstance(models.Model):
    id = models.BigAutoField(primary_key=True)
    agent_id = models.IntegerField()  # Temporarily reverted to IntegerField
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    agent_instance_name = models.CharField(max_length=255)
    configuration = models.JSONField(default=dict)
    datasource = models.ForeignKey('DataSource', on_delete=models.SET_NULL, null=True, blank=True)
    mapping_config = models.JSONField(default=dict)

class DataSource(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    source_type = models.CharField(max_length=50)
    file = models.FileField(upload_to='uploads/', null=True, blank=True)
    connection_params = models.JSONField(default=dict)
    table_name = models.CharField(max_length=255, blank=True)
    date_column = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)

class Article(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    content = models.TextField()
    agent_instance = models.ForeignKey(AgentInstance, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)