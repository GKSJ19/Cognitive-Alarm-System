import io
from fastapi.responses import StreamingResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import openpyxl

def generate_pdf_report(user_id: str, data: dict) -> StreamingResponse:
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 750, f"User Progress Report - {user_id}")
    
    c.setFont("Helvetica", 12)
    y = 700
    c.drawString(50, y, f"Total Challenges: {data.get('total_challenges', 0)}")
    y -= 25
    c.drawString(50, y, f"Success Rate: {data.get('success_rate', 0)}%")
    y -= 25
    c.drawString(50, y, f"Total XP: {data.get('total_xp', 0)}")
    y -= 25
    c.drawString(50, y, f"Current Streak: {data.get('current_streak', 0)}")
    y -= 25
    c.drawString(50, y, f"Habit Score: {data.get('habit_score', 0)}")
    
    c.showPage()
    c.save()
    buffer.seek(0)
    
    return StreamingResponse(
        buffer, 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename=report_{user_id}.pdf"}
    )

def generate_excel_report(user_id: str, data: dict) -> StreamingResponse:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "User Progress"
    
    ws.append(["Metric", "Value"])
    ws.append(["User ID", user_id])
    ws.append(["Total Challenges", data.get("total_challenges", 0)])
    ws.append(["Success Rate", data.get("success_rate", 0)])
    ws.append(["Total XP", data.get("total_xp", 0)])
    ws.append(["Current Streak", data.get("current_streak", 0)])
    ws.append(["Habit Score", data.get("habit_score", 0)])
    
    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
        headers={"Content-Disposition": f"attachment; filename=report_{user_id}.xlsx"}
    )
