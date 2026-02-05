"""Kafka consumers package."""
from consumers.notification_service import NotificationService, run_notification_service

__all__ = ["NotificationService", "run_notification_service"]
