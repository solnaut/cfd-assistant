"""Generate the bounded R134a teaching table with CoolProp 7.2.0."""

import json
from pathlib import Path

from CoolProp.CoolProp import PropsSI


def series(start, step, count):
    return [start + step * index for index in range(count)]


def props(output, first, first_value, second, second_value):
    return PropsSI(output, first, first_value, second, second_value, 'HEOS::R134a')


def saturated(output, temperature, quality):
    return props(output, 'T', temperature + 273.15, 'Q', quality)


def enthalpy(pressure, temperature, quality, offset):
    value = (saturated('Hmass', temperature, quality) if offset == 0
             else props('Hmass', 'P', pressure, 'T', temperature + offset + 273.15))
    return round(value / 1000, 5)


def main():
    evap = series(-20, 2.5, 13)
    cond = series(25, 2.5, 13)
    superheat = series(0, 2.5, 9)
    subcool = series(0, 2.5, 7)
    discharge = series(0, 5, 31)
    data = {'evap': evap, 'cond': cond, 'superheat': superheat, 'subcool': subcool, 'discharge': discharge}
    evap_pressures = [saturated('P', temp, 1) for temp in evap]
    cond_pressures = [saturated('P', temp, 0) for temp in cond]
    data['evapKpa'] = [round(pressure / 1000, 5) for pressure in evap_pressures]
    data['condKpa'] = [round(pressure / 1000, 5) for pressure in cond_pressures]
    data['inletH'] = [[enthalpy(p, temp, 1, offset) for offset in superheat] for p, temp in zip(evap_pressures, evap)]
    data['liquidH'] = [[enthalpy(p, temp, 0, -offset) for offset in subcool] for p, temp in zip(cond_pressures, cond)]
    data['dischargeH'] = [[enthalpy(p, temp, 1, offset) for offset in discharge] for p, temp in zip(cond_pressures, cond)]
    data['saturation'] = [
        [round(saturated('P', temp, 0) / 1000, 5), enthalpy(0, temp, 0, 0), enthalpy(0, temp, 1, 0)]
        for temp in series(-30, 2.5, 53)
    ]
    data['isentropicH'] = []
    for i, p_evap in enumerate(evap_pressures):
        entropy = [props('Smass', 'P', p_evap, 'Hmass', h * 1000) for h in data['inletH'][i]]
        data['isentropicH'].append([
            [round(props('Hmass', 'P', p_cond, 'Smass', s) / 1000, 5) for s in entropy]
            for p_cond in cond_pressures
        ])

    destination = Path(__file__).resolve().parents[1] / 'src' / 'calculators' / 'r134aTeachingData.json'
    lines = [f'  {json.dumps(key)}: {json.dumps(value, separators=(",", ":"))}' for key, value in data.items()]
    destination.write_text('{\n' + ',\n'.join(lines) + '\n}\n', encoding='utf-8')


if __name__ == '__main__':
    main()
