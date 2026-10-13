# Changelog

## 0.2.0 – Non publié

- **Tableau de bord météo** : une entrée « Météo » dans la barre latérale et une carte `weather-station-dashboard-card` pleine largeur. On y trouve :
  - les relevés actuels (min./max. sur 24 h, tendance de la pression, boussole et force Beaufort, niveau UV) ;
  - les graphiques sur 24 h, 7 jours ou 30 jours, avec une infobulle au survol : pluie, températures, humidité, pression, vent et rafales, rose des vents, UV, luminosité et rayonnement ;
  - la pluie mois par mois.
- Nouveaux capteurs facultatifs : rafales et direction du vent (en degrés ou en points cardinaux), indice UV, luminosité, rayonnement solaire.
- Point de rosée et température ressentie calculés dès que la température et l'humidité sont renseignées.
- La carte compacte affiche aussi les rafales, la direction du vent et l'indice UV.

## 0.1.0

- Première version : une station météo construite autour d'un pluviomètre à auget basculeur relié à un capteur d'ouverture.
- Cumuls de pluie du jour, de la semaine, du mois et de l'année. Pluie sur la dernière heure et les dernières 24 h. Intensité, pluie totale, dernière pluie et capteur « Il pleut ».
- Calibration, anti-rebond et délai de fin de pluie réglables. Import de l'historique déjà enregistré.
- Capteurs facultatifs (température, humidité, pression, vent, batterie) affichés sur la carte.
- Carte Lovelace `weather-station-card` avec la pluie heure par heure et un éditeur visuel.
