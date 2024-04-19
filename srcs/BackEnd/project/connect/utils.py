from bug_report.models import BugReport

def serialize_bug_report(content):
    response = []

    if content == 'bug_report':
        reports = (list)(BugReport.objects.filter(is_resolved=False))
        for report in reports:
            response.append({
                "id": report.id,
                "reporter": report.user.nickname,
                "content": report.content,
                "is_resolved": report.is_resolved,
                "created_at": report.created_at.isoformat(),
            })
            
    return response

def check_reported_three_times(user):
    reports = (list)(BugReport.objects.filter(user=user))
    if len(reports) >= 3:
        return True
    return False