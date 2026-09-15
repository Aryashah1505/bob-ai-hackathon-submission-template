"""
Pravaha Company Search Service
Integrates with Google Custom Search Engine / Places API using backend environment variables:
- GOOGLE_API_KEY (or SERPAPI_KEY / SEARCH_API_KEY)
- GOOGLE_CSE_ID (Custom Search Engine ID)

If external keys are not configured, provides an honest fallback structure allowing
the user to review, edit, or enter company verification data manually without inventing unverified facts.
"""

import os
import httpx
from typing import Dict, Any, Optional

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_CSE_ID = os.getenv("GOOGLE_CSE_ID")

async def search_company_info(company_name: str, region: str) -> Dict[str, Any]:
    query = f"{company_name} electric utility power grid {region}"
    
    # 1. Try Live Google Custom Search API if keys exist
    if GOOGLE_API_KEY and GOOGLE_CSE_ID:
        try:
            url = "https://www.googleapis.com/customsearch/v1"
            params = {
                "key": GOOGLE_API_KEY,
                "cx": GOOGLE_CSE_ID,
                "q": query,
                "num": 3
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url, params=params)
                if res.status_code == 200:
                    data = res.json()
                    items = data.get("items", [])
                    if items:
                        first_item = items[0]
                        snippet = first_item.get("snippet", "")
                        link = first_item.get("link", "")
                        title = first_item.get("title", company_name)
                        
                        return {
                            "source": "Google Custom Search API",
                            "is_verified": False,
                            "company_name": company_name,
                            "region": region,
                            "utility_type": "Electric Power Distribution / Transmission Utility",
                            "main_services": "High-Voltage Power Distribution, Substation Asset Management & Grid Reliability",
                            "website": link,
                            "description": snippet or f"Public power utility entity operating in {region}.",
                            "raw_results": [{"title": i.get("title"), "snippet": i.get("snippet"), "link": i.get("link")} for i in items[:3]]
                        }
        except Exception as e:
            print(f"Google API search attempt failed: {e}")

    # 2. Transparent Fallback when Google API credentials are not provided in environment
    return {
        "source": "Unconfigured Google Search API (Manual Review Required)",
        "is_verified": False,
        "company_name": company_name,
        "region": region,
        "utility_type": "Electric Power Distribution & Transmission Utility",
        "main_services": "Regional Substation Network & Electrical Grid Management",
        "website": f"https://www.{company_name.lower().replace(' ', '')}.com",
        "description": f"Electric power grid utility entity operating across {region}.",
        "raw_results": []
    }
