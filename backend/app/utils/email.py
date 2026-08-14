import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config.settings import settings

def send_email(to_email: str, subject: str, html_content: str):
    """Sends email using SMTP if configured, otherwise prints to console"""
    
    # Check if SMTP is configured
    if not settings.SMTP_HOST or not settings.SMTP_USER:
        print("\n" + "="*80)
        print(f" MOCK EMAIL SENT")
        print(f" To: {to_email}")
        print(f" Subject: {subject}")
        print("-"*80)
        print(html_content)
        print("="*80 + "\n")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.SMTP_FROM
        msg["To"] = to_email

        part = MIMEText(html_content, "html")
        msg.attach(part)

        # Connect to SMTP server
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.ehlo()
        if settings.SMTP_PORT == 587:
            server.starttls()
            server.ehlo()
        
        if settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            
        server.sendmail(settings.SMTP_FROM, to_email, msg.as_string())
        server.close()
        return True
    except Exception as e:
        print(f"Error sending email to {to_email}: {e}")
        # Log mock email anyway as a fallback
        print("\n" + "="*80)
        print(f" FALLBACK MOCK EMAIL (SMTP failed: {e})")
        print(f" To: {to_email}")
        print(f" Subject: {subject}")
        print("-"*80)
        print(html_content)
        print("="*80 + "\n")
        return False

def send_verification_email(email: str, token: str, full_name: str):
    """Sends email verification code/link"""
    subject = "Verify your ICAP Account"
    
    # We can use a 6-digit code or a token. Since we have a token, we can mock a verification link.
    # In a real app, token is verified by GET /auth/verify-email?token=...
    # For ease of manual use, we also output a simple 6-digit code or link.
    verification_link = f"http://localhost:8000/auth/verify-email?token={token}"
    
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #1a73e8;">Welcome to ICAP, {full_name}!</h2>
        <p>Thank you for registering. Please click the button below to verify your email address:</p>
        <div style="margin: 20px 0;">
          <a href="{verification_link}" style="background-color: #1a73e8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email</a>
        </div>
        <p>Or copy and paste the following URL into your browser:</p>
        <p><a href="{verification_link}">{verification_link}</a></p>
        <p>If you did not request this verification, please ignore this email.</p>
        <br>
        <p>Best regards,<br>The ICAP Team</p>
      </body>
    </html>
    """
    return send_email(email, subject, html)

def send_password_reset_email(email: str, token: str, full_name: str):
    """Sends password reset link"""
    subject = "Reset your ICAP Password"
    reset_link = f"http://localhost:8000/auth/reset-password?token={token}"
    
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Hello, {full_name}</h2>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <div style="margin: 20px 0;">
          <a href="{reset_link}" style="background-color: #d93025; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste the following URL into your browser:</p>
        <p><a href="{reset_link}">{reset_link}</a></p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <br>
        <p>Best regards,<br>The ICAP Team</p>
      </body>
    </html>
    """
    return send_email(email, subject, html)
