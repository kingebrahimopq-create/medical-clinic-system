
[app]

title = Medical Clinic System
package.name = medicalclinic
package.domain = org.medical.app
source.dir = .
source.include_exts = py,png,jpg,kv,atlas,ttf,json,xml

version = 0.1

build = 1

android.permissions = INTERNET,ACCESS_NETWORK_STATE

requirements = python3,kivy

fullscreen = 0

orientation = portrait

android.minapi = 21
android.targetapi = 33

android.archs = arm64-v8a, armeabi-v7a

# Accept SDK licenses automatically (needed for CI)
android.accept_sdk_license = True

# Use stable p4a branch
p4a.branch = release-2024.01.21

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
