import tkinter as tk
from tkinter import messagebox
from datetime import datetime
import threading
import time

class AlarmClock:
    def __init__(self, root):
        self.root = root
        self.root.title("Smart Alarm Clock")
        self.root.geometry("450x350")
        self.root.resizable(False, False)

        tk.Label(root, text="SMART ALARM CLOCK",
                 font=("Arial", 18, "bold")).pack(pady=10)

        self.clock_label = tk.Label(root, font=("Arial", 24))
        self.clock_label.pack()

        tk.Label(root, text="Enter Alarm Time (HH:MM:SS)",
                 font=("Arial", 12)).pack(pady=10)

        self.time_entry = tk.Entry(root, font=("Arial", 14), justify="center")
        self.time_entry.pack()

        tk.Button(root, text="Set Alarm",
                  command=self.set_alarm,
                  font=("Arial", 12)).pack(pady=10)

        self.status = tk.Label(root, text="No Alarm Set",
                               fg="blue", font=("Arial", 11))
        self.status.pack()

        self.update_clock()

    def update_clock(self):
        now = datetime.now().strftime("%H:%M:%S")
        self.clock_label.config(text=now)
        self.root.after(1000, self.update_clock)

    def set_alarm(self):
        alarm_time = self.time_entry.get()
        self.status.config(text=f"Alarm Set for {alarm_time}")

        threading.Thread(target=self.check_alarm,
                         args=(alarm_time,), daemon=True).start()

    def check_alarm(self, alarm_time):
        while True:
            current = datetime.now().strftime("%H:%M:%S")
            if current == alarm_time:
                messagebox.showinfo("Alarm", "⏰ Wake Up! Alarm Time Reached!")
                break
            time.sleep(1)

root = tk.Tk()
app = AlarmClock(root)
root.mainloop()