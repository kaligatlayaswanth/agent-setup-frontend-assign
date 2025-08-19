from django.urls import path
from .views import (
    # AgentListView,  # Temporarily commented out until migrated
    OrganizationCreateView, OrganizationListView, OrganizationDetailView,
    UserRegisterView, UserListView, UserDetailView,
    AgentInstanceCreateView, AgentInstanceListView, AgentInstanceDetailView,
    DataSourceCreateView, DataSourceListView, DataSourceDetailView, DataSourceUploadView, DataSourceLinkView,
    DataSourceTestView, DataSourcePreviewView, DailyNarrativesView,
    AgentNarrativesView, HealthCheckView, AgentMetricsView, ArticleCreateView
)

urlpatterns = [
    # Agent endpoints - temporarily commented out until Agent model is migrated
    # path('agents/', AgentListView.as_view(), name='agent-list'),
    
    # Organization endpoints
    path('organizations/', OrganizationCreateView.as_view(), name='organization-create'),
    path('organizations/list/', OrganizationListView.as_view(), name='organization-list'),
    path('organizations/<int:id>/', OrganizationDetailView.as_view(), name='organization-detail'),
    
    # User endpoints
    path('users/register/', UserRegisterView.as_view(), name='user-register'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:id>/', UserDetailView.as_view(), name='user-detail'),
    
    # Agent Instance endpoints
    path('agent-instances/', AgentInstanceCreateView.as_view(), name='agent-instance-create'),
    path('agent-instances/list/', AgentInstanceListView.as_view(), name='agent-instance-list'),
    path('agent-instances/<int:id>/', AgentInstanceDetailView.as_view(), name='agent-instance-detail'),
    
    # Data Source endpoints
    path('data-sources/', DataSourceCreateView.as_view(), name='data-source-create'),
    path('data-sources/list/', DataSourceListView.as_view(), name='data-source-list'),
    path('data-sources/<uuid:id>/', DataSourceDetailView.as_view(), name='data-source-detail'),
    path('data-sources/upload/', DataSourceUploadView.as_view(), name='data-source-upload'),
    
    # Data Source linking and testing
    path('agent-instances/<int:instance_id>/datasources/', DataSourceLinkView.as_view(), name='data-source-link'),
    path('data-sources/<uuid:id>/test/', DataSourceTestView.as_view(), name='data-source-test'),
    path('data-sources/<uuid:id>/preview/', DataSourcePreviewView.as_view(), name='data-source-preview'),
    
    # Narrative and article endpoints
    path('narratives/daily/<str:date>/', DailyNarrativesView.as_view(), name='daily-narratives'),
    path('narratives/agent/<int:instance_id>/', AgentNarrativesView.as_view(), name='agent-narratives'),
    path('agent-instances/<int:instance_id>/articles/', ArticleCreateView.as_view(), name='article-create'),
    
    # Utility endpoints
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('agent-instances/<int:id>/metrics/', AgentMetricsView.as_view(), name='agent-metrics'),
]