from kivy.app import App
from kivy.uix.label import Label
from kivy.utils import get_color_from_hex

class MedicalApp(App):
    def build(self):
        return Label(
            text='Hello, Medical App!',
            color=get_color_from_hex('#333333'),
            font_size='30sp'
        )

if __name__ == '__main__':
    MedicalApp().run()