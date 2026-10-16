# Journal des modifications

## [0.7.1] — 2026-10-16

### Ajouté
- **Nouveau graphique du vent**, comme sur les sites de prévisions : une barre de vent moyen par tranche (30 minutes sur 24 h, 3 heures sur 7 jours, un jour sur 30 jours), la rafale la plus forte de la tranche en repère au-dessus, et une flèche de direction en dessous. Le survol donne le vent moyen, la rafale et la provenance de chaque tranche.

### Corrigé
- Sur 24 h, les courbes sont tracées en paliers : chaque valeur reste affichée jusqu'à la suivante, comme Home Assistant l'enregistre, au lieu d'une ligne droite qui inventait des valeurs intermédiaires (par exemple une rafale qui semblait monter toute la nuit).
- Les relevés de la station prennent l'unité d'affichage du capteur d'origine même s'il était en veille à leur création (un anémomètre en m/s s'affichait en km/h).

## [0.7.0] — 2026-10-15

### Ajouté
- **Relevés de la station** : pour chaque capteur choisi (température, humidité, pression, vent, rafales, direction, UV, luminosité, rayonnement), la station crée sa propre entité, déclarée comme mesure dans une unité fixe et affichée dans l'unité du capteur d'origine. Home Assistant en garde les statistiques longue durée même quand le capteur d'origine n'en déclare pas (par exemple l'anémomètre WindNerd) : les graphiques 7 et 30 jours fonctionnent sans personnalisation YAML, et leur historique continue si vous remplacez un capteur.
- Le tableau de bord complète les statistiques du capteur d'origine par celles de la station : l'historique déjà enregistré est conservé.

## [0.6.1] — 2026-10-14

### Ajouté
- Quand le navigateur garde en cache une ancienne version des cartes après une mise à jour, elles affichent un bandeau « Une nouvelle version de Weather Station est installée : rechargez la page », au lieu de rester silencieusement sur l'ancienne version (par exemple sans la bande de prévisions).

## [0.6.0] — 2026-10-13

### Ajouté
- **Prévisions dans le tableau de bord** : les 5 prochains jours (ciel, températures, pluie et probabilité) d'après l'entité de prévisions de la station, mis à jour automatiquement. L'en-tête donne aussi l'état du ciel.

### Corrigé
- Retirer un capteur avec **Reconfigurer** supprime désormais les entités qui en dépendaient (risque de gel, point de rosée, ressenti, vent fort) au lieu de les laisser « indisponibles ».

## [0.5.1] — 2026-10-13

### Corrigé
- **Reconfigurer** ne déclenche plus d'avertissement « update listener » dans le journal de Home Assistant : la station est rechargée une seule fois, par l'intégration elle-même. Sans cette correction, Reconfigurer aurait cessé de fonctionner avec Home Assistant 2026.12.

## [0.5.0] — 2026-10-13

### Ajouté
- **Entité météo** `weather.<station>` pour la carte Prévisions météo et Assist : relevés de la station et état du ciel déduit de ses capteurs (pluie, vent fort, rayonnement ou luminosité).
- Nouveau champ facultatif **Prévisions** : une entité météo existante (Météo-France, Met.no…) prête ses prévisions quotidiennes et horaires à la station, unités converties, et complète l'état du ciel.

### Corrigé
- Le menu **Réglages du pluviomètre** des options ne s'ouvre plus en erreur avec les versions récentes de Home Assistant (régression de la 0.4.0).

## [0.4.0] — 2026-10-13

### Ajouté
- **Alertes** : capteurs « Risque de gel » et « Vent fort », avec des seuils réglables dans les options (menu **Seuils d'alerte**) et un décalage entre début et fin pour éviter les alertes en rafale. L'événement `weather_station_alert` est émis au début et à la fin de chaque épisode de gel, de vent fort et de pluie, pour envoyer vos notifications depuis une automatisation. Un redémarrage ne rejoue jamais un épisode en cours.
- Le tableau de bord affiche une pastille pendant une alerte de gel ou de vent fort.

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
