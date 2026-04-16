
from kivy.app import App
from kivy.uix.label import Label
from kivy.utils import get_color_from_hex

class MedicalApp(App):
    def build(self):
        # Hex color for a light blue background
        self.root.background_color = get_color_from_hex('#F0F8FF')
        return Label(
            text='Hello, Medical App!',
            color=get_color_from_hex('#333333'),  # Dark grey text
            font_size='30sp'
        )

if __name__ == '__main__':
    MedicalApp().run()
