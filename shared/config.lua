NX = NX or {}
NX.HudConfig = {
    onFootInterval = 250,
    vehicleInterval = 120,

    hideWhenFocused = true,
    hideWhenPaused = true,
    hideWhenDead = true,

    elements = {
        health = true, armor = true, stamina = true, needs = true,
        voice = true, money = true, job = true, identity = true,
        speed = true, fuel = true,
        engine = true, gear = true, seatbelt = true,
    },

    radarOffsetY = 0.072,

    toggleable = (NX.Config and NX.Config.UI and NX.Config.UI.toggles) or {
        { key = 'hud.needs', label = 'Lapar & haus', default = true },
        { key = 'hud.stamina', label = 'Stamina', default = true },
        { key = 'hud.speed', label = 'Speedometer', default = true },
        { key = 'hud.fuel', label = 'Bahan bakar', default = true },
    },

    seatbelt = {
        enabled = true,
        key = 'B',
        ejectSpeed = 55,
        crashDrop = 28,
        damage = 18,
    },

    engineWarn = 55,
    engineCritical = 25,

    fuelWarn = 20,
}
