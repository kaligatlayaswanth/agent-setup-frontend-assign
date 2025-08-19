from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_openai import ChatOpenAI
import pandas as pd
from .models import Article
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set OpenRouter API key and endpoint
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "your-openrouter-api-key")
OPENROUTER_API_BASE = "https://openrouter.ai/api/v1"

def generate_articles(agent_instance):
    """
    Generate articles for the given AgentInstance based on its linked data source using LangChain with OpenRouter for dynamic content creation.
    Uses dynamic columns from mapping_config.
    Returns the number of articles created.
    """
    print(f"=== Starting article generation for agent {agent_instance.id} ===")
    
    config = agent_instance.configuration
    article_count = config.get('article_count', 5)
    mapping_config = agent_instance.mapping_config
    datasource = agent_instance.datasource

    print(f"Article count: {article_count}")
    print(f"Mapping config: {mapping_config}")
    print(f"Has datasource: {bool(datasource)}")

    if not datasource or datasource.source_type != 'csv' or not datasource.file:
        print(f"No valid CSV data source for agent {agent_instance.id}")
        return 0

    if not mapping_config or not mapping_config.get('metric_columns'):
        print(f"No valid mapping_config for agent {agent_instance.id}")
        return 0

    try:
        print(f"Reading CSV file: {datasource.file.path}")
        
        # Read CSV
        df = pd.read_csv(
            datasource.file.path,
            delimiter=datasource.connection_params.get('delimiter', ','),
            encoding=datasource.connection_params.get('encoding', 'utf-8')
        )
        
        print(f"CSV loaded successfully. Rows: {len(df)}, Columns: {list(df.columns)}")
        
        if df.empty:
            print(f"CSV file is empty for agent {agent_instance.id}")
            return 0

        # Perform comprehensive data analysis based on agent type
        analysis_results = perform_comprehensive_analysis(df, mapping_config, agent_instance.agent_instance_name)
        print(f"Comprehensive analysis completed: {len(analysis_results)} insights found")

        # Check if we have the OpenRouter API key
        if OPENROUTER_API_KEY == "your-openrouter-api-key":
            print("WARNING: OpenRouter API key not set. Using intelligent default content instead.")
            articles_created = create_intelligent_default_articles(agent_instance, analysis_results, article_count)
            print(f"=== Article generation completed with intelligent default content: {articles_created} articles ===")
            return articles_created

        print("Setting up LangChain with OpenRouter for intelligent article generation...")
        
        try:
            # LangChain setup for intelligent article generation
            llm = ChatOpenAI(
                model_name="openai/gpt-3.5-turbo",
                openai_api_key=OPENROUTER_API_KEY,
                openai_api_base=OPENROUTER_API_BASE,
                temperature=0.7
            )
            
            # Create agent-specific prompts
            prompt_template = create_agent_specific_prompt(agent_instance.agent_instance_name)
            chain = LLMChain(llm=llm, prompt=prompt_template)

            print("Generating intelligent articles with LangChain...")
            
            # Generate intelligent articles
            articles_created = 0
            for i in range(article_count):
                title = f"{agent_instance.agent_instance_name} Analysis Report {i+1} - {datetime.now().strftime('%Y-%m-%d')}"
                
                # Create rich analysis context for the AI
                analysis_context = create_analysis_context(analysis_results, agent_instance.agent_instance_name)
                
                print(f"Generating intelligent article {i+1} for {agent_instance.agent_instance_name}...")
                
                # Run LangChain chain for intelligent content
                langchain_response = chain.run(
                    agent_name=agent_instance.agent_instance_name,
                    analysis=analysis_context,
                    report_number=i+1
                )
                content = langchain_response.strip()
                
                print(f"Intelligent content generated for article {i+1}")

                Article.objects.create(
                    id=uuid.uuid4(),
                    title=title,
                    content=content,
                    agent_instance=agent_instance
                )
                articles_created += 1
                print(f"Created intelligent article {i+1} successfully")

            print(f"=== Intelligent article generation completed with LangChain: {articles_created} articles ===")
            return articles_created
            
        except Exception as api_error:
            print(f"OpenRouter API failed: {str(api_error)}")
            print("Falling back to intelligent default content generation...")
            
            articles_created = create_intelligent_default_articles(agent_instance, analysis_results, article_count)
            print(f"=== Article generation completed with intelligent default content: {articles_created} articles ===")
            return articles_created

    except Exception as e:
        print(f"ERROR generating articles for agent {agent_instance.id}: {str(e)}")
        import traceback
        traceback.print_exc()
        return 0

def perform_comprehensive_analysis(df, mapping_config, agent_name):
    """
    Perform comprehensive data analysis based on agent type and data source.
    Returns insights, trends, and patterns relevant to the agent's expertise.
    """
    analysis = {}
    
    # Get key columns
    metric_columns = mapping_config.get('metric_columns', [])
    date_column = mapping_config.get('date_column', df.columns[0])
    category_columns = mapping_config.get('category_columns', [])
    
    print(f"Performing comprehensive analysis for {agent_name}")
    print(f"Metric columns: {metric_columns}")
    print(f"Category columns: {category_columns}")
    
    # Basic statistical analysis
    for metric in metric_columns:
        if metric in df.columns:
            mean_val = df[metric].mean()
            max_val = df[metric].max()
            min_val = df[metric].min()
            std_val = df[metric].std()
            
            # Trend analysis
        recent_data = df.sort_values(by=date_column).tail(5)
        if len(recent_data) >= 2:
            recent_trend = recent_data[metric].iloc[-1] - recent_data[metric].iloc[0]
            trend_direction = 'increasing' if recent_trend > 0 else 'decreasing'
            trend_strength = abs(recent_trend) / mean_val if mean_val > 0 else 0
        else:
            trend_direction = 'stable'
            trend_strength = 0
            
            # Growth rate calculation
            if len(df) >= 2:
                first_value = df.sort_values(by=date_column)[metric].iloc[0]
                last_value = df.sort_values(by=date_column)[metric].iloc[-1]
                growth_rate = ((last_value - first_value) / first_value * 100) if first_value > 0 else 0
            else:
                growth_rate = 0
            
                analysis[metric] = {
                    'mean': mean_val,
                    'max': max_val,
                    'min': min_val,
                'std': std_val,
                'trend_direction': trend_direction,
                'trend_strength': trend_strength,
                'growth_rate': growth_rate,
                'recent_values': recent_data[metric].tolist() if len(recent_data) > 0 else []
            }
    
    # Category analysis for sales insights
    if agent_name.lower() in ['sales', 'sales agent', 'sales team']:
        for category in category_columns:
            if category in df.columns:
                category_counts = df[category].value_counts()
                category_performance = {}
                
                for cat_name in category_counts.index[:5]:  # Top 5 categories
                    cat_data = df[df[category] == cat_name]
                    if 'revenue' in df.columns:
                        cat_revenue = cat_data['revenue'].sum()
                        category_performance[cat_name] = {
                            'count': len(cat_data),
                            'total_revenue': cat_revenue,
                            'avg_revenue': cat_revenue / len(cat_data) if len(cat_data) > 0 else 0
                        }
                
                analysis[f'{category}_insights'] = category_performance
    
    # Financial analysis for finance agents
    if agent_name.lower() in ['finance', 'finance agent', 'financial']:
        if 'revenue' in df.columns and 'orders' in df.columns:
            # Profitability analysis
            df['profit_margin'] = (df['revenue'] / df['orders']).fillna(0)
            analysis['profitability'] = {
                'avg_profit_margin': df['profit_margin'].mean(),
                'profit_trend': 'increasing' if df['profit_margin'].iloc[-1] > df['profit_margin'].iloc[0] else 'decreasing'
            }
            
            # Cash flow analysis
            if len(df) >= 2:
                revenue_trend = df.sort_values(by=date_column)['revenue'].diff().mean()
                analysis['cash_flow'] = {
                    'avg_daily_revenue_change': revenue_trend,
                    'cash_flow_stability': 'stable' if abs(revenue_trend) < df['revenue'].mean() * 0.1 else 'volatile'
                }
    
    # Marketing analysis for marketing agents
    if agent_name.lower() in ['marketing', 'marketing agent', 'marketing team', 'digital marketing']:
        # Customer acquisition analysis
        if 'customers' in df.columns and 'revenue' in df.columns:
            df['customer_acquisition_cost'] = (df['revenue'] / df['customers']).fillna(0)
            analysis['marketing_metrics'] = {
                'avg_customer_acquisition_cost': df['customer_acquisition_cost'].mean(),
                'customer_lifetime_value': df['revenue'].sum() / df['customers'].sum() if df['customers'].sum() > 0 else 0,
                'conversion_rate': (df['orders'].sum() / df['customers'].sum() * 100) if 'orders' in df.columns and df['customers'].sum() > 0 else 0
            }
        
        # Campaign performance analysis
        if 'product_category' in df.columns:
            category_performance = df.groupby('product_category').agg({
                'revenue': ['sum', 'mean', 'count'],
                'customers': 'sum' if 'customers' in df.columns else 'count'
            }).round(2)
            analysis['campaign_performance'] = category_performance.to_dict()
        
        # Market penetration analysis
        if 'region' in df.columns:
            region_penetration = df.groupby('region').agg({
                'customers': 'sum' if 'customers' in df.columns else 'count',
                'revenue': 'sum'
            }).round(2)
            analysis['market_penetration'] = region_penetration.to_dict()
    
    # Regional analysis if region data exists
    if 'region' in df.columns:
        region_performance = df.groupby('region').agg({
            'revenue': ['sum', 'mean', 'count']
        }).round(2)
        analysis['regional_insights'] = region_performance.to_dict()
    
    # Seasonal patterns
    if date_column in df.columns:
        try:
            df[date_column] = pd.to_datetime(df[date_column])
            df['month'] = df[date_column].dt.month
            monthly_trends = df.groupby('month')['revenue'].mean() if 'revenue' in df.columns else df.groupby('month')[metric_columns[0]].mean()
            analysis['seasonal_patterns'] = monthly_trends.to_dict()
        except:
            pass
    
    print(f"Comprehensive analysis completed with {len(analysis)} insights")
    return analysis

def create_agent_specific_prompt(agent_name):
    """
    Create agent-specific prompts for intelligent article generation.
    """
    if agent_name.lower() in ['finance', 'finance agent', 'financial']:
        template = """
        You are a {agent_name}, a financial analyst expert. Create a professional financial analysis article based on the following data insights: {analysis}
        
        Your article should include:
        1. Executive Summary with key financial metrics
        2. Trend Analysis showing financial performance patterns
        3. Risk Assessment and opportunities
        4. Strategic Recommendations for financial growth
        5. Market insights and external factors affecting performance
        
        Make it insightful, professional, and actionable. Include specific data points and percentages where relevant.
        Focus on financial trends, profitability, cash flow, and strategic financial insights.
        """
    elif agent_name.lower() in ['sales', 'sales agent', 'sales team']:
        template = """
        You are a {agent_name}, a sales performance expert. Create a professional sales analysis article based on the following data insights: {analysis}
        
        Your article should include:
        1. Sales Performance Overview with key metrics
        2. Customer Behavior Analysis and insights
        3. Product Performance and category analysis
        4. Regional Sales Trends and opportunities
        5. Sales Strategy Recommendations and growth opportunities
        
        Make it insightful, professional, and actionable. Include specific data points and percentages where relevant.
        Focus on sales trends, customer insights, product performance, and strategic sales opportunities.
        """
    elif agent_name.lower() in ['marketing', 'marketing agent', 'marketing team', 'digital marketing']:
        template = """
        You are a {agent_name}, a marketing performance expert. Create a professional marketing analysis article based on the following data insights: {analysis}
        
        Your article should include:
        1. Marketing Performance Overview with key metrics
        2. Customer Acquisition Analysis and conversion insights
        3. Campaign Performance and ROI analysis
        4. Market Trends and competitive insights
        5. Marketing Strategy Recommendations and growth opportunities
        
        Make it insightful, professional, and actionable. Include specific data points and percentages where relevant.
        Focus on marketing ROI, customer acquisition costs, conversion rates, and strategic marketing opportunities.
        """
    else:
        template = """
        You are a {agent_name}, a business intelligence expert. Create a professional business analysis article based on the following data insights: {analysis}
        
        Your article should include:
        1. Business Performance Overview with key metrics
        2. Trend Analysis showing performance patterns
        3. Strategic Insights and opportunities
        4. Recommendations for business growth
        5. Market analysis and external factors
        
        Make it insightful, professional, and actionable. Include specific data points and percentages where relevant.
        Focus on business trends, performance insights, and strategic opportunities.
        """
    
    return PromptTemplate(
        input_variables=["agent_name", "analysis", "report_number"],
        template=template
    )

def create_analysis_context(analysis_results, agent_name):
    """
    Create rich analysis context for AI article generation.
    """
    context_parts = []
    
    # Add key metrics summary
    if 'revenue' in analysis_results:
        revenue_data = analysis_results['revenue']
        context_parts.append(f"Revenue Analysis: Average ${revenue_data['mean']:,.2f}, Growth Rate: {revenue_data['growth_rate']:.1f}%, Trend: {revenue_data['trend_direction']}")
    
    if 'orders' in analysis_results:
        orders_data = analysis_results['orders']
        context_parts.append(f"Order Analysis: Average {orders_data['mean']:.0f} orders, Trend: {orders_data['trend_direction']}, Growth: {orders_data['growth_rate']:.1f}%")
    
    if 'customers' in analysis_results:
        customers_data = analysis_results['customers']
        context_parts.append(f"Customer Analysis: Average {customers_data['mean']:.0f} customers, Trend: {customers_data['trend_direction']}")
    
    # Add category insights for sales agents
    if agent_name.lower() in ['sales', 'sales agent']:
        for key, value in analysis_results.items():
            if 'insights' in key and isinstance(value, dict):
                context_parts.append(f"{key.replace('_insights', '').title()} Performance: {len(value)} categories analyzed")
    
    # Add financial insights for finance agents
    if agent_name.lower() in ['finance', 'finance agent']:
        if 'profitability' in analysis_results:
            prof_data = analysis_results['profitability']
            context_parts.append(f"Profitability: Average margin {prof_data['avg_profit_margin']:.2f}, Trend: {prof_data['profit_trend']}")
        
        if 'cash_flow' in analysis_results:
            cash_data = analysis_results['cash_flow']
            context_parts.append(f"Cash Flow: Daily change ${cash_data['avg_daily_revenue_change']:.2f}, Stability: {cash_data['cash_flow_stability']}")
    
    # Add marketing insights for marketing agents
    if agent_name.lower() in ['marketing', 'marketing agent', 'marketing team', 'digital marketing']:
        if 'marketing_metrics' in analysis_results:
            marketing_data = analysis_results['marketing_metrics']
            context_parts.append(f"Marketing Metrics: Average Customer Acquisition Cost ${marketing_data['avg_customer_acquisition_cost']:.2f}, Conversion Rate {marketing_data['conversion_rate']:.1f}%")
        
        if 'campaign_performance' in analysis_results:
            context_parts.append(f"Campaign Performance: {len(analysis_results['campaign_performance'])} product categories analyzed")
        
        if 'market_penetration' in analysis_results:
            context_parts.append(f"Market Penetration: {len(analysis_results['market_penetration'])} regions analyzed")
    
    # Add regional insights
    if 'regional_insights' in analysis_results:
        context_parts.append(f"Regional Analysis: {len(analysis_results['regional_insights'])} regions with performance data")
    
    # Add seasonal patterns
    if 'seasonal_patterns' in analysis_results:
        seasonal_data = analysis_results['seasonal_patterns']
        best_month = max(seasonal_data, key=seasonal_data.get)
        worst_month = min(seasonal_data, key=seasonal_data.get)
        context_parts.append(f"Seasonal Patterns: Best performance in month {best_month}, lowest in month {worst_month}")
    
    return "\n".join(context_parts)

def create_intelligent_default_articles(agent_instance, analysis_results, article_count):
    """
    Create intelligent default articles when AI API is not available.
    These articles are still data-driven and agent-specific.
    """
    articles_created = 0
    
    for i in range(article_count):
        title = f"{agent_instance.agent_instance_name} Analysis Report {i+1} - {datetime.now().strftime('%Y-%m-%d')}"
        
        # Create intelligent content based on agent type and analysis
        if agent_instance.agent_instance_name.lower() in ['finance', 'finance agent', 'financial']:
            content = create_finance_article_content(agent_instance, analysis_results, i+1)
        elif agent_instance.agent_instance_name.lower() in ['sales', 'sales agent', 'sales team']:
            content = create_sales_article_content(agent_instance, analysis_results, i+1)
        elif agent_instance.agent_instance_name.lower() in ['marketing', 'marketing agent', 'marketing team', 'digital marketing']:
            content = create_marketing_article_content(agent_instance, analysis_results, i+1)
        else:
            content = create_general_article_content(agent_instance, analysis_results, i+1)

            Article.objects.create(
                id=uuid.uuid4(),
                title=title,
                content=content,
                agent_instance=agent_instance
            )
            articles_created += 1
        print(f"Created intelligent default article {i+1} for {agent_instance.agent_instance_name}")

        return articles_created

def create_finance_article_content(agent_instance, analysis_results, report_num):
    """Create finance-specific article content."""
    content_parts = []
    
    # Executive Summary
    if 'revenue' in analysis_results:
        revenue_data = analysis_results['revenue']
        content_parts.append(f"Executive Summary: Financial performance shows {revenue_data['trend_direction']} trend with {revenue_data['growth_rate']:.1f}% overall growth.")
    
    # Financial Metrics
    metrics_summary = []
    for metric, data in analysis_results.items():
        if isinstance(data, dict) and 'mean' in data:
            metrics_summary.append(f"{metric.title()}: ${data['mean']:,.2f} (trend: {data['trend_direction']})")
    
    if metrics_summary:
        content_parts.append(f"Key Financial Metrics: {'; '.join(metrics_summary)}")
    
    # Profitability Analysis
    if 'profitability' in analysis_results:
        prof_data = analysis_results['profitability']
        content_parts.append(f"Profitability Analysis: Average profit margin is {prof_data['avg_profit_margin']:.2f} with {prof_data['profit_trend']} trend.")
    
    # Strategic Insights
    if 'revenue' in analysis_results and analysis_results['revenue']['growth_rate'] > 0:
        content_parts.append("Strategic Insight: Positive revenue growth indicates strong market position. Consider reinvesting profits in growth initiatives.")
    else:
        content_parts.append("Strategic Insight: Revenue challenges detected. Focus on cost optimization and revenue diversification strategies.")
    
    # Recommendations
    content_parts.append("Recommendations: 1) Monitor cash flow trends closely, 2) Analyze seasonal patterns for budget planning, 3) Review pricing strategies based on profit margins.")
    
    return " ".join(content_parts)

def create_sales_article_content(agent_instance, analysis_results, report_num):
    """Create sales-specific article content."""
    content_parts = []
    
    # Sales Performance Overview
    if 'revenue' in analysis_results:
        revenue_data = analysis_results['revenue']
        content_parts.append(f"Sales Performance Overview: Revenue shows {revenue_data['trend_direction']} trend with {revenue_data['growth_rate']:.1f}% growth.")
    
    # Customer Insights
    if 'customers' in analysis_results:
        customer_data = analysis_results['customers']
        content_parts.append(f"Customer Insights: Average {customer_data['mean']:.0f} customers with {customer_data['trend_direction']} trend.")
    
    # Product Performance
    for key, value in analysis_results.items():
        if 'insights' in key and isinstance(value, dict):
            top_category = max(value.items(), key=lambda x: x[1].get('total_revenue', 0))[0] if value else "N/A"
            content_parts.append(f"Product Performance: {key.replace('_insights', '').title()} shows {top_category} as top performer.")
    
    # Regional Analysis
    if 'regional_insights' in analysis_results:
        content_parts.append(f"Regional Performance: {len(analysis_results['regional_insights'])} regions analyzed for sales optimization opportunities.")
    
    # Sales Strategy
    if 'revenue' in analysis_results and analysis_results['revenue']['trend_direction'] == 'increasing':
        content_parts.append("Sales Strategy: Strong upward trend suggests effective sales strategies. Focus on scaling successful approaches.")
    else:
        content_parts.append("Sales Strategy: Identify and address sales bottlenecks. Consider new market segments and product offerings.")
    
    # Recommendations
    content_parts.append("Recommendations: 1) Leverage top-performing categories, 2) Optimize regional sales strategies, 3) Enhance customer acquisition campaigns.")
    
    return " ".join(content_parts)

def create_marketing_article_content(agent_instance, analysis_results, report_num):
    """Create marketing-specific article content."""
    content_parts = []
    
    # Marketing Performance Overview
    if 'revenue' in analysis_results:
        revenue_data = analysis_results['revenue']
        content_parts.append(f"Marketing Performance Overview: Revenue shows {revenue_data['trend_direction']} trend with {revenue_data['growth_rate']:.1f}% growth.")
    
    # Customer Acquisition Analysis
    if 'marketing_metrics' in analysis_results:
        marketing_data = analysis_results['marketing_metrics']
        content_parts.append(f"Customer Acquisition: Average Customer Acquisition Cost ${marketing_data['avg_customer_acquisition_cost']:.2f}, Conversion Rate {marketing_data['conversion_rate']:.1f}%")
    
    # Campaign Performance
    if 'campaign_performance' in analysis_results:
        context_parts = []
        for category, data in analysis_results['campaign_performance'].items():
            context_parts.append(f"Campaign Performance for {category.title()}: Revenue ${data['sum']:.2f}, Avg Revenue ${data['mean']:.2f}, Count {data['count']}")
        content_parts.append(f"Campaign Performance: {'; '.join(context_parts)}")
    
    # Market Penetration
    if 'market_penetration' in analysis_results:
        context_parts = []
        for region, data in analysis_results['market_penetration'].items():
            context_parts.append(f"Market Penetration for {region.title()}: Customers {data['sum']:.0f}, Revenue ${data['sum']:.2f}")
        content_parts.append(f"Market Penetration: {'; '.join(context_parts)}")
    
    # Recommendations
    content_parts.append("Recommendations: 1) Optimize customer acquisition channels for lower costs, 2) Focus on high-ROI campaigns, 3) Expand market penetration in regions with potential.")
    
    return " ".join(content_parts)

def create_general_article_content(agent_instance, analysis_results, report_num):
    """Create general business analysis article content."""
    content_parts = []
    
    # Business Performance
    if 'revenue' in analysis_results:
        revenue_data = analysis_results['revenue']
        content_parts.append(f"Business Performance: Revenue shows {revenue_data['trend_direction']} trend with {revenue_data['growth_rate']:.1f}% growth.")
    
    # Key Metrics
    metrics_summary = []
    for metric, data in analysis_results.items():
        if isinstance(data, dict) and 'mean' in data:
            metrics_summary.append(f"{metric.title()}: {data['mean']:.2f} (trend: {data['trend_direction']})")
    
    if metrics_summary:
        content_parts.append(f"Key Business Metrics: {'; '.join(metrics_summary)}")
    
    # Market Insights
    if 'seasonal_patterns' in analysis_results:
        content_parts.append("Market Insights: Seasonal patterns identified for strategic planning and resource allocation.")
    
    # Strategic Analysis
    if 'revenue' in analysis_results and analysis_results['revenue']['growth_rate'] > 0:
        content_parts.append("Strategic Analysis: Positive business momentum indicates effective strategies. Focus on scaling and optimization.")
    else:
        content_parts.append("Strategic Analysis: Business challenges detected. Focus on operational efficiency and market expansion.")
    
    # Recommendations
    content_parts.append("Strategic Recommendations: 1) Optimize operational processes, 2) Leverage data insights for decision making, 3) Focus on growth opportunities.")
    
    return " ".join(content_parts)