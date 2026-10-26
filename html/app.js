(function () {
    'use strict';

    const NXUI = window.NXUI;
    const $ = function (id) { return document.getElementById(id); };

    const root = $('hud');
    const refs = {
        cash: $('cashValue'), bank: $('bankValue'),
        jobName: $('jobName'), jobGrade: $('jobGrade'),
        charId: $('charId'), clock: $('clock'),

        voice: $('voice'), voiceMode: $('voiceMode'),
        chipHealth: $('chipHealth'), health: $('healthValue'),
        chipArmor: $('chipArmor'), armor: $('armorValue'),
        chipHunger: $('chipHunger'), hunger: $('hungerValue'),
        chipThirst: $('chipThirst'), thirst: $('thirstValue'),
        chipStress: $('chipStress'), stress: $('stressValue'),
        chipStamina: $('chipStamina'), stamina: $('staminaValue'),

        vehicle: $('vehicle'),
        speed: $('speedValue'), gear: $('gearValue'),
        fuelBar: $('fuelBar'), fuelValue: $('fuelValue'),
        engineBar: $('engineBar'), engineValue: $('engineValue'),
        seatbelt: $('seatbeltChip'), engineChip: $('engineChip'),
    };

    NXUI.qsa('[data-icon]').forEach(function (slot) {
        slot.appendChild(NXUI.icon(slot.dataset.icon, 18));
    });

    function setChip(chip, valueEl, value, lowThreshold) {
        const v = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
        valueEl.textContent = v + '%';
        if (lowThreshold !== undefined) {
            chip.classList.toggle('is-low', v <= lowThreshold);
        }
    }

    function setTalking(talking) {
        refs.voice.classList.toggle('is-talking', !!talking);
    }

    function applyFlags(flags) {
        if (!flags) return;
        root.classList.toggle('hide-needs', flags['hud.needs'] === false);
        root.classList.toggle('hide-stamina', flags['hud.stamina'] === false);
        root.classList.toggle('hide-speed', flags['hud.speed'] === false);
        root.classList.toggle('hide-fuel', flags['hud.fuel'] === false);
    }

    NXUI.on('hud', function (data) {
        if (!data) return;

        root.classList.toggle('is-hidden', data.visible === false);
        if (data.visible === false) return;

        applyFlags(data.flags);

        refs.cash.textContent = NXUI.money(data.cash);
        refs.bank.textContent = NXUI.money(data.bank);
        refs.charId.textContent = data.cid ? String(data.cid) : '—';
        refs.clock.textContent = data.clock || '00:00';

        refs.jobName.textContent = data.jobLabel || 'Civilian';
        refs.jobGrade.textContent = data.jobGrade ? '(' + data.jobGrade + ')' : '';

        setChip(refs.chipHealth, refs.health, data.health, 25);
        setChip(refs.chipArmor, refs.armor, data.armor, -1);
        setChip(refs.chipHunger, refs.hunger, data.hunger, 20);
        setChip(refs.chipThirst, refs.thirst, data.thirst, 20);
        setChip(refs.chipStamina, refs.stamina, data.stamina, 20);

        const stress = Math.max(0, Math.min(100, Math.round(Number(data.stress) || 0)));
        refs.stress.textContent = stress + '%';
        refs.chipStress.classList.toggle('is-low', stress >= 80);

        if (data.voice) {
            refs.voiceMode.textContent = data.voice.mode || 'Normal';
            setTalking(data.voice.talking === true);
        }

        const vehicle = data.vehicle;
        const showVehicle = !data.onFoot && !!vehicle;
        refs.vehicle.classList.toggle('is-hidden', !showVehicle);

        if (showVehicle) {
            refs.speed.textContent = String(vehicle.speed || 0);
            refs.gear.textContent = vehicle.gear > 0 ? String(vehicle.gear) : (vehicle.engineOn ? 'N' : '—');

            refs.fuelBar.style.width = Math.max(0, Math.min(100, vehicle.fuel)) + '%';
            refs.fuelBar.classList.toggle('is-warn', vehicle.fuelWarn === true);
            refs.fuelValue.textContent = Math.round(vehicle.fuel) + '%';

            refs.engineBar.style.width = Math.max(0, Math.min(100, vehicle.engine)) + '%';
            refs.engineBar.classList.toggle('is-warn', vehicle.engineWarn === true);
            refs.engineBar.classList.toggle('is-critical', vehicle.engineCritical === true);
            refs.engineValue.textContent = Math.round(vehicle.engine) + '%';

            refs.seatbelt.className = 'vchip ' + (vehicle.seatbelt ? 'is-on' : 'is-warn');
            refs.seatbelt.textContent = vehicle.seatbelt ? 'Sabuk ✓' : 'Sabuk ✕';

            refs.engineChip.className = 'vchip ' + (vehicle.engineOn ? 'is-on' : 'is-off');
            refs.engineChip.textContent = vehicle.engineOn ? 'Mesin' : 'Mati';
        }
    });
})();
