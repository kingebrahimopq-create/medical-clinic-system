[app]
title = CoreMedical
package.name = coremedical
package.domain = org.core
source.dir = .
source.include_exts = py,png,jpg,ttf
version = 1.0.0

# المكتبات المطلوبة داخل التطبيق
requirements = python3,kivy,arabic_reshaper,python-bidi,fpdf

orientation = portrait
android.permissions = INTERNET,WRITE_EXTERNAL_STORAGE,READ_EXTERNAL_STORAGE
android.api = 31
android.minapi = 21
android.sdk = 31
android.ndk = 25b
log_level = 2
