from wake_up_verification import WakeUpVerification

verification = WakeUpVerification()

verification.update(True)
print(verification.status())

verification.update(True)
print(verification.status())

print("Verified:", verification.is_verified())