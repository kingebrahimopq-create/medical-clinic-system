
from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.textinput import TextInput
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.uix.scrollview import ScrollView
from kivy.clock import Clock
import os
import time

# مسار المجلد في الأندرويد (يجب أن يتطابق مع مجلد Drive المزامَن أو مجلد محلي)
DRIVE_PATH = '/sdcard/ColabAIApp_Data'
INBOX_PATH = os.path.join(DRIVE_PATH, 'inbox')
OUTBOX_PATH = os.path.join(DRIVE_PATH, 'outbox')

class ChatApp(App):
    def build(self):
        # إنشاء المجلدات إذا لم تكن موجودة (للمحاكاة)
        for p in [INBOX_PATH, OUTBOX_PATH]:
            if not os.path.exists(p): os.makedirs(p, exist_ok=True)

        self.layout = BoxLayout(orientation='vertical', padding=10, spacing=10)
        self.scroll = ScrollView(size_hint=(1, 0.8))
        self.chat_log = Label(text="[b][color=4CAF50]خادم Colab متصل...[/color][/b]
",
                              markup=True, size_hint_y=None, halign='right', valign='top')
        self.chat_log.bind(texture_size=self.chat_log.setter('size'))
        self.scroll.add_widget(self.chat_log)

        self.input_box = TextInput(hint_text='اكتب سؤالك هنا...', multiline=False, size_hint=(1, 0.1))
        self.send_btn = Button(text='إرسال', size_hint=(1, 0.1), background_color=(0.1, 0.5, 0.8, 1))
        self.send_btn.bind(on_release=self.send_message)

        self.layout.add_widget(self.scroll)
        self.layout.add_widget(self.input_box)
        self.layout.add_widget(self.send_btn)

        Clock.schedule_interval(self.check_for_replies, 3)
        return self.layout

    def send_message(self, instance):
        query = self.input_box.text.strip()
        if query:
            self.chat_log.text += f"
[b][color=2196F3]أنت:[/color][/b] {query}"
            ts = int(time.time())
            filename = f"msg_{ts}.txt"
            try:
                with open(os.path.join(INBOX_PATH, filename), 'w') as f:
                    f.write(query)
                self.input_box.text = ""
            except Exception as e:
                self.chat_log.text += f"
[color=ff0000]خطأ في الإرسال: {e}[/color]"

    def check_for_replies(self, dt):
        try:
            files = [f for f in os.listdir(OUTBOX_PATH) if f.startswith('reply_')]
            for f in files:
                path = os.path.join(OUTBOX_PATH, f)
                with open(path, 'r') as file:
                    reply = file.read()
                self.chat_log.text += f"
[b][color=FF9800]الذكاء الاصطناعي:[/color][/b] {reply}
"
                os.remove(path)
        except:
            pass

if __name__ == '__main__':
    ChatApp().run()
