
from kivy.app import App
from kivy.uix.label import Label
from kivy.uix.boxlayout import BoxLayout
from kivy.utils import get_color_from_hex

class MedicalApp(App):
    def build(self):
        root = BoxLayout(orientation='center')
        root.background_color = get_color_from_hex('#F0F8FF')
        label = Label(
            text='Hello, Medical App!',
            color=get_color_from_hex('#333333'),
            font_size='30sp'
        )
        root.add_widget(label)
        return root

if __name__ == '__main__':
    MedicalApp().run()
