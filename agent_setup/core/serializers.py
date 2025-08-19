from rest_framework import serializers
from .models import Organization, User, AgentInstance, DataSource, Article
import pandas as pd
import os

# Temporarily commented out until Agent model is migrated
# class AgentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Agent
#         fields = ['id', 'name', 'description', 'category', 'icon', 'capabilities', 'is_active', 'created_at', 'updated_at']

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['id', 'name', 'is_demo', 'data_source_connected']

class UserSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(write_only=True, required=False)
    organization = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'organization', 'organization_name']
        extra_kwargs = {
            'password': {'write_only': True},
            'id': {'read_only': True}
        }

    def create(self, validated_data):
        organization_name = validated_data.pop('organization_name')
        try:
            organization = Organization.objects.get(name=organization_name)
        except Organization.DoesNotExist:
            raise serializers.ValidationError(f"No Organization found with name {organization_name}")
        except Organization.MultipleObjectsReturned:
            raise serializers.ValidationError(f"Multiple Organizations found with name {organization_name}. Ensure organization names are unique.")
        user = User.objects.create(**validated_data, organization=organization)
        return user

    def update(self, instance, validated_data):
        # Remove password from validated_data if not provided
        if 'password' not in validated_data:
            validated_data.pop('password', None)
        
        # Handle organization update if organization_name is provided
        if 'organization_name' in validated_data:
            organization_name = validated_data.pop('organization_name')
            try:
                organization = Organization.objects.get(name=organization_name)
                validated_data['organization'] = organization
            except Organization.DoesNotExist:
                raise serializers.ValidationError(f"No Organization found with name {organization_name}")
        
        return super().update(instance, validated_data)

class AgentInstanceSerializer(serializers.ModelSerializer):
    # Temporarily comment out agent field until Agent model is migrated
    # agent = AgentSerializer(read_only=True)
    # agent_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = AgentInstance
        fields = ['id', 'agent_id', 'organization', 'agent_instance_name', 'configuration', 'datasource', 'mapping_config']
        extra_kwargs = {
            'id': {'read_only': True}
        }
    
    # Temporarily comment out create method until Agent model is migrated
    # def create(self, validated_data):
    #     agent_id = validated_data.pop('agent_id')
    #     try:
    #         agent = Agent.objects.get(id=agent_id)
    #         validated_data['agent'] = agent
    #     except Agent.DoesNotExist:
    #         raise serializers.ValidationError(f"No Agent found with id {agent_id}")
    #     return super().create(validated_data)

class DataSourceSerializer(serializers.ModelSerializer):
    file = serializers.FileField(required=False)
    name = serializers.CharField(required=False, allow_blank=True)
    source_type = serializers.CharField(required=False, allow_blank=True)
    table_name = serializers.CharField(required=False, allow_blank=True)
    date_column = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    connection_params = serializers.JSONField(required=False, default=dict)

    class Meta:
        model = DataSource
        fields = ['id', 'name', 'source_type', 'file', 'connection_params', 'table_name', 'date_column', 'description']
        extra_kwargs = {
            'id': {'read_only': True}
        }

    def validate(self, data):
        # Only validate file if it's being created (not updated)
        if self.instance is None and 'file' not in data:
            raise serializers.ValidationError("A valid CSV file is required for creation")
        
        # If file is provided, ensure it's a CSV
        if 'file' in data and data['file']:
            if not data['file'].name.endswith('.csv'):
                raise serializers.ValidationError("A valid CSV file is required")

        # Default values
        data['source_type'] = data.get('source_type', 'csv')
        if 'file' in data and data['file']:
            data['name'] = data.get('name', os.path.splitext(data['file'].name)[0])
            data['table_name'] = data.get('table_name', data['name'])
            data['description'] = data.get('description', f"Data source for {data['name']}")
            data['connection_params'] = data.get('connection_params', {"delimiter": ",", "encoding": "utf-8"})

            # Read CSV to determine columns
            try:
                df = pd.read_csv(
                    data['file'],
                    delimiter=data['connection_params'].get('delimiter', ','),
                    encoding=data['connection_params'].get('encoding', 'utf-8')
                )
                if df.empty:
                    raise serializers.ValidationError("CSV file is empty")

                csv_columns = df.columns.tolist()
                # Dynamically set date_column
                if not data.get('date_column'):
                    date_cols = [col for col in csv_columns if 'date' in col.lower()]
                    data['date_column'] = date_cols[0] if date_cols else csv_columns[0] if csv_columns else ''
            except Exception as e:
                raise serializers.ValidationError(f"Error reading CSV: {str(e)}")

        return data

class DataSourceLinkSerializer(serializers.Serializer):
    datasource_id = serializers.UUIDField()
    mapping_config = serializers.DictField(required=False, allow_null=True)

    def validate(self, data):
        datasource_id = data.get('datasource_id')
        try:
            datasource = DataSource.objects.get(id=datasource_id)
        except DataSource.DoesNotExist:
            raise serializers.ValidationError(f"No DataSource found with id {datasource_id}")

        if datasource.source_type != 'csv' or not datasource.file:
            raise serializers.ValidationError("DataSource must be a CSV with a valid file")

        try:
            df = pd.read_csv(
                datasource.file.path,
                delimiter=datasource.connection_params.get('delimiter', ','),
                encoding=datasource.connection_params.get('encoding', 'utf-8')
            )
            if df.empty:
                raise serializers.ValidationError("CSV file is empty")

            csv_columns = df.columns.tolist()
            mapping_config = data.get('mapping_config')

            if mapping_config:
                date_column = mapping_config.get('date_column')
                metric_columns = mapping_config.get('metric_columns', [])
                category_columns = mapping_config.get('category_columns', [])
                if date_column and date_column not in csv_columns:
                    raise serializers.ValidationError(f"Date column '{date_column}' not found in CSV")
                for col in metric_columns + category_columns:
                    if col not in csv_columns:
                        raise serializers.ValidationError(f"Column '{col}' not found in CSV")
            else:
                data['mapping_config'] = {
                    'date_column': datasource.date_column,
                    'metric_columns': [col for col in csv_columns if df[col].dtype in ['int64', 'float64']],
                    'category_columns': [col for col in csv_columns if df[col].dtype == 'object' and col != datasource.date_column]
                }
        except Exception as e:
            raise serializers.ValidationError(f"Error reading CSV: {str(e)}")
        return data

class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = ['id', 'title', 'content', 'agent_instance', 'created_at']

class ArticleCreateSerializer(serializers.Serializer):
    agent_instance_id = serializers.IntegerField()
    articles = serializers.ListField(
        child=serializers.DictField(),
        allow_empty=True
    )

    def validate(self, data):
        agent_instance_id = data.get('agent_instance_id')
        try:
            AgentInstance.objects.get(id=agent_instance_id)
        except AgentInstance.DoesNotExist:
            raise serializers.ValidationError(f"No AgentInstance found with id {agent_instance_id}")

        articles = data.get('articles', [])
        for article in articles:
            if 'title' not in article or 'content' not in article:
                raise serializers.ValidationError("Each article must have 'title' and 'content' fields")
        return data