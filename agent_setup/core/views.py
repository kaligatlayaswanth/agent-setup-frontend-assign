from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Organization, User, AgentInstance, DataSource, Article
# from .models import Agent  # Temporarily commented out until migrated
from .serializers import (
    OrganizationSerializer, UserSerializer, 
    # AgentSerializer,  # Temporarily commented out until migrated
    AgentInstanceSerializer,
    DataSourceSerializer, DataSourceLinkSerializer, ArticleSerializer, ArticleCreateSerializer
)
from .utils import generate_articles
import pandas as pd
from django.utils import timezone
from datetime import datetime

# Test the import
print(f"=== VIEWS: generate_articles function imported: {generate_articles} ===")
print(f"=== VIEWS: generate_articles function type: {type(generate_articles)} ===")

# Temporarily comment out AgentListView until Agent model is migrated
# class AgentListView(APIView):
#     def get(self, request):
#         agents = Agent.objects.filter(is_active=True)
#         serializer = AgentSerializer(agents, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)

class OrganizationCreateView(APIView):
    def post(self, request):
        serializer = OrganizationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OrganizationListView(APIView):
    def get(self, request):
        organizations = Organization.objects.all()
        serializer = OrganizationSerializer(organizations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class OrganizationDetailView(APIView):
    def get(self, request, id):
        organization = get_object_or_404(Organization, id=id)
        serializer = OrganizationSerializer(organization)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, id):
        organization = get_object_or_404(Organization, id=id)
        serializer = OrganizationSerializer(organization, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        organization = get_object_or_404(Organization, id=id)
        organization.delete()
        return Response({"message": "Organization deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

class UserRegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserListView(APIView):
    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserDetailView(APIView):
    def get(self, request, id):
        user = get_object_or_404(User, id=id)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, id):
        user = get_object_or_404(User, id=id)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        user = get_object_or_404(User, id=id)
        user.delete()
        return Response({"message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

class AgentInstanceCreateView(APIView):
    def post(self, request):
        serializer = AgentInstanceSerializer(data=request.data)
        if serializer.is_valid():
            # Save first
            instance = serializer.save()

            # Add agent_id after saving
            response_data = serializer.data
            response_data['agent_id'] = instance.id

            return Response(response_data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AgentInstanceListView(APIView):
    def get(self, request):
        agent_instances = AgentInstance.objects.all()
        serializer = AgentInstanceSerializer(agent_instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AgentInstanceDetailView(APIView):
    def get(self, request, id):
        agent_instance = get_object_or_404(AgentInstance, id=id)
        serializer = AgentInstanceSerializer(agent_instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, id):
        agent_instance = get_object_or_404(AgentInstance, id=id)
        serializer = AgentInstanceSerializer(agent_instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        agent_instance = get_object_or_404(AgentInstance, id=id)
        agent_instance.delete()
        return Response({"message": "Agent instance deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

class DataSourceCreateView(APIView):
    def post(self, request):
        serializer = DataSourceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DataSourceListView(APIView):
    def get(self, request):
        data_sources = DataSource.objects.all()
        serializer = DataSourceSerializer(data_sources, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class DataSourceDetailView(APIView):
    def get(self, request, id):
        data_source = get_object_or_404(DataSource, id=id)
        serializer = DataSourceSerializer(data_source)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, id):
        data_source = get_object_or_404(DataSource, id=id)
        serializer = DataSourceSerializer(data_source, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        data_source = get_object_or_404(DataSource, id=id)
        data_source.delete()
        return Response({"message": "Data source deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

class DataSourceUploadView(APIView):
    def post(self, request):
        serializer = DataSourceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DataSourceLinkView(APIView):
    def post(self, request, instance_id):
        serializer = DataSourceLinkSerializer(data=request.data)
        if serializer.is_valid():
            agent_instance = get_object_or_404(AgentInstance, id=instance_id)
            datasource = get_object_or_404(DataSource, id=serializer.validated_data['datasource_id'])
            agent_instance.datasource = datasource
            agent_instance.mapping_config = serializer.validated_data['mapping_config']
            agent_instance.save()
            return Response({
                'status': 'linked',
                'instance_id': instance_id,
                'datasource_id': str(datasource.id),
                'mapping_config': agent_instance.mapping_config
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DataSourceTestView(APIView):
    def get(self, request, id):
        datasource = get_object_or_404(DataSource, id=id)
        if datasource.source_type != 'csv' or not datasource.file:
            return Response({"error": "DataSource must be a CSV with a valid file"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            df = pd.read_csv(
                datasource.file.path,
                delimiter=datasource.connection_params.get('delimiter', ','),
                encoding=datasource.connection_params.get('encoding', 'utf-8')
            )
            return Response({"status": "success", "row_count": len(df)}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Failed to read data source: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class DataSourcePreviewView(APIView):
    def get(self, request, id):
        datasource = get_object_or_404(DataSource, id=id)
        if datasource.source_type != 'csv' or not datasource.file:
            return Response({"error": "DataSource must be a CSV with a valid file"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            df = pd.read_csv(
                datasource.file.path,
                delimiter=datasource.connection_params.get('delimiter', ','),
                encoding=datasource.connection_params.get('encoding', 'utf-8')
            )
            preview_data = df.head(5).to_dict(orient='records')
            return Response(preview_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Failed to preview data source: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class DailyNarrativesView(APIView):
    def get(self, request, date):
        try:
            date_obj = datetime.strptime(date, '%Y-%m-%d').date()
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
        articles = Article.objects.filter(created_at__date=date_obj)
        serializer = ArticleSerializer(articles, many=True)
        return Response({"date": date, "articles": serializer.data}, status=status.HTTP_200_OK)

class AgentNarrativesView(APIView):
    def get(self, request, instance_id):
        articles = Article.objects.filter(agent_instance_id=instance_id)
        serializer = ArticleSerializer(articles, many=True)
        return Response({"agent_instance_id": instance_id, "articles": serializer.data}, status=status.HTTP_200_OK)

class HealthCheckView(APIView):
    def get(self, request):
        try:
            Article.objects.count()
            return Response({"status": "healthy", "database": "connected"}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"status": "unhealthy", "database": "disconnected"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

class AgentMetricsView(APIView):
    def get(self, request, id):
        agent_instance = get_object_or_404(AgentInstance, id=id)
        articles = Article.objects.filter(agent_instance=agent_instance)
        total_articles = articles.count()
        last_run = articles.order_by('-created_at').first().created_at if articles.exists() else None
        return Response({
            "agent_instance_id": id,
            "total_articles": total_articles,
            "last_run": last_run
        }, status=status.HTTP_200_OK)

class ArticleCreateView(APIView):
    def post(self, request, instance_id):
        serializer = ArticleCreateSerializer(data=request.data)
        if serializer.is_valid():
            agent_instance_id = serializer.validated_data['agent_instance_id']
            if agent_instance_id != instance_id:
                return Response({"error": "agent_instance_id in payload does not match URL instance_id"},
                                status=status.HTTP_400_BAD_REQUEST)
            agent_instance = get_object_or_404(AgentInstance, id=instance_id)
            articles_data = serializer.validated_data['articles']
            created_articles = []

            if articles_data:
                for article_data in articles_data:
                    article = Article.objects.create(
                        agent_instance=agent_instance,
                        title=article_data['title'],
                        content=article_data['content']
                    )
                    created_articles.append(article)
            else:
                print(f"=== VIEW: About to call generate_articles for agent {instance_id} ===")
                articles_created = generate_articles(agent_instance)
                print(f"=== VIEW: generate_articles returned: {articles_created} ===")
                
                if articles_created == 0:
                    return Response({"error": "Failed to generate articles. Ensure DataSource and mapping_config are valid."},
                                    status=status.HTTP_400_BAD_REQUEST)
                created_articles = Article.objects.filter(agent_instance=agent_instance).order_by('-created_at')[:articles_created]

            serializer = ArticleSerializer(created_articles, many=True)
            return Response({
                "agent_instance_id": instance_id,
                "articles": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)