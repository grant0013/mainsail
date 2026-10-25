# Mainsail: Hark K2 edition

**A Mainsail fork for the Creality K2 open stack
([K2 OpenKlipper](https://github.com/grant0013/K2-OpenKlipper)), with a CFS
multi-filament panel, a control-centre dashboard and appearance
customisation.** Revision 1 (`v2.18.2-hark.1`) is based on Mainsail v2.18.2.
More customisation features are planned.

![Dashboard with control centre and CFS panel](docs/hark-k2/dashboard.png)

## What it adds

- **CFS panel:** the four CFS slots with filament, colour, nozzle temperature
  and pressure advance, the active slot, and the box's temperature and
  humidity. Click a slot to pick a filament from your library or Creality's
  list, customise its settings (temperatures, PA, flow, retraction, fans) and
  set the spool colour. It is backed by the
  [`hark_cfs_slots`](https://github.com/grant0013/K2-OpenKlipper/blob/main/klippy/extras/hark_cfs_slots.py)
  Klipper module, and hidden when that module is not present.
- **Control centre:** a full-width card at the top of the dashboard with the
  thumbnail, state, progress ring, ETA, pause/resume/cancel or home/cooldown,
  the chamber light, and nozzle/bed/chamber/CFS tiles with heater presets.
- **Appearance settings** (Settings → Appearance): style presets (Mainsail
  default, Hark Tech, Glass, High contrast), accent colour, card style, corner
  radius, density, text size, and a control-centre toggle. The default is the
  stock Mainsail look.
- **Movable dashboard cards:** "Edit layout" lets you drag cards between
  columns and hide them; the layout is saved per device size.

![CFS slot editor](docs/hark-k2/cfs_slot_editor.png)
![Appearance settings](docs/hark-k2/appearance_settings.png)

## Install

Download `mainsail-hark-k2-v2.18.2-hark.1.zip` from the
[release](https://github.com/grant0013/mainsail/releases/tag/v2.18.2-hark.1)
and unpack it in place of your Mainsail web root. The CFS panel needs the K2
OpenKlipper stack; the control centre, appearance settings and movable cards
work on any Klipper printer.

The changes are on branch `hark-cfs-panel`. Upstream Mainsail continues
below. This is an independent fork, not affiliated with mainsail-crew; GPLv3
like upstream.

---

<p align="center">
  <a>
    <img src="https://raw.githubusercontent.com/mainsail-crew/docs/master/assets/img/logo.png" alt='Mainsail logo' height="152">
    <h1 align="center">Mainsail</h1>
  </a>
</p>
<p align="center">
  Makes Klipper more accessible by adding a lightweight, responsive web user interface, centred around an intuitive and consistent design philosophy.
</p>
<p align="center">
  <a aria-label="Downloads" href="https://github.com/mainsail-crew/mainsail/releases">
    <img src="https://img.shields.io/github/downloads/mainsail-crew/mainsail/total?style=flat-square">
  </a>
  <a aria-label="Stars" href="https://github.com/mainsail-crew/mainsail/stargazers">
    <img src="https://img.shields.io/github/stars/mainsail-crew/mainsail?style=flat-square">
  </a>
  <a aria-label="Forks" href="https://github.com/mainsail-crew/mainsail/network/members">
    <img src="https://img.shields.io/github/forks/mainsail-crew/mainsail?style=flat-square">
  </a>
  <a href="https://hosted.weblate.org/engage/mainsail/">
    <img src="https://hosted.weblate.org/widget/mainsail/mainsail/svg-badge.svg" alt="Übersetzungsstatus" />
  </a>
  <a aria-label="License" href="https://github.com/mainsail-crew/mainsail/blob/develop/LICENSE">
    <img src="https://img.shields.io/github/license/mainsail-crew/mainsail?style=flat-square">
  </a>
  <a aria-label="Last commit" href="https://github.com/mainsail-crew/mainsail/commits/">
    <img src="https://img.shields.io/github/last-commit/meteyou/mainsail?style=flat-square">
  </a>
  <br />
  <a aria-label="Size" href="https://github.com/mainsail-crew/mainsail/">
    <img src="https://img.shields.io/github/repo-size/meteyou/mainsail?style=flat-square">
  </a>
  <a aria-label="Discord" href="https://discord.gg/skWTwTD">
    <img src="https://img.shields.io/discord/758059413700345988?color=%235865F2&label=discord&logo=discord&logoColor=white&style=flat-square">
  </a>
  <a aria-label="Patreon" href="https://www.patreon.com/meteyou">
    <img src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.vercel.app%2Fapi%3Fusername%3Dmeteyou%26type%3Dpatrons&style=flat-square">
  </a>
</p>

## Getting Started

Visit [docs.mainsail.xyz/setup](https://docs.mainsail.xyz/setup) to get started with Mainsail.

Mainsail is also available in remote mode on [http://my.mainsail.xyz](http://my.mainsail.xyz). Find
out [more](https://docs.mainsail.xyz/setup#mymainsailxyz).

## Documentation

Visit [docs.mainsail.xyz](https://docs.mainsail.xyz) to view the full documentation.  
You can find the latest release notes [here](https://github.com/mainsail-crew/mainsail/releases).

## Screenshots

![screenshot-dashboard](https://raw.githubusercontent.com/mainsail-crew/docs/master/assets/img/screenshot.png)
![Features](https://raw.githubusercontent.com/mainsail-crew/docs/master/assets/img/features.png)

## Features

- **Responsive Web Interface:** _Optimized for desktops, tablets and mobile devices_
- **Printer Farm:** _Supports multiple 3D printers_
- **[Localization](https://docs.mainsail.xyz/features/localization):** _Choose between 12 different languages_
- **File Manager:** _Delete, rename and upload your G-Code and config files_
- **File Editor:** _Edit G-Code and config files with syntax highlighting in your browser_
- **[Print History](https://docs.mainsail.xyz/features/history):** _See your previous prints and their status_
- **[Statistics](https://docs.mainsail.xyz/features/history):** _View how much time your printer has been in use and the number of jobs that have succeeded or failed_
- **Job Queue:** _Queue multiple jobs and add them directly from your slicer_
- **[Temperature Presets](https://docs.mainsail.xyz/features/presets):** _Manage different temperature presets for easy preheating_
- **[Bed Mesh Visualisation](https://docs.mainsail.xyz/features/bedmesh):** _View your bed using a 3D mesh graph_
- **G-Code Viewer:** _View a 3D render of your print and follow the progress_
- **Multi-Webcam Support:** _View your print from different angles with multiple webcams_
- **Timelapse Integration:** _Automatically record a timelapse of your print using [moonraker-timelapse](https://github.com/mainsail-crew/moonraker-timelapse)_
- **Power Control:** _Control power devices such as relays, TP-Link and Tasmota devices, and more_
- **Powerful Macro-Management:** _Manage your macros on a micro level_
- **[Configurable Dashboard](https://docs.mainsail.xyz/features/dashboard-organisation):** _Create your own personal dashboard_
- **[Theming Support](https://docs.mainsail.xyz/features/theming):** _Customizable user interface including logos, backgrounds, and custom CSS_
- **[Additional Sensors](https://docs.mainsail.xyz/quicktips/additional-sensors):** _Add extra sensors to the temperature graph_
- **Exclude Objects:** _Exclude parts of your print <sup>(not officially supported by Klipper yet)</sup>_

## Help and Support

Do you need help or just want to talk? Join our active community on [Discord](https://discord.gg/skWTwTD)!

Did you find a bug or did you thought of a feature?
Please create an [Issue](https://github.com/mainsail-crew/mainsail/issues) in GitHub and let us know.

## Official Sponsors

<p align='center'>
    <img src="https://raw.githubusercontent.com/mainsail-crew/docs/master/assets/img/logo-bigtreetech.png" alt='Mainsail logo' width="150">
</p>

**BIGTREETECH** is the official mainboard partner of Mainsail. BIGTREETECH is committed to developing innovative and competitive products to better serve the 3D printing community.

## Support Mainsail

Mainsail is primarily developed and maintained by meteyou. To keep the project going he invests his free time, almost
every day. To motivate him (☕🍺😜) there are several ways to support him:

[![patreon](https://img.shields.io/badge/patreon-participate-yellow.svg?style=flat-square)](https://www.patreon.com/meteyou)
[![kofi](https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg?style=flat-square)](https://ko-fi.com/mainsail)

## Contributing

Contributions to Mainsail are always welcome!

- 📥 Pull requests and 🌟 Stars are always welcome.
- Read our [contributing guidelines](CONTRIBUTING.md) to get started,
  or find us on [Discord](https://discord.gg/mainsail), we will take the time to guide you.

Looking for a first issue to tackle?

- We tag issues with [![Good First Issue](https://img.shields.io/github/issues/mainsail-crew/mainsail/good%20first%20issue.svg)](https://github.com/mainsail-crew/mainsail/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22) when we think they are well suited for people who are new to the codebase or OSS in general.
- [Talk to us](https://discord.gg/mainsail), we'll find something that suits your skills and learning interest.

## Credit, sources and inspiration

- [Kevin O'Connor](https://github.com/KevinOConnor) for the awesome 3D printer firmware [Klipper](https://github.com/KevinOConnor/klipper)
- [Eric Callahan (arksine)](https://github.com/Arksine) for [Moonraker (Klipper API)](https://github.com/Arksine/moonraker). Without Moonraker, Mainsail would not be possible.
- [lixxbox](https://github.com/lixxbox) for the Mainsail logo & Docs
- [Vue.js](https://vuejs.org/): The Progressive JavaScript Framework
- [Vuetify](https://vuetifyjs.com/): Material Design Component Framework for Vue.js

Massive thanks to the whole [Voron Design](http://vorondesign.com/) community. Without them such a project would not be
possible.

[Full Credits & License information](https://docs.mainsail.xyz/credits)
