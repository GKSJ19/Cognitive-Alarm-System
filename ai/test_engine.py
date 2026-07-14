from alarm_logic import AlarmLogic

alarm = AlarmLogic()

challenge = alarm.trigger_alarm()

user_answer = input("Enter your answer: ")

alarm.validate_answer(
    user_answer,
    challenge["answer"]
)