fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'nx_hud'
author 'Tatsuya'
description 'NOVARA CITY HUD: status, compass, money, job and vehicle telemetry'
version '1.1.0'

shared_scripts {
    '@nx_shared/shared/config.lua',
    '@nx_shared/shared/utils.lua',
    '@nx_shared/shared/logger.lua',
    '@nx_shared/shared/locale.lua',
    '@nx_shared/shared/bridge.lua',
    '@nx_shared/locales/id.lua',
    '@nx_shared/locales/en.lua',
    'shared/config.lua',
}

client_scripts {
    'client/main.lua',
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/app.js',
    'html/hud.css',
    'html/nx.css',
    'html/nx.js',
    'html/assets/*.png',
}

dependencies {
    'nx_shared',
    'nx_core',
}
