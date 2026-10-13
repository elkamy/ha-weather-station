# Weather Station

Intégration Home Assistant (HACS) pour suivre les relevés de votre station météo maison. Elle commence par le **pluviomètre à auget basculeur** construit sur un simple capteur d'ouverture (Aqara, Sonoff…) : chaque changement d'état du contact compte un basculement de l'auget.

## Fonctionnalités

- **Cumuls de pluie** : aujourd'hui, semaine (du lundi), mois et année. Ils sont remis à zéro automatiquement et conservés après un redémarrage.
- **Pluie glissante** sur la dernière heure et les dernières 24 h.
- **Intensité de pluie** (mm/h), calculée sur l'intervalle entre les derniers basculements.
- **Pluie totale** (`total_increasing`), utilisable dans les statistiques longue durée de Home Assistant.
- **Dernière pluie** (horodatage) et un capteur binaire **Il pleut**.
- **Calibration** (mm par basculement) modifiable à tout moment. Elle s'applique aussi aux cumuls déjà enregistrés.
- **Anti-rebond** facultatif contre les faux contacts.
- **Import de l'historique** à la création : les basculements encore présents dans l'historique de Home Assistant sont repris.
- **Autres capteurs** facultatifs affichés sur la carte : température, humidité, pression, vent, batterie du pluviomètre.
- **Carte Lovelace** `weather-station-card`, chargée automatiquement, avec un éditeur visuel.

## Installation

1. Dans HACS, ajoutez ce dépôt comme *dépôt personnalisé* de type **Intégration** : `https://github.com/elkamy/ha-weather-station`.
2. Installez **Weather Station** puis redémarrez Home Assistant.
3. Allez dans **Paramètres › Appareils et services › Ajouter une intégration › Weather Station**.

## Configuration

1. **Station** : donnez-lui un nom et choisissez le capteur d'ouverture du pluviomètre (`binary_sensor`). Indiquez ensuite la pluie par basculement.
2. **Autres capteurs** : la batterie du pluviomètre est proposée automatiquement. Les autres capteurs sont facultatifs.

Dans les **options** de l'intégration, on règle la calibration, l'anti-rebond et le délai sans basculement au bout duquel la pluie est considérée comme terminée (30 min par défaut). L'action **Reconfigurer** permet de changer de capteurs.

### Calibrer le pluviomètre

La valeur par défaut, 0,524 mm par basculement, vient d'un pluviomètre Aqara (41 basculements pour 21,5 mm). Pour mesurer la vôtre, versez lentement un volume d'eau connu `V` (en mL) dans l'entonnoir et comptez les basculements `n`. La surface de l'entonnoir est `S` en cm². La valeur est alors : `mm par basculement = 10 × V / (S × n)`.

## Carte

```yaml
type: custom:weather-station-card
entity: sensor.jardin_pluie_aujourd_hui   # facultatif : première station trouvée sinon
title: Météo du jardin                     # facultatif
show_chart: true                           # pluie heure par heure sur 24 h
```

## Entités créées

| Entité | Description |
| --- | --- |
| Pluie aujourd'hui | Cumul du jour (mm). Porte aussi tous les relevés de la station pour la carte. |
| Pluie cette semaine / ce mois-ci / cette année | Cumuls calendaires (mm) |
| Pluie dernière heure / dernières 24 h | Cumuls glissants (mm) |
| Intensité de pluie | mm/h |
| Pluie totale | Total depuis l'installation (mm, statistiques longue durée) |
| Dernière pluie | Horodatage du dernier basculement |
| Il pleut | Allumé tant qu'un basculement a eu lieu dans le délai de fin de pluie |
