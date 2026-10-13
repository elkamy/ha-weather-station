# Journal des modifications

## Non publié

### Corrigé
- Le vent en m/s ou en nœuds (WindNerd par exemple) s'affiche avec une décimale (« 3,6 m/s » au lieu de « 4 m/s »).

## [0.3.0] — 2026-10-13

### Ajouté
- **Réinitialiser les mesures** : dans les options de l'intégration, après confirmation, toutes les mesures de pluie repartent de zéro et l'historique des graphiques de pluie est effacé. Aussi disponible en action `weather_station.reset_rain` pour les scripts et automatisations.

## [0.2.0] — 2026-10-13

### Ajouté
- **Tableau de bord météo** : une entrée « Météo » dans la barre latérale (un onglet par station) et une carte `weather-station-dashboard-card` pleine largeur.
  - Relevés actuels : minimum et maximum sur 24 h, tendance de la pression sur 3 h, boussole et force Beaufort, niveau UV.
  - Graphiques sur 24 h, 7 jours ou 30 jours, avec une infobulle au survol : pluie, températures, humidité, pression, vent et rafales, rose des vents, UV, luminosité et rayonnement.
  - Pluie mois par mois de l'année.
- Nouveaux capteurs facultatifs : rafales et direction du vent (en degrés ou en points cardinaux), indice UV, luminosité, rayonnement solaire.
- Point de rosée et température ressentie, calculés dès que la température et l'humidité sont renseignées.
- La carte compacte affiche aussi les rafales, la direction du vent et l'indice UV.

### Corrigé
- Les cartes ne restent plus en « Erreur de configuration » quand elles sont chargées depuis le cache du navigateur.

## [0.1.0] — 2026-10-13

### Ajouté
- Première version : une station météo construite autour d'un pluviomètre à auget basculeur relié à un capteur d'ouverture.
- Cumuls de pluie du jour, de la semaine, du mois et de l'année. Pluie sur la dernière heure et les dernières 24 h. Intensité, pluie totale, dernière pluie et capteur « Il pleut ».
- Calibration, anti-rebond et délai de fin de pluie réglables. Import de l'historique déjà enregistré.
- Capteurs facultatifs (température, humidité, pression, vent, batterie) affichés sur la carte.
- Carte Lovelace `weather-station-card` avec la pluie heure par heure et un éditeur visuel.
