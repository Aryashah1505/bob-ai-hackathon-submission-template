"""
Pravaha Alert & SMS Notification Service
Integrates with Twilio or standard SMS gateways using backend environment variables:
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER
- RECIPIENT_PHONE_NUMBER (default alert phone number)

If SMS credentials are not configured, transparently records alerts in logs and dashboard
without falsely claiming an SMS was transmitted.
"""

import os
from datetime import datetime
from typing import Dict, Any, Optional

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# In-memory notification audit log & duplicate prevention cache
# Structure: (asset_name, threat_type): timestamp
_SENT_NOTIFICATIONS_CACHE = {}
_NOTIFICATION_LOGS = []

DUPLICATE_INTERVAL_SECONDS = 300  # 5 minutes suppression window

async def send_threat_notification(
    company_name: str,
    asset_name: str,
    threat_type: str,
    risk_level: str,
    risk_score: float,
    reason: str,
    recommended_action: str,
    target_phone: Optional[str] = None,
    notification_mode: str = "Both"  # 'Dashboard Alert', 'SMS Notification', 'Both'
) -> Dict[str, Any]:
    now = datetime.utcnow()
    cache_key = f"{asset_name}_{threat_type}_{risk_level}"

    # Check duplicate window
    last_sent = _SENT_NOTIFICATIONS_CACHE.get(cache_key)
    if last_sent:
        elapsed = (now - last_sent).total_seconds()
        if elapsed < DUPLICATE_INTERVAL_SECONDS:
            return {
                "status": "suppressed_duplicate",
                "message": f"Duplicate notification suppressed within {int(DUPLICATE_INTERVAL_SECONDS - elapsed)}s window.",
                "timestamp": now.isoformat()
            }

    message_body = (
        f"🚨 PRAVAHA GRID ALERT [{risk_level.upper()} - {risk_score:.0f}%]\n"
        f"Company: {company_name}\n"
        f"Asset: {asset_name}\n"
        f"Threat: {threat_type}\n"
        f"Reason: {reason}\n"
        f"Action: {recommended_action}\n"
        f"Time: {now.strftime('%Y-%m-%d %H:%M:%S UTC')}"
    )

    sms_sent = False
    sms_provider_status = "No SMS Gateway Configured (Dashboard Only)"

    # Check if Twilio configured
    if notification_mode in ["SMS Notification", "Both"] and target_phone and TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER:
        try:
            from twilio.rest import Client
            client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            twilio_msg = client.messages.create(
                body=message_body,
                from_=TWILIO_PHONE_NUMBER,
                to=target_phone
            )
            sms_sent = True
            sms_provider_status = f"Sent via Twilio (SID: {twilio_msg.sid})"
        except Exception as e:
            sms_provider_status = f"Twilio Transmission Failed: {str(e)}"
    elif notification_mode in ["SMS Notification", "Both"] and target_phone:
        sms_provider_status = "SMS Credentials (TWILIO_ACCOUNT_SID) not set in backend .env. Alert stored on dashboard."

    _SENT_NOTIFICATIONS_CACHE[cache_key] = now
    
    log_entry = {
        "timestamp": now.isoformat(),
        "company_name": company_name,
        "asset_name": asset_name,
        "threat_type": threat_type,
        "risk_level": risk_level,
        "risk_score": risk_score,
        "notification_mode": notification_mode,
        "target_phone": target_phone or "None",
        "sms_sent": sms_sent,
        "provider_status": sms_provider_status,
        "message_body": message_body
    }
    _NOTIFICATION_LOGS.append(log_entry)

    return {
        "status": "success",
        "sms_sent": sms_sent,
        "provider_status": sms_provider_status,
        "notification_mode": notification_mode,
        "timestamp": now.isoformat(),
        "message_preview": message_body
    }

def get_notification_logs():
    return _NOTIFICATION_LOGS
