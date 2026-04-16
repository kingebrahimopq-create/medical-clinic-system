
[app]

title = Medical App
package.name = medicalapp
package.domain = org.test
source.dir = .

# (optional) : The version number of your application
# It is used for the android versioning only
version = 0.1

# (optional) The build version of the application
build = 1

# (optional) Your organization/company name for the app.
# Used to generate the Android package name
# organization = KivyMD

# (optional) The Android SDK version to use
# android.api = 27

# (optional) The Android NDK version to use
# android.ndk = 19c

# (optional) The Android NDK directory (if you want to use a custom one)
# android.ndk_path = /home/user/ndk

# (optional) The Python version to use
# python.version = 3

# (optional) The Java version to use
# java.version = 8

# (optional) A list of Python modules to include
# By default, a set of commonly used modules are included. Add more if needed.
# pydist = sqlite3

# (optional) Libraries to include from the Android NDK
# android.libs =

# (optional) Java libraries to include
# android.add_libs =

# (optional) Android Permissions
android.permissions = INTERNET

# (optional) A list of files to include in the APK
# (relative to the source_dir)
# include.files =

# (optional) A list of folders to include in the APK
# (relative to the source_dir)
# include.dirs =

# (optional) A list of recipes to use for the build
# (e.g. `kivymd` for KivyMD apps)
requirements = python3,kivy

# (optional) Enable fullscreen mode for the app
fullscreen = 1

# (optional) Icon for your application
# icon.filename = icon.png

# (optional) Splash screen for your application
# splash.filename = splash.png

# (optional) This will be appended to the user agent string of the WebView in your app.
# android.useragent = CustomUserAgent

# (optional) For Android, specify the minimum SDK version you'd like your application to run on
# android.minapi = 21

# (optional) For Android, specify the target SDK version your application is designed for
# android.targetapi = 27

# (optional) Whether to use the SDL2 backend for Kivy (recommended)
# This is enabled by default. If you encounter issues, try disabling it.
# sdl2 = 1

# (optional) Specify the orientation of the application
# Possible values are: landscape, portrait, all
# orientation = portrait

# (optional) Add a debug entry in the AndroidManifest.xml (default is False)
# debug = 1

# (optional) Use a custom AndroidManifest.xml file. Can be relative to the source_dir
# android.manifest =

# (optional) The minimum Android NDK version to use
# android.minndk = 19c

# (optional) The maximum Android NDK version to use
# android.maxndk = 21

# (optional) Extra command line arguments to pass to the build tool (e.g., `gradle`)
# android.extra_args =

# (optional) Extra environment variables to set during the build process
# android.extra_env =

# (optional) Force a specific toolchain for android
# android.toolchain = clang

# (optional) Add an entry for Android TV in the AndroidManifest.xml
# android.tv = 0

# (optional) Add an entry for Android Wear in the AndroidManifest.xml
# android.wear = 0

# (optional) Add an entry for Android Auto in the AndroidManifest.xml
# android.auto = 0

# (optional) Add an entry for Android Things in the AndroidManifest.xml
# android.things = 0

# (optional) Additional values for the `config.py` file during the build
# android.config_extra =

# (optional) Whether to use the `aapt` tool to generate the `R.java` file (default is True)
# android.aapt = 1
