from .models import AgentInstance
from .utils import generate_articles

def generate_daily_articles():
    """
    Cron job to generate articles for all agents with daily schedule.
    """
    agents = AgentInstance.objects.filter(configuration__schedule='daily')
    for agent in agents:
        generate_articles(agent)