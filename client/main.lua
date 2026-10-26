NX = NX or {}
local cfg = NX.HudConfig
local TAG = 'nx_hud'

local needs = { hunger = 100, thirst = 100 }
local seatbelt = false
local seatbeltVehicle = 0
local lastSignature = nil
local lastSpeed = 0
local lastCrashCheck = 0
local flags = {}
local hudVisible = true
local focusHeld = false

local function refreshFlags()
    for _, element in ipairs(cfg.toggleable) do
        local default = element.default
        flags[element.key] = NX.Core.GetSetting(element.key, default) ~= false
    end
end
refreshFlags()

AddEventHandler('nx_core:client:stateChanged', function(state)
    if not state then return end
    if state.metadata then
        needs.hunger = state.metadata.hunger or needs.hunger
        needs.thirst = state.metadata.thirst or needs.thirst
    end
    refreshFlags()
end)

AddEventHandler('nx_core:client:focusChanged', function(focused)
    focusHeld = focused == true
    if focusHeld and cfg.hideWhenFocused then
        hudVisible = false
        lastSignature = nil
    end
end)

RegisterNetEvent('hud:client:UpdateNeeds', function(hunger, thirst)
    needs.hunger = hunger or needs.hunger
    needs.thirst = thirst or needs.thirst
end)

local function notifySeatbelt()
    local key = seatbelt and 'hud.seatbelt_on' or 'hud.seatbelt_off'
    TriggerEvent('nx_notify:client:push', {
        type = seatbelt and 'success' or 'warning',
        message = NX.L(key),
        duration = 2200,
        priority = 1,
    })
    PlaySoundFrontend(-1, seatbelt and 'Menu_Accept' or 'Menu_Cancel', 'Phone_SoundSet_Default', true)
end

local function toggleSeatbelt()
    local ped = PlayerPedId()
    local vehicle = GetVehiclePedIsIn(ped, false)
    if vehicle == 0 then return end
    local seat = GetPedInVehicleSeat(vehicle, -1) == ped or GetPedInVehicleSeat(vehicle, 0) == ped
    if not seat then return end
    seatbelt = not seatbelt
    seatbeltVehicle = seatbelt and vehicle or 0
    notifySeatbelt()
end

if cfg.seatbelt.enabled then
    RegisterCommand('nx_seatbelt', function() toggleSeatbelt() end, false)
    RegisterKeyMapping('nx_seatbelt', 'NOVARA: Seatbelt', 'keyboard', cfg.seatbelt.key)
end

local function checkCrash(vehicle)
    if seatbelt then return end
    local speed = GetEntitySpeed(vehicle) * 3.6
    local drop = lastSpeed - speed
    if lastSpeed >= cfg.seatbelt.ejectSpeed and drop >= cfg.seatbelt.crashDrop then
        local ped = PlayerPedId()
        local coords = GetEntityCoords(ped)
        SetEntityCoords(ped, coords.x, coords.y, coords.z, true, false, false, false)
        TaskLeaveVehicle(ped, vehicle, 4160)
        SetPedToRagdoll(ped, 4000, 4000, 0, true, true, false)
        ApplyDamageToPed(ped, cfg.seatbelt.damage, false)
        TriggerEvent('nx_notify:client:push', {
            type = 'error',
            message = NX.L('hud.seatbelt_off'),
            title = 'Kecelakaan',
            duration = 4000,
            priority = 2,
        })
    end
    lastSpeed = speed
end

local function getVoice()
    local proximity = LocalPlayer.state.proximity or {}
    local mode = proximity.mode or 'Normal'
    local talking = false
    if NetworkIsPlayerTalking(PlayerId()) then talking = true end
    return { mode = mode, index = proximity.index or 1, talking = talking }
end

local function getStamina()
    local remaining = GetPlayerSprintStaminaRemaining(PlayerId())
    if type(remaining) ~= 'number' then return 100 end
    if remaining <= 1.5 then remaining = remaining * 100 end
    if remaining <= 0.5 then
        local ped = PlayerPedId()
        if IsEntityDead(ped) or GetEntitySpeed(ped) > 1.5 then return 0 end
        return 100
    end
    return NX.Utils.Clamp(remaining, 0, 100)
end

local function getClock()
    return ('%02d:%02d'):format(GetClockHours(), GetClockMinutes())
end

local function buildPayload(onFoot, vehicle)
    local ped = PlayerPedId()
    local state = NX.Core.GetState()
    local money = state.money or { cash = 0, bank = 0 }
    local job = state.job or {}
    local metadata = state.metadata or {}
    local voice = getVoice()

    local payload = {
        onFoot = onFoot,
        health = NX.Utils.Round(GetEntityHealth(ped) / GetEntityMaxHealth(ped) * 100, 0),
        armor = NX.Utils.Round(GetPedArmour(ped), 0),
        stamina = NX.Utils.Round(getStamina(), 0),
        hunger = NX.Utils.Round(needs.hunger, 0),
        thirst = NX.Utils.Round(needs.thirst, 0),
        stress = NX.Utils.Round(tonumber(metadata.stress) or 0, 0),
        clock = getClock(),
        voice = voice,
        cash = money.cash or 0,
        bank = money.bank or 0,
        cid = state.cid or 0,
        jobLabel = job.label or 'Civilian',
        jobGrade = (job.grade and job.grade.name) or '',
        onDuty = job.onduty == true,
        dead = (metadata.isdead == true) or IsEntityDead(ped),
        flags = flags,
    }

    if not onFoot and vehicle ~= 0 then
        local engineHealth = GetVehicleEngineHealth(vehicle)
        local enginePercent = NX.Utils.Clamp(NX.Utils.Round(engineHealth / 10, 0), 0, 100)
        local fuel = GetVehicleFuelLevel(vehicle)
        payload.vehicle = {
            speed = NX.Utils.Round(GetEntitySpeed(vehicle) * 3.6, 0),
            fuel = NX.Utils.Round(fuel, 0),
            engine = enginePercent,
            gear = GetVehicleCurrentGear(vehicle),
            engineOn = GetIsVehicleEngineRunning(vehicle) == true,
            seatbelt = seatbelt,
            fuelWarn = fuel <= cfg.fuelWarn,
            engineWarn = enginePercent <= cfg.engineWarn,
            engineCritical = enginePercent <= cfg.engineCritical,
        }
    end

    return payload
end

local function signature(payload)
    local vehicle = payload.vehicle
    return table.concat({
        payload.onFoot and 1 or 0,
        payload.health, payload.armor, payload.stamina,
        payload.hunger, payload.thirst, payload.stress,
        payload.cash, payload.bank,
        payload.cid, payload.jobLabel, payload.jobGrade, payload.onDuty and 1 or 0,
        payload.clock,
        payload.dead and 1 or 0,
        payload.voice.mode, payload.voice.talking and 1 or 0,
        vehicle and (vehicle.speed .. '|' .. vehicle.fuel .. '|' .. vehicle.engine .. '|' ..
            vehicle.gear .. '|' .. (vehicle.engineOn and 1 or 0) .. '|' .. (vehicle.seatbelt and 1 or 0)) or '-',
        flags['hud.needs'] and 1 or 0,
        flags['hud.stamina'] and 1 or 0,
        flags['hud.speed'] and 1 or 0,
        flags['hud.fuel'] and 1 or 0,
        hudVisible and 1 or 0,
    }, '~')
end

local function shouldHide()
    if cfg.hideWhenFocused and (focusHeld or NX.Core.IsFocused()) then return true end
    if cfg.hideWhenPaused and IsPauseMenuActive() then return true end
    return false
end

CreateThread(function()
    Wait(1500)
    while true do
        local ped = PlayerPedId()
        local vehicle = GetVehiclePedIsIn(ped, false)
        local onFoot = vehicle == 0

        if not onFoot then
            checkCrash(vehicle)
        else
            lastSpeed = 0
            if seatbelt then seatbelt = false end
        end

        local hidden = shouldHide()
        if hidden ~= not hudVisible then
            hudVisible = not hidden
            lastSignature = nil
        end

        local payload = buildPayload(onFoot, vehicle)
        if cfg.hideWhenDead and payload.dead then hudVisible = false end
        payload.visible = hudVisible

        local sig = signature(payload)
        if sig ~= lastSignature then
            lastSignature = sig
            SendNUIMessage({ action = 'hud', data = payload })
        end

        Wait(onFoot and cfg.onFootInterval or cfg.vehicleInterval)
    end
end)

RegisterNUICallback('setPreference', function(data, cb)
    if type(data) == 'table' and type(data.key) == 'string' then
        local value = data.value ~= false
        flags[data.key] = value
        NX.Core.SaveSettings({ [data.key] = value })
        lastSignature = nil
    end
    cb({ ok = true })
end)

RegisterNUICallback('toggleSeatbelt', function(_, cb)
    toggleSeatbelt()
    cb({ ok = true })
end)

exports('SetSeatbelt', function(value)
    seatbelt = value == true
end)

exports('IsSeatbeltOn', function() return seatbelt end)

exports('SetVisible', function(value)
    hudVisible = value ~= false
    lastSignature = nil
end)

local function applyRadarOffset()
    local offset = cfg.radarOffsetY
    if not offset or offset == 0 then return end
    pcall(function()
        SetMinimapComponentPosition('minimap', 'L', 'B', -0.0045, offset, 0.150, 0.188)
        SetMinimapComponentPosition('minimap_blur', 'L', 'B', -0.015, offset + 0.002, 0.256, 0.226)
    end)
end

CreateThread(function()
    applyRadarOffset()
    while true do
        Wait(5000)
        applyRadarOffset()
    end
end)

CreateThread(function()
    local minimap = RequestScaleformMovie('minimap')
    local waited = 0
    while not HasScaleformMovieLoaded(minimap) and waited < 10000 do
        Wait(100)
        waited = waited + 100
    end

    while true do
        Wait(200)
        BeginScaleformMovieMethod(minimap, 'SETUP_HEALTH_ARMOUR')
        ScaleformMovieMethodAddParamInt(3)
        EndScaleformMovieMethod()
    end
end)

NX.Log.info(TAG, 'hud client ready')
