# Agent Setup Project
for testing use configs in .env.examples

#orgianization creation 
![image alt](https://github.com/kaligatlayaswanth/agent-assignment/blob/52adf6d545edd4bc9ae9c2f6dccc811abcbb89c6/orgination%20creation.png)
#user creation
![image alt](https://github.com/kaligatlayaswanth/agent-assignment/blob/886c88a46180357c3100b765bea2b9d64df9ed91/user%20creation.png)

#agent instance creation
![image alt](https://github.com/kaligatlayaswanth/agent-assignment/blob/886c88a46180357c3100b765bea2b9d64df9ed91/agent%20instance.png)

#uploading data source
![image alt](https://github.com/kaligatlayaswanth/agent-assignment/blob/886c88a46180357c3100b765bea2b9d64df9ed91/data%20source%20upload.png)

#linking agent instance and data source
![image alt](https://github.com/kaligatlayaswanth/agent-assignment/blob/886c88a46180357c3100b765bea2b9d64df9ed91/linking%20agent%20with%20data.png)

#article generation
![image alt](https://github.com/kaligatlayaswanth/agent-assignment/blob/886c88a46180357c3100b765bea2b9d64df9ed91/creating%20articles%20endpoint.png)

#db tables
![image alt](https://github.com/kaligatlayaswanth/agent-assignment/blob/886c88a46180357c3100b765bea2b9d64df9ed91/db%20tables%20in%20psql.png)

## Overview
This is a Django-based REST API application for setting up agents that analyze CSV data sources and generate daily articles using LangChain with OpenRouter for content generation. The project supports creating organizations, users, agent instances, data sources (via CSV uploads), linking data sources to agents with dynamic column mapping, and generating articles either manually or via scheduled cron jobs. It uses PostgreSQL as the database and includes endpoints for testing and previewing data sources, retrieving articles, and monitoring health/metrics.

The application is designed for scenarios like financial or sales analysis, where multiple agents (e.g., Finance Agent, Sales Agent) can share the same data source but generate agent-specific articles.

## Features
- Dynamic CSV upload and column mapping.
- Agent-specific article generation with LangChain and OpenRouter.
- Scheduled article generation via cron jobs.
- Admin interface for model management.
- RESTful endpoints for all operations.
- Dockerized setup with PostgreSQL.

## Endpoints
All endpoints are prefixed with the base URL (e.g., `http://localhost:8000/`).

### 1. POST /organizations/
   - **Use**: Create a new organization.
   - **Example Request**:
     ```json
     {
         "name": "Tech Corp",
         "is_demo": false,
         "data_source_connected": false
     }
     ```
   - **Example Response** (201 Created):
     ```json
     {
         "name": "Tech Corp",
         "is_demo": false,
         "data_source_connected": false
     }
     ```

### 2. POST /users/register/
   - **Use**: Register a new user associated with an organization.
   - **Example Request**:
     ```json
     {
         "username": "admin_user",
         "email": "admin@techcorp.com",
         "password": "secure_password_123",
         "role": "admin",
         "organization_name": "Tech Corp"
     }
     ```
   - **Example Response** (201 Created):
     ```json
     {
         "username": "admin_user",
         "email": "admin@techcorp.com",
         "role": "admin",
         "organization_name": "Tech Corp"
     }
     ```

### 3. POST /agent-instances/
   - **Use**: Create a new agent instance (e.g., Finance or Sales Agent).
   - **Example Request**:
     ```json
     {
         "agent_id": 1,
         "organization": 1,
         "agent_instance_name": "Finance Agent",
         "configuration": {
             "article_count": 5,
             "tone": "professional",
             "schedule": "daily"
         }
     }
     ```
   - **Example Response** (201 Created):
     ```json
     {
         "agent_id": 1,
         "organization": 1,
         "agent_instance_name": "Finance Agent",
         "configuration": {
             "article_count": 5,
             "tone": "professional",
             "schedule": "daily"
         },
         "datasource": null,
         "mapping_config": {}
     }
     ```

### 4. POST /data-sources/
   - **Use**: Upload a CSV file as a data source (dynamically generates fields like name, date_column).
   - **Example Request** (Form-data):
     - `file`: Upload `sample_data.csv`
   - **Example Response** (201 Created):
     ```json
     {
         "name": "sample_data",
         "source_type": "csv",
         "file": "uploads/sample_data.csv",
         "connection_params": {"delimiter": ",", "encoding": "utf-8"},
         "table_name": "sample_data",
         "date_column": "date",
         "description": "Data source for sample_data"
     }
     ```

### 5. POST /data-sources/upload/
   - **Use**: Alternative endpoint for uploading a data source (same as /data-sources/).
   - **Example Request**: Same as /data-sources/.
   - **Example Response**: Same as /data-sources/.

### 6. POST /agent-instances/{instance_id}/datasources/
   - **Use**: Link a data source to an agent instance and set/auto-generate mapping_config from CSV columns.
   - **Example Request**:
     ```json
     {
         "datasource_id": "e789254f-6797-45ef-a1ba-e9de53201aea",
         "mapping_config": {}
     }
     ```
   - **Example Response** (200 OK):
     ```json
     {
         "status": "linked",
         "instance_id": 1,
         "datasource_id": "e789254f-6797-45ef-a1ba-e9de53201aea",
         "mapping_config": {
             "date_column": "date",
             "metric_columns": ["revenue", "orders", "customers", "avg_order_value", "customer_satisfaction"],
             "category_columns": ["product_category", "region"]
         }
     }
     ```

### 7. GET /data-sources/{id}/test/
   - **Use**: Test the data source (returns row count from CSV).
   - **Example Request**: GET `http://localhost:8000/data-sources/e789254f-6797-45ef-a1ba-e9de53201aea/test/`
   - **Example Response** (200 OK):
     ```json
     {"status": "success", "row_count": 5}
     ```

### 8. GET /data-sources/{id}/preview/
   - **Use**: Preview the first few rows of the CSV.
   - **Example Request**: GET `http://localhost:8000/data-sources/e789254f-6797-45ef-a1ba-e9de53201aea/preview/`
   - **Example Response** (200 OK):
     ```json
     [
         {"date": "2025-08-01", "revenue": 100000, "orders": 500, "customers": 200, "avg_order_value": 200.00, "customer_satisfaction": 4.8, "product_category": "Software", "region": "North America"},
         ...
     ]
     ```

### 9. GET /narratives/daily/{date}/
   - **Use**: Retrieve articles generated on a specific date.
   - **Example Request**: GET `http://localhost:8000/narratives/daily/2025-08-18/`
   - **Example Response** (200 OK):
     ```json
     {
         "date": "2025-08-18",
         "articles": [
             {
                 "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                 "title": "Finance Agent Report 1 - 2025-08-18",
                 "content": "This professional financial analysis for Finance Agent highlights key trends. Revenue averaged 107000.00 with an increasing trend. Orders (mean: 540.00) and customers (mean: 215.00) show growth, while customer satisfaction remains high at 4.8.",
                 "agent_instance": 1,
                 "created_at": "2025-08-18T05:21:00Z"
             },
             ...
         ]
     }
     ```

### 10. GET /narratives/agent/{instance_id}/
   - **Use**: Retrieve all articles for a specific agent instance.
   - **Example Request**: GET `http://localhost:8000/narratives/agent/1/`
   - **Example Response** (200 OK):
     ```json
     {
         "agent_instance_id": 1,
         "articles": [
             {
                 "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                 "title": "Finance Agent Report 1 - 2025-08-18",
                 "content": "This professional financial analysis for Finance Agent highlights key trends. Revenue averaged 107000.00 with an increasing trend. Orders (mean: 540.00) and customers (mean: 215.00) show growth, while customer satisfaction remains high at 4.8.",
                 "agent_instance": 1,
                 "created_at": "2025-08-18T05:21:00Z"
             },
             ...
         ]
     }
     ```

### 11. GET /health/
   - **Use**: Check the server's health and database connection.
   - **Example Request**: GET `http://localhost:8000/health/`
   - **Example Response** (200 OK):
     ```json
     {
         "status": "healthy",
         "database": "connected"
     }
     ```

### 12. GET /agent-instances/{id}/metrics/
   - **Use**: Retrieve metrics for an agent instance (e.g., total articles, last run).
   - **Example Request**: GET `http://localhost:8000/agent-instances/1/metrics/`
   - **Example Response** (200 OK):
     ```json
     {
         "agent_instance_id": 1,
         "total_articles": 5,
         "last_run": "2025-08-18T05:21:00Z"
     }
     ```

### 13. POST /agent-instances/{instance_id}/articles/
   - **Use**: Generate articles manually for an agent instance.
   - **Example Request**:
     ```json
     {
         "agent_instance_id": 1,
         "articles": []
     }
     ```
   - **Example Response** (201 Created):
     ```json
     {
         "agent_instance_id": 1,
         "articles": [
             {
                 "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                 "title": "Finance Agent Report 1 - 2025-08-18",
                 "content": "This professional financial analysis for Finance Agent highlights key trends. Revenue averaged 107000.00 with an increasing trend. Orders (mean: 540.00) and customers (mean: 215.00) show growth, while customer satisfaction remains high at 4.8.",
                 "agent_instance": 1,
                 "created_at": "2025-08-18T05:21:00Z"
             },
             ...
         ]
     }
     ```

## Setup Instructions
### Prerequisites
- Python 3.9+
- Docker and Docker Compose
- Git
- OpenRouter API key (for article generation)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd agent_setup
```

### 2. Install Dependencies (Local Setup)
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Set Environment Variables
Create `.env` in the root directory:
```
OPENROUTER_API_KEY=your-openrouter-api-key
DJANGO_SECRET_KEY=your-secret-key
DEBUG=True
POSTGRES_DB=agent_db
POSTGRES_USER=agent_user
POSTGRES_PASSWORD=agent_password
POSTGRES_HOST=db
POSTGRES_PORT=5432
```

### 4. Run Migrations and Create Superuser
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 5. Run the Server (Local)
```bash
python manage.py runserver
```
- Access the admin at `http://localhost:8000/admin/` (login with superuser credentials).
- Access endpoints at `http://localhost:8000/`.

### 6. Docker Setup (Production-like)
- Build and run:
  ```bash
  docker-compose up --build
  ```
- Create superuser:
  ```bash
  docker-compose exec web python manage.py createsuperuser
  ```
- Access at `http://localhost:8000/`.

### 7. Schedule Cron Jobs
- Add cron jobs:
  ```bash
  docker-compose exec web python manage.py crontab add
  ```
- Verify logs:
  ```bash
  docker-compose exec cron cat /app/cron.log
  ```

### 8. Test with Postman
- Import the endpoints as a Postman collection.
- Example flow:
  1. Create organization: `POST /organizations/`.
  2. Register user: `POST /users/register/`.
  3. Create agent: `POST /agent-instances/`.
  4. Upload CSV: `POST /data-sources/`.
  5. Link data source: `POST /agent-instances/{instance_id}/datasources/`.
  6. Generate articles: `POST /agent-instances/{instance_id}/articles/`.

## License
MIT License. See LICENSE file for details.
