![Weather Station for Home Assistant](docs/weather-station-banner.svg)

<div align="center">

**Votre station météo maison dans Home Assistant : pluviomètre, température, vent, pression et un tableau de bord avec ses graphiques.**

[![Available in HACS](https://img.shields.io/badge/Available%20in-HACS-41BDF5?logo=home-assistant&logoColor=white)](https://my.home-assistant.io/redirect/hacs_repository/?owner=elkamy&repository=ha-weather-station&category=integration)
[![Latest Release](https://img.shields.io/github/v/release/elkamy/ha-weather-station?label=Release&logo=github)](https://github.com/elkamy/ha-weather-station/releases)
[![Last Commit](https://img.shields.io/github/last-commit/elkamy/ha-weather-station?label=Last%20commit)](https://github.com/elkamy/ha-weather-station/commits/main)
[![GitHub Stars](https://img.shields.io/github/stars/elkamy/ha-weather-station?style=social)](https://github.com/elkamy/ha-weather-station/stargazers)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-☕-orange?logo=buymeacoffee&logoColor=white)](https://buymeacoffee.com/elkamy)
[![Validate](https://github.com/elkamy/ha-weather-station/actions/workflows/validate.yml/badge.svg?branch=main)](https://github.com/elkamy/ha-weather-station/actions/workflows/validate.yml)
[![Hassfest](https://github.com/elkamy/ha-weather-station/actions/workflows/hassfest.yml/badge.svg?branch=main)](https://github.com/elkamy/ha-weather-station/actions/workflows/hassfest.yml)
[![HACS validation](https://github.com/elkamy/ha-weather-station/actions/workflows/hacs.yml/badge.svg?branch=main)](https://github.com/elkamy/ha-weather-station/actions/workflows/hacs.yml)

[![Ouvrir dans HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=elkamy&repository=ha-weather-station&category=integration)
[![Ajouter l'intégration](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=weather_station)

[Ouvrir les issues](https://github.com/elkamy/ha-weather-station/issues) · [Consulter les versions](https://github.com/elkamy/ha-weather-station/releases)

</div>

> **English summary** — Weather Station is a Home Assistant custom integration for a home-made weather station. It turns a contact sensor fitted to a tipping-bucket rain gauge into rain sensors (today, week, month, year, rolling 1 h / 24 h, rate, total, last rain, raining), adds optional temperature, humidity, pressure, wind speed / gust / direction, UV, illuminance and solar radiation sensors, and computes the dew point and feels-like temperature. A "Weather" sidebar panel and a full-width dashboard card show the current readings and charts over 24 hours, 7 or 30 days. The configuration UI and the cards are available in English and French.

Weather Station est une intégration personnalisée Home Assistant pour une station météo maison. Elle est construite autour d'un **pluviomètre à auget basculeur** fait d'un simple capteur d'ouverture (Aqara, Sonoff…) : chaque changement d'état du contact compte un basculement de l'auget. Les autres capteurs de la station sont facultatifs.

<p align="center">
  <img src="https://raw.githubusercontent.com/elkamy/ha-weather-station/main/docs/screenshots/dashboard.png" alt="Tableau de bord météo : relevés actuels de température, humidité, pression, vent et pluie, puis graphiques de pluie, températures, humidité, pression, vent, rose des vents et pluie par mois" width="820">
</p>

## Fonctionnalités

- **Tableau de bord météo** : une entrée **Météo** dans la barre latérale, aussi disponible en carte Lovelace pleine largeur.
- **Relevés actuels** : minimum et maximum sur 24 h, tendance de la pression sur 3 h, boussole et force Beaufort, niveau UV.
- **Graphiques sur 24 h, 7 jours ou 30 jours**, avec une infobulle au survol : pluie, températures, humidité, pression, vent et rafales, rose des vents, UV, luminosité, rayonnement et pluie mois par mois.
- **Cumuls de pluie** du jour, de la semaine (du lundi), du mois et de l'année, remis à zéro automatiquement et conservés après un redémarrage.
- **Pluie glissante** sur la dernière heure et les dernières 24 h.
- **Intensité de pluie** (mm/h), moyennée sur les derniers basculements.
- **Pluie totale** utilisable dans les statistiques longue durée de Home Assistant.
- **Dernière pluie** et capteur binaire **Il pleut**.
- **Point de rosée** et **température ressentie** calculés dès que la température et l'humidité sont renseignées. Le ressenti tient compte du vent.
- **Entité météo** (`weather.<station>`) pour les cartes météo de Home Assistant et Assist, avec les prévisions d'un fournisseur au choix (Météo-France, Met.no…).
- **Alertes** gel, vent fort et pluie : des capteurs binaires et un événement `weather_station_alert` à chaque début et fin d'épisode, pour vos notifications.
- **Calibration** du pluviomètre modifiable à tout moment. Elle s'applique aussi aux cumuls déjà enregistrés.
- **Anti-rebond** facultatif contre les faux contacts.
- **Import de l'historique** à la création, pour ne pas repartir de zéro.
- **Carte compacte** en plus du tableau de bord, avec éditeur visuel.
- Thèmes clair et sombre, interface en français et en anglais.

## Installation

### Avec HACS

1. Assurez-vous que [HACS](https://hacs.xyz/) est installé.
2. Cliquez sur le bouton ci-dessous, ou ouvrez HACS → Intégrations → menu ⋮ → Dépôts personnalisés et ajoutez `elkamy/ha-weather-station` avec la catégorie **Integration**.

   [![Ouvrir dans HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=elkamy&repository=ha-weather-station&category=integration)

3. Installez **Weather Station** puis redémarrez Home Assistant.
4. Ajoutez l'intégration avec le bouton ci-dessous, ou depuis **Paramètres → Appareils et services → Ajouter une intégration** en recherchant **Weather Station**.

   [![Ajouter l'intégration](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=weather_station)

### Installation manuelle

1. Copiez le dossier `custom_components/weather_station` dans `config/custom_components/weather_station`.
2. Redémarrez Home Assistant.
3. Ajoutez l'intégration depuis **Paramètres → Appareils et services**.

Après une mise à jour, redémarrez Home Assistant puis forcez le rechargement de la page (**Ctrl+Maj+R** dans le navigateur ; dans l'application mobile, **Paramètres de l'application → Débogage → Réinitialiser le cache du frontend**). Sans cela, le navigateur peut garder les anciennes cartes.

## Configuration de la station

L'ajout d'une station se fait en deux étapes :

1. **La station** : donnez-lui un nom, choisissez le capteur d'ouverture du pluviomètre (`binary_sensor`) et indiquez la pluie par basculement. Gardez **Importer l'historique** coché pour reprendre les basculements déjà enregistrés par Home Assistant (10 jours par défaut).
2. **Les autres capteurs**, tous facultatifs :
   - la batterie du pluviomètre, proposée automatiquement ;
   - température, humidité et pression ;
   - vitesse, rafales et direction du vent (la direction peut être en degrés ou en points cardinaux : `N`, `NE`, `NO`…) ;
   - indice UV, luminosité et rayonnement solaire.

> **Anémomètre WindNerd** : le [WindNerd HQ](https://windnerd.net/docs/windnerd-hq) remonte dans Home Assistant par MQTT (découverte automatique). Choisissez ses moyennes sur 10 minutes : **Wind Speed Avg 10 mn** pour la vitesse, **Wind Gust 10 mn** pour les rafales et **Wind Direction Avg 10 mn** pour la direction. Évitez les valeurs *Live*, publiées toutes les 3 secondes : elles alourdissent l'historique et rendent les graphiques illisibles.

Vous n'avez pas encore tous vos capteurs ? Ajoutez-les plus tard avec **Reconfigurer** depuis la carte de l'intégration. Le tableau de bord n'affiche que les relevés disponibles.

Dans les **options** de l'intégration (**Réglages du pluviomètre**), on règle :

| Option | Rôle | Par défaut |
| --- | --- | --- |
| Pluie par basculement | Quantité de pluie (mm) d'un basculement de l'auget | 0,524 mm |
| Anti-rebond | Ignore un basculement trop proche du précédent (faux contact) | 0 s (tout compter) |
| Fin de pluie après | Délai sans basculement au bout duquel la pluie est terminée | 30 min |

### Réinitialiser les mesures

Pour repartir de zéro (après un étalonnage à l'eau, une installation de test…), ouvrez les **options** de l'intégration puis **Réinitialiser les mesures**, cochez la confirmation et validez. Tous les cumuls de pluie repartent de zéro, et l'historique des graphiques de pluie (7 jours, 30 jours, pluie par mois) est effacé. Les réglages et les autres capteurs ne sont pas touchés. Cette action est irréversible.

La même remise à zéro existe en action, utilisable dans un script ou une automatisation :

```yaml
action: weather_station.reset_rain
data:
  config_entry_id: 01J...   # la station, à choisir dans l'éditeur visuel
```

### Calibrer le pluviomètre

La valeur par défaut, 0,524 mm par basculement, vient d'un pluviomètre Aqara (41 basculements pour 21,5 mm). Pour mesurer la vôtre :

1. Versez lentement un volume d'eau connu `V` (en mL) dans l'entonnoir.
2. Comptez les basculements `n`.
3. Mesurez la surface de l'entonnoir `S` (en cm²).

La valeur est alors : `mm par basculement = 10 × V / (S × n)`.

## Entité météo

La station crée une entité `weather` à son nom (par exemple `weather.jardin`). Elle s'utilise dans la carte **Prévisions météo** de Home Assistant, dans Assist (« quel temps fait-il ? ») et partout où une entité météo est attendue. Elle donne les relevés de la station : température, ressenti, point de rosée, humidité, pression, vent, rafales, direction et indice UV, ainsi que la pluie du jour en attribut.

**État du ciel** : la station décide d'abord avec ce qu'elle mesure :
1. le pluviomètre bascule → **pluvieux**, ou **averses** au-delà de 7,6 mm/h ;
2. l'alerte vent fort est active → **venteux** ;
3. avec un capteur de rayonnement solaire ou de luminosité, comparé au rayonnement d'un ciel dégagé à la hauteur du soleil → **ensoleillé**, **partiellement nuageux** ou **nuageux** (en journée, soleil à plus de 10° au-dessus de l'horizon) ;
4. sinon, l'état de l'**entité de prévisions** si vous en avez choisi une. La pluie qu'elle annonce devient « nuageux » si le pluviomètre ne voit rien tomber.

**Prévisions** : choisissez une entité météo existante dans le champ **Prévisions** (à la création ou avec **Reconfigurer**), par exemple celle de l'intégration Météo-France ou Met.no. La station reprend ses prévisions quotidiennes et horaires et convertit leurs unités. Sans entité de prévisions et sans capteur de lumière, l'état du ciel reste inconnu en dehors des épisodes de pluie et de vent fort.

## Alertes

La station crée des capteurs d'alerte, à utiliser dans vos automatisations :

| Capteur | S'allume quand… | S'éteint quand… |
| --- | --- | --- |
| Il pleut | le pluviomètre bascule | aucun basculement pendant le délai de fin de pluie |
| Risque de gel | la température passe sous le seuil (2 °C par défaut) | elle remonte 1 °C au-dessus du seuil |
| Vent fort | les rafales (ou le vent moyen sans capteur de rafales) atteignent le seuil (50 km/h par défaut) | elles redescendent sous 80 % du seuil |

Les seuils se règlent dans les options, menu **Seuils d'alerte**. Le décalage entre le début et la fin évite une rafale d'alertes quand la valeur oscille autour du seuil. Pendant une alerte, le tableau de bord affiche une pastille « Risque de gel » ou « Vent fort ».

À chaque début et chaque fin d'épisode, l'intégration émet l'événement `weather_station_alert`. Un redémarrage de Home Assistant ne rejoue jamais un épisode déjà en cours. Les données de l'événement :

| Donnée | Exemple |
| --- | --- |
| `alert` | `frost`, `strong_wind` ou `rain` |
| `active` | `true` au début, `false` à la fin |
| `value`, `unit` | `1.5`, `°C` (pour la pluie : cumul du jour en mm) |
| `threshold` | `2.0` |
| `station_name`, `config_entry_id`, `entity_id` | la station et le capteur d'alerte |

Exemple : une notification au début de chaque alerte.

```yaml
alias: Alertes météo
mode: queued
triggers:
  - trigger: event
    event_type: weather_station_alert
    event_data:
      active: true
actions:
  - action: notify.mobile_app_votre_telephone
    data:
      title: "{{ trigger.event.data.station_name }}"
      message: >-
        {% set noms = {'frost': '❄️ Risque de gel', 'strong_wind': '💨 Vent fort', 'rain': '🌧️ Il pleut'} %}
        {{ noms[trigger.event.data.alert] }}
        {%- if trigger.event.data.alert != 'rain' %} :
        {{ trigger.event.data.value }} {{ trigger.event.data.unit }}{% endif %}
```

Pour les piles des capteurs, l'intégration HACS [Battery Notes](https://github.com/andrew-codechimp/HA-Battery-Notes) surveille tous les appareils de la maison.

## Tableau de bord

L'entrée **Météo** de la barre latérale montre le tableau de bord, avec un onglet par station. Il existe aussi en carte Lovelace, à ajouter depuis **Ajouter une carte → Tableau de bord météo** ou en YAML :

```yaml
type: custom:weather-station-dashboard-card
entity: sensor.jardin_pluie_aujourd_hui   # facultatif : première station trouvée sinon
title: Météo du jardin                     # facultatif
period: 24h                                # période à l'ouverture : 24h, 7d ou 30d
```

<p align="center">
  <img src="https://raw.githubusercontent.com/elkamy/ha-weather-station/main/docs/screenshots/dashboard-dark.png" alt="Tableau de bord météo en thème sombre sur 7 jours" width="820">
</p>

- **24 h** : les graphiques reprennent l'historique brut de Home Assistant, et la pluie est affichée heure par heure.
- **7 et 30 jours** : les graphiques utilisent les **statistiques longue durée** (moyenne horaire ou journalière). Le premier capteur de chaque graphique montre aussi sa plage minimum–maximum. La pluie est affichée jour par jour.
- **Rose des vents** : part du temps passé dans chaque direction, sur 24 h ou sur les 7 derniers jours.

Un capteur n'a de statistiques longue durée que s'il déclare une `state_class`. C'est le cas de la plupart des capteurs météo et de ceux créés par l'intégration.

## Carte compacte

<img src="https://raw.githubusercontent.com/elkamy/ha-weather-station/main/docs/screenshots/weather-station-card.png" alt="Carte compacte : pluie du jour, intensité, cumuls, pluie heure par heure et capteurs de la station" width="360" align="right">

La carte `weather-station-card` résume une station : pluie du jour et intensité, cumuls sur 1 h, 24 h, la semaine, le mois et l'année, pluie heure par heure et les autres capteurs.

```yaml
type: custom:weather-station-card
entity: sensor.jardin_pluie_aujourd_hui   # facultatif
title: Météo du jardin                     # facultatif
show_chart: true                           # pluie heure par heure sur 24 h
```

<br clear="right">

## Entités créées

| Entité | Description |
| --- | --- |
| Pluie aujourd'hui | Cumul du jour (mm). Porte aussi tous les relevés de la station pour les cartes. |
| Pluie cette semaine / ce mois-ci / cette année | Cumuls calendaires (mm) |
| Pluie dernière heure / dernières 24 h | Cumuls glissants (mm) |
| Intensité de pluie | mm/h |
| Pluie totale | Total depuis l'installation (mm, statistiques longue durée) |
| Dernière pluie | Horodatage du dernier basculement |
| Il pleut | Allumé tant qu'un basculement a eu lieu dans le délai de fin de pluie |
| Point de rosée, Température ressentie | °C, avec un capteur de température et un capteur d'humidité |
| Risque de gel | Avec un capteur de température (voir [Alertes](#alertes)) |
| Vent fort | Avec un capteur de rafales ou de vent (voir [Alertes](#alertes)) |
| Entité météo | `weather.<station>` (voir [Entité météo](#entité-météo)) |

## Désinstallation

1. Supprimez les cartes Weather Station de vos tableaux de bord.
2. Supprimez chaque station depuis **Paramètres → Appareils et services → Weather Station**. L'entrée **Météo** disparaît avec la dernière station.
3. Désinstallez Weather Station depuis HACS (ou supprimez `config/custom_components/weather_station`), puis redémarrez Home Assistant.

## Développement et tests

Les tests automatisés couvrent la logique du pluviomètre, les formules météo, les capteurs et le rendu des cartes.

Exécuter les tests localement :

```bash
python -m compileall -q custom_components/weather_station tests
python -m unittest discover -s tests -v
node --check custom_components/weather_station/www/weather-station-card.js
node --check custom_components/weather_station/www/weather-station-dashboard.js
node --test tests/test_card.js tests/test_dashboard.js
```

Les tests de `tests_ha/` s'exécutent dans un vrai Home Assistant (flux de configuration, entités, import de l'historique, panneau) :

```bash
pip install pytest-homeassistant-custom-component
python -m pytest
```

La CI vérifie également les métadonnées JSON, HACS et Hassfest. Pour signaler un bug ou demander une fonctionnalité, [ouvrez une issue](https://github.com/elkamy/ha-weather-station/issues).

## Compatibilité

- Intégration personnalisée Home Assistant.
- Version minimale déclarée : Home Assistant 2024.11.0.
- Installation et mises à jour via HACS ou manuellement.

## Licence

Distribué sous licence MIT. Consultez le fichier [LICENSE](LICENSE).
