from apscheduler.schedulers.background import BackgroundScheduler
from app.services.digital_twin_service import DigitalTwin

scheduler = BackgroundScheduler()


def start_scheduler():

    twin = DigitalTwin()

    scheduler.add_job(
        twin.update_live_data,
        trigger="interval",
        seconds=15,
        id="digital_twin",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )

    scheduler.start()

    print("🚀 Digital Twin Scheduler Started (Every 15 Seconds)")