import io
import random
from decimal import Decimal
from datetime import timedelta

from django.core.files.base import ContentFile
from PIL import Image, ImageDraw, ImageFont

from django.core.management.base import BaseCommand
from django.utils import timezone

from users.models import Utilisateur, Prestataire
from services.models import Categorie, Service, PrestataireService
from demandes.models import Demande
from propositions.models import Proposition
from missions.models import Mission
from avis.models import Avis
from messagerie.models import Conversation, Message
from recommandations.logic import calculer_recommandations

DEMO_PASSWORD = "Demo1234!"
NB_MOIS_HISTORIQUE = 8  # profondeur de l'historique généré (pour l'évolution mensuelle)

VILLES = {
    "Antananarivo": (-18.8792, 47.5079),
    "Antsirabe": (-19.8659, 47.0333),
    "Toamasina": (-18.1492, 49.4023),
    "Fianarantsoa": (-21.4527, 47.0857),
    "Mahajanga": (-15.7167, 46.3167),
}


def jitter(base, spread=0.05):
    return Decimal(str(round(base + random.uniform(-spread, spread), 7)))


def coords(ville):
    lat, lon = VILLES[ville]
    return jitter(lat), jitter(lon)


def montant(min_k, max_k):
    """Montant en Ariary, par tranche de 1 000."""
    return Decimal(random.randrange(min_k, max_k)) * 1000


class Command(BaseCommand):
    help = "Peuple la base avec des données de démonstration cohérentes pour le projet."

    def handle(self, *args, **options):
        random.seed(42)
        self.now = timezone.now()
        self.stdout.write("Démarrage du seed...")

        self.seed_admin()
        categories = self.seed_categories()
        services = self.seed_services(categories)
        clients = self.seed_clients()
        prestataires = self.seed_prestataires()
        self.seed_prestataire_services(prestataires, services)
        demandes = self.seed_demandes(clients, services)
        propositions = self.seed_propositions(demandes, prestataires)
        missions = self.seed_missions(propositions)
        self.seed_avis(missions)
        self.seed_verifications(prestataires)
        self.seed_conversations(propositions)
        self.seed_recommandations(demandes)

        self.stdout.write(self.style.SUCCESS("Seed terminé avec succès."))
        self.stdout.write(f"  Mot de passe de tous les comptes de démo : {DEMO_PASSWORD}")

    # ------------------------------------------------------------------
    def seed_admin(self):
        user, created = Utilisateur.objects.get_or_create(
            username="admin",
            defaults=dict(
                email="admin@example.mg",
                first_name="Admin",
                last_name="Plateforme",
                role=Utilisateur.Role.ADMIN,
                is_staff=True,
                is_superuser=True,
            ),
        )
        if created:
            user.set_password(DEMO_PASSWORD)
            user.save()
        self.stdout.write("  Compte admin prêt (admin).")

    def seed_categories(self):
        noms = [
            ("Informatique", "Dépannage, installation et maintenance informatique"),
            ("Plomberie", "Réparation et installation de plomberie"),
            ("Électricité", "Installation et dépannage électrique"),
            ("Ménage", "Nettoyage et entretien de la maison"),
            ("Transport", "Déménagement et livraison"),
            ("Cours particuliers", "Soutien scolaire et cours à domicile"),
            ("Réparation", "Réparation d'appareils électroménagers"),
            ("Beauté", "Coiffure, manucure et soins esthétiques à domicile"),
            ("Jardinage", "Entretien de jardins et espaces verts"),
            ("Événementiel", "Organisation et logistique d'événements"),
        ]
        result = {}
        for nom, desc in noms:
            cat, _ = Categorie.objects.get_or_create(
                nom=nom, defaults={"description": desc, "active": True}
            )
            result[nom] = cat
        self.stdout.write(f"  {len(result)} catégories prêtes.")
        return result

    def seed_services(self, categories):
        data = {
            "Informatique": ["Réparation ordinateur", "Installation logiciel", "Dépannage réseau"],
            "Plomberie": ["Réparation de fuite", "Installation de robinet", "Débouchage canalisation"],
            "Électricité": ["Installation électrique", "Dépannage électrique"],
            "Ménage": ["Ménage à domicile", "Grand nettoyage"],
            "Transport": ["Déménagement", "Livraison de colis"],
            "Cours particuliers": ["Cours de mathématiques", "Cours d'anglais"],
            "Réparation": ["Réparation électroménager"],
            "Beauté": ["Coiffure à domicile", "Manucure à domicile"],
            "Jardinage": ["Entretien de jardin"],
            "Événementiel": ["Organisation d'événement"],
        }
        result = []
        for cat_nom, noms in data.items():
            cat = categories[cat_nom]
            for nom in noms:
                service, _ = Service.objects.get_or_create(
                    categorie=cat, nom=nom,
                    defaults={"description": f"{nom} proposé par nos prestataires.", "active": True},
                )
                result.append(service)
        self.stdout.write(f"  {len(result)} services prêts.")
        return result

    def seed_clients(self):
        noms = [
            ("Jean", "Rakoto", "Analakely", "Antananarivo"),
            ("Marie", "Razafindrabe", "Ankorondrano", "Antananarivo"),
            ("Paul", "Andrianaivo", "Ivandry", "Antananarivo"),
            ("Hanta", "Rasoanaivo", "Tsaralalana", "Antananarivo"),
            ("Tiana", "Ravalomanana", "Ambohipo", "Antananarivo"),
            ("Nirina", "Randria", "Itaosy", "Antananarivo"),
            ("Mamy", "Rakotoarivelo", "Ambatobe", "Antananarivo"),
            ("Haja", "Rasolofo", "Alasora", "Antananarivo"),
            ("Lova", "Andriamampianina", "Ankadifotsy", "Antananarivo"),
            ("Voahangi", "Ratsimba", "Antanimena", "Antananarivo"),
            ("Rija", "Rakotondrabe", "Ambohimanarina", "Antananarivo"),
            ("Sitraka", "Ramaroson", "Andravoahangy", "Antananarivo"),
            ("Faly", "Rabemananjara", "Antsirabe-Centre", "Antsirabe"),
            ("Noro", "Andriamanantena", "Mahazoarivo", "Antsirabe"),
            ("Tojo", "Rakotonirina", "Tanambao", "Toamasina"),
            ("Vola", "Razanadrakoto", "Ankirihiry", "Toamasina"),
            ("Mirana", "Rafaralahy", "Isada", "Fianarantsoa"),
            ("Andry", "Ratovonirina", "Mahabibo", "Mahajanga"),
        ]
        clients = []
        for i, (prenom, nom, quartier, ville) in enumerate(noms, start=1):
            username = f"client_{prenom.lower()}{i}"
            user, created = Utilisateur.objects.get_or_create(
                username=username,
                defaults=dict(
                    email=f"{username}@example.mg",
                    first_name=prenom,
                    last_name=nom,
                    role=Utilisateur.Role.CLIENT,
                    telephone=f"034{random.randint(1000000, 9999999)}",
                ),
            )
            if created:
                user.set_password(DEMO_PASSWORD)
                user.save()
            client = user.client_profile
            client.adresse = f"Lot {random.randint(1, 300)} {quartier}"
            client.ville = ville
            client.latitude, client.longitude = coords(ville)
            client.save()
            clients.append(client)
        self.stdout.write(f"  {len(clients)} clients prêts.")
        return clients

    def seed_prestataires(self):
        # (prénom, nom, quartier, ville, années d'expérience, disponible, statut de validation)
        V, A = Prestataire.StatutValidation.VALIDE, Prestataire.StatutValidation.EN_ATTENTE
        data = [
            ("Toky", "Rajaonarivelo", "Ankorondrano", "Antananarivo", 5, True, V),
            ("Fetra", "Rabe", "Andoharanofotsy", "Antananarivo", 3, True, V),
            ("Zo", "Rasolonjatovo", "Isotry", "Antananarivo", 8, True, V),
            ("Fy", "Ramanantsoa", "Analakely", "Antananarivo", 2, True, V),
            ("Nina", "Razanajatovo", "Ivandry", "Antananarivo", 6, False, V),
            ("Dera", "Andrianarivo", "Ambohipo", "Antananarivo", 10, True, V),
            ("Tahina", "Rakotovao", "Tsaralalana", "Antananarivo", 1, True, V),
            ("Soa", "Raharinirina", "Ambatobe", "Antananarivo", 4, True, V),
            ("Hery", "Randrianasolo", "Itaosy", "Antananarivo", 7, True, V),
            ("Njara", "Rakotomalala", "Alasora", "Antananarivo", 3, False, V),
            ("Mialy", "Ranaivoson", "Ankadifotsy", "Antananarivo", 9, True, V),
            ("Bako", "Rasamimanana", "Antanimena", "Antananarivo", 2, True, V),
            ("Tsiry", "Andriamahefa", "Ambohimanarina", "Antananarivo", 12, True, V),
            ("Lalaina", "Rakotoson", "Antsirabe-Centre", "Antsirabe", 6, True, V),
            ("Hasina", "Razafimahatratra", "Tanambao", "Toamasina", 4, True, V),
            ("Ony", "Randrianarisoa", "Isada", "Fianarantsoa", 5, True, V),
            ("Koloina", "Rabarijaona", "Andravoahangy", "Antananarivo", 1, True, A),
            ("Mahefa", "Ratsimbazafy", "Mahabibo", "Mahajanga", 3, True, A),
        ]
        prestataires = []
        for i, (prenom, nom, quartier, ville, exp, dispo, validation) in enumerate(data, start=1):
            username = f"presta_{prenom.lower()}{i}"
            user, created = Utilisateur.objects.get_or_create(
                username=username,
                defaults=dict(
                    email=f"{username}@example.mg",
                    first_name=prenom,
                    last_name=nom,
                    role=Utilisateur.Role.PRESTATAIRE,
                    telephone=f"033{random.randint(1000000, 9999999)}",
                ),
            )
            if created:
                user.set_password(DEMO_PASSWORD)
                user.save()
            presta = user.prestataire_profile
            presta.description = (
                f"Prestataire avec {exp} an(s) d'expérience, basé à {quartier}, {ville}. "
                "Interventions soignées, devis clair et respect des délais."
            )
            presta.adresse = f"Lot {random.randint(1, 300)} {quartier}"
            presta.ville = ville
            presta.latitude, presta.longitude = coords(ville)
            presta.annee_experience = exp
            presta.statut_validation = validation
            presta.date_validation = (
                self.now - timedelta(days=random.randint(60, 300))
                if validation == Prestataire.StatutValidation.VALIDE else None
            )
            presta.disponible = dispo
            presta.save()
            prestataires.append(presta)
        self.stdout.write(f"  {len(prestataires)} prestataires prêts.")
        return prestataires

    def seed_prestataire_services(self, prestataires, services):
        count = 0
        for presta in prestataires:
            chosen = random.sample(services, k=random.choice([2, 3, 3, 4]))
            for service in chosen:
                tarif_min = montant(10, 60)
                tarif_max = tarif_min + montant(20, 100)
                _, created = PrestataireService.objects.get_or_create(
                    prestataire=presta, service=service,
                    defaults=dict(tarif_min=tarif_min, tarif_max=tarif_max, actif=True),
                )
                if created:
                    count += 1
        self.stdout.write(f"  {count} associations prestataire-service créées.")

    # ------------------------------------------------------------------
    TITRES_PAR_SERVICE = {
        "Réparation ordinateur": [
            "Réparation urgente d'un ordinateur portable",
            "Écran de PC fixe qui ne s'allume plus",
            "Remplacement du disque dur par un SSD",
        ],
        "Installation logiciel": [
            "Installation d'un logiciel de comptabilité",
            "Réinstallation complète de Windows",
            "Installation d'une suite bureautique sur 3 postes",
        ],
        "Dépannage réseau": [
            "Wifi instable dans toute la maison",
            "Configuration du réseau d'un petit bureau",
        ],
        "Réparation de fuite": [
            "Fuite d'eau sous l'évier de la cuisine",
            "Fuite au niveau du chauffe-eau",
            "Infiltration d'eau dans la salle de bain",
        ],
        "Installation de robinet": [
            "Remplacement du mitigeur de la cuisine",
            "Installation d'un robinet extérieur",
        ],
        "Débouchage canalisation": [
            "Débouchage de canalisation bouchée",
            "Évier de cuisine complètement bouché",
            "WC bouché à déboucher rapidement",
        ],
        "Installation électrique": [
            "Installation d'une prise électrique supplémentaire",
            "Mise aux normes du tableau électrique",
            "Installation de luminaires dans le salon",
        ],
        "Dépannage électrique": [
            "Coupure de courant partielle dans la maison",
            "Prises qui ne fonctionnent plus dans la chambre",
        ],
        "Ménage à domicile": [
            "Ménage hebdomadaire d'un appartement",
            "Nettoyage après travaux de peinture",
        ],
        "Grand nettoyage": [
            "Grand nettoyage avant déménagement",
            "Grand nettoyage de printemps d'une villa",
        ],
        "Déménagement": [
            "Déménagement d'un appartement 2 pièces",
            "Transport de meubles vers Antsirabe",
            "Déménagement de bureaux (15 postes)",
        ],
        "Livraison de colis": [
            "Livraison d'un colis fragile en centre-ville",
            "Livraisons quotidiennes pour une boutique en ligne",
        ],
        "Cours de mathématiques": [
            "Cours de soutien en mathématiques niveau collège",
            "Préparation au bac en mathématiques",
        ],
        "Cours d'anglais": [
            "Cours d'anglais conversationnel pour adulte",
            "Soutien en anglais pour un élève de 3ème",
        ],
        "Réparation électroménager": [
            "Réparation d'un réfrigérateur",
            "Machine à laver qui ne vidange plus",
            "Four électrique qui ne chauffe plus",
        ],
        "Coiffure à domicile": [
            "Coiffure pour mariage à domicile",
            "Coupe et brushing à domicile",
        ],
        "Manucure à domicile": [
            "Manucure et pose de vernis semi-permanent",
        ],
        "Entretien de jardin": [
            "Entretien du jardin et taille des haies",
            "Tonte de pelouse et désherbage",
            "Plantation d'arbres fruitiers",
        ],
        "Organisation d'événement": [
            "Organisation d'un petit événement familial",
            "Logistique d'un anniversaire pour 50 personnes",
            "Organisation d'un séminaire d'entreprise",
        ],
    }

    DESCRIPTIONS = [
        "Intervention souhaitée rapidement, merci de proposer vos disponibilités.",
        "Je suis disponible en semaine après 17h et le samedi matin.",
        "Merci d'indiquer un devis détaillé avant l'intervention.",
        "Le matériel nécessaire est à prévoir par le prestataire.",
        "Travail à réaliser avec soin, c'est pour un logement en location.",
    ]

    def _date_creation_aleatoire(self):
        """Tire une date dans les NB_MOIS_HISTORIQUE derniers mois, avec une activité croissante."""
        poids = [i + 2 for i in range(NB_MOIS_HISTORIQUE)]  # mois récents plus probables
        mois_recul = random.choices(range(NB_MOIS_HISTORIQUE), weights=poids)[0]
        mois_recul = NB_MOIS_HISTORIQUE - 1 - mois_recul
        jours = mois_recul * 30 + random.randint(0, 29)
        return self.now - timedelta(days=jours, hours=random.randint(0, 23), minutes=random.randint(0, 59))

    def _statut_selon_age(self, age_jours):
        S = Demande.Statut
        if age_jours > 60:
            choix, poids = [S.TERMINEE, S.ANNULEE, S.EN_COURS, S.PUBLIEE], [70, 15, 10, 5]
        elif age_jours > 20:
            choix, poids = [S.TERMINEE, S.EN_COURS, S.PUBLIEE, S.ANNULEE], [40, 35, 15, 10]
        else:
            choix, poids = [S.PUBLIEE, S.EN_COURS, S.BROUILLON, S.ANNULEE], [50, 30, 15, 5]
        return random.choices(choix, weights=poids)[0]

    def seed_demandes(self, clients, services):
        demandes = []
        for client in clients:
            nb = random.choice([4, 5, 6, 7, 8])
            titres_utilises = set()
            for _ in range(nb):
                service = random.choice(services)
                titre = random.choice(self.TITRES_PAR_SERVICE[service.nom])
                if titre in titres_utilises:
                    titre = f"{titre} (bis)"
                if titre in titres_utilises:
                    continue
                titres_utilises.add(titre)

                date_creation = self._date_creation_aleatoire()
                age_jours = (self.now - date_creation).days
                statut = self._statut_selon_age(age_jours)
                budget_min = montant(20, 60)
                budget_max = budget_min + montant(30, 100)
                lat, lon = coords(client.ville)

                demande, created = Demande.objects.get_or_create(
                    client=client, titre=titre,
                    defaults=dict(
                        service=service,
                        description=f"{titre}. {random.choice(self.DESCRIPTIONS)}",
                        budget_min=budget_min,
                        budget_max=budget_max,
                        date_souhaitee=(date_creation + timedelta(days=random.randint(2, 20))).date(),
                        urgence=random.choices(
                            Demande.Urgence.values, weights=[25, 50, 25]
                        )[0],
                        adresse=client.adresse or client.ville,
                        latitude=lat,
                        longitude=lon,
                        statut=statut,
                    ),
                )
                if created:
                    # date_creation est en auto_now_add : on la force après coup
                    Demande.objects.filter(pk=demande.pk).update(
                        date_creation=date_creation, date_modification=date_creation
                    )
                    demande.date_creation = date_creation
                demandes.append(demande)
        self.stdout.write(f"  {len(demandes)} demandes prêtes.")
        return demandes

    MESSAGES_PROPOSITION = [
        "Je suis disponible pour réaliser cette prestation rapidement.",
        "J'ai déjà réalisé plusieurs interventions similaires, je peux passer dès demain.",
        "Devis incluant le déplacement et la main d'œuvre, matériel en sus.",
        "Disponible cette semaine, garantie sur le travail effectué.",
        "Je propose un tarif ajusté à votre budget, n'hésitez pas à me contacter.",
    ]

    def seed_propositions(self, demandes, prestataires):
        S, P = Demande.Statut, Proposition.Statut
        propositions = []
        for demande in demandes:
            if demande.statut == S.BROUILLON:
                continue
            compatibles = [
                ps.prestataire for ps in PrestataireService.objects.filter(
                    service=demande.service, actif=True
                ).select_related("prestataire")
            ]
            if not compatibles:
                compatibles = random.sample(prestataires, k=min(3, len(prestataires)))

            if demande.statut == S.PUBLIEE:
                nb = random.choices([0, 1, 2, 3], weights=[15, 40, 30, 15])[0]
                statuts = [P.EN_ATTENTE] * nb
            elif demande.statut in (S.EN_COURS, S.TERMINEE):
                nb_refusees = random.choices([0, 1, 2], weights=[40, 40, 20])[0]
                statuts = [P.ACCEPTEE] + [P.REFUSEE] * nb_refusees
            elif random.random() < 0.3:
                # Demande annulée après acceptation : la mission sera marquée ANNULEE
                statuts = [P.ACCEPTEE] + [P.REFUSEE] * random.choice([0, 1])
            else:  # ANNULEE avant toute acceptation
                statuts = [P.ANNULEE] * random.choices([0, 1, 2], weights=[40, 40, 20])[0]

            chosen = random.sample(compatibles, k=min(len(compatibles), len(statuts)))
            for presta, statut in zip(chosen, statuts):
                date_proposition = demande.date_creation + timedelta(
                    hours=random.randint(1, 72), minutes=random.randint(0, 59)
                )
                date_reponse = None
                if statut in (P.ACCEPTEE, P.REFUSEE):
                    date_reponse = date_proposition + timedelta(hours=random.randint(1, 48))
                elif statut == P.ANNULEE:
                    date_reponse = date_proposition + timedelta(hours=random.randint(12, 96))

                prop, created = Proposition.objects.get_or_create(
                    demande=demande, prestataire=presta,
                    defaults=dict(
                        message=random.choice(self.MESSAGES_PROPOSITION),
                        tarif_propose=montant(20, 150),
                        statut=statut,
                        date_reponse=date_reponse,
                    ),
                )
                if created:
                    Proposition.objects.filter(pk=prop.pk).update(date_proposition=date_proposition)
                    prop.date_proposition = date_proposition
                propositions.append(prop)
        self.stdout.write(f"  {len(propositions)} propositions prêtes.")
        return propositions

    def seed_missions(self, propositions):
        missions = []
        acceptees = [p for p in propositions if p.statut == Proposition.Statut.ACCEPTEE]
        for prop in acceptees:
            demande_statut = prop.demande.statut
            date_debut = prop.date_reponse or prop.date_proposition
            if demande_statut == Demande.Statut.TERMINEE:
                statut = Mission.Statut.TERMINEE
                date_fin = date_debut + timedelta(days=random.randint(1, 10), hours=random.randint(0, 8))
            elif demande_statut == Demande.Statut.ANNULEE:
                statut = Mission.Statut.ANNULEE
                date_fin = date_debut + timedelta(days=random.randint(1, 5))
            else:
                statut = Mission.Statut.EN_COURS
                date_fin = None

            mission, created = Mission.objects.get_or_create(
                proposition=prop,
                defaults=dict(statut=statut, date_fin=date_fin),
            )
            if created:
                Mission.objects.filter(pk=mission.pk).update(date_debut=date_debut)
                mission.date_debut = date_debut
            missions.append(mission)
        self.stdout.write(f"  {len(missions)} missions prêtes.")
        return missions

    COMMENTAIRES_PAR_NOTE = {
        2: [
            "Prestation décevante, plusieurs points à reprendre.",
            "Beaucoup de retard et résultat moyen.",
        ],
        3: [
            "Un peu de retard mais travail bien fait.",
            "Correct sans plus, le prix était un peu élevé.",
        ],
        4: [
            "Bon rapport qualité-prix, satisfait du résultat.",
            "Communication claire, prestation conforme à mes attentes.",
            "Travail propre, je recommande.",
        ],
        5: [
            "Travail rapide et soigné, je recommande vivement.",
            "Très professionnel, ponctuel et efficace.",
            "Excellent service, à refaire sans hésiter.",
        ],
    }

    def seed_avis(self, missions):
        count = 0
        for mission in missions:
            if mission.statut != Mission.Statut.TERMINEE:
                continue
            if random.random() > 0.85:
                continue  # quelques missions sans avis
            note = random.choices([2, 3, 4, 5], weights=[5, 15, 40, 40])[0]
            date_avis = (mission.date_fin or self.now) + timedelta(hours=random.randint(2, 72))
            avis, created = Avis.objects.get_or_create(
                mission=mission,
                defaults=dict(
                    note=note,
                    commentaire=random.choice(self.COMMENTAIRES_PAR_NOTE[note]),
                    visible=True,
                ),
            )
            if created:
                Avis.objects.filter(pk=avis.pk).update(date_creation=min(date_avis, self.now))
                count += 1
        self.stdout.write(f"  {count} avis créés.")

    # ------------------------------------------------------------------
    # Vérification d'identité : images de démonstration clairement fictives
    # ------------------------------------------------------------------
    def _image_specimen(self, nom, type_document):
        largeur, hauteur = 856, 540
        image = Image.new("RGB", (largeur, hauteur), (236, 241, 248))
        draw = ImageDraw.Draw(image)
        for y in range(hauteur):
            teinte = int(236 - 40 * y / hauteur)
            draw.line([(0, y), (largeur, y)], fill=(teinte, teinte + 5, 248))
        try:
            grande = ImageFont.load_default(size=40)
            moyenne = ImageFont.load_default(size=26)
            petite = ImageFont.load_default(size=20)
        except TypeError:
            grande = moyenne = petite = ImageFont.load_default()
        draw.rounded_rectangle([24, 24, largeur - 24, hauteur - 24], radius=28, outline=(74, 112, 169), width=4)
        draw.rounded_rectangle([60, 150, 260, 400], radius=18, fill=(200, 212, 230))
        draw.ellipse([115, 185, 205, 275], fill=(150, 170, 200))
        draw.rounded_rectangle([95, 285, 225, 380], radius=40, fill=(150, 170, 200))
        draw.text((60, 60), "DOCUMENT FICTIF DE DÉMONSTRATION", font=moyenne, fill=(74, 112, 169))
        draw.text((300, 170), type_document, font=petite, fill=(90, 100, 120))
        draw.text((300, 205), nom.upper(), font=grande, fill=(27, 36, 48))
        draw.text((300, 270), "N° 000 000 000 000", font=moyenne, fill=(60, 70, 90))
        draw.text((300, 320), "Données générées par le seed", font=petite, fill=(90, 100, 120))
        draw.text((210, 440), "SPÉCIMEN - SANS VALEUR", font=grande, fill=(209, 72, 77))
        tampon = io.BytesIO()
        image.save(tampon, format="PNG")
        return ContentFile(tampon.getvalue())

    def seed_verifications(self, prestataires):
        """Les prestataires en attente ont envoyé un document ; un prestataire est refusé avec motif."""
        S = Prestataire.StatutValidation
        a_traiter = [p for p in prestataires if p.statut_validation == S.EN_ATTENTE]
        refuse = next((p for p in prestataires if p.utilisateur.username == "presta_bako12"), None)
        count = 0
        for i, presta in enumerate(a_traiter + ([refuse] if refuse else [])):
            if presta.document_identite:
                if presta is refuse and presta.statut_validation != S.REFUSE:
                    presta.statut_validation = S.REFUSE
                    presta.date_validation = None
                    presta.save()
                continue
            type_doc = [Prestataire.TypeDocument.CIN, Prestataire.TypeDocument.PASSEPORT][i % 2]
            nom = f"{presta.utilisateur.first_name} {presta.utilisateur.last_name}"
            presta.document_identite.save(
                f"prestataire_{presta.pk}.png",
                self._image_specimen(nom, Prestataire.TypeDocument(type_doc).label),
                save=False,
            )
            presta.type_document = type_doc
            presta.date_soumission = self.now - timedelta(days=random.randint(1, 6), hours=random.randint(0, 12))
            if presta is refuse:
                presta.statut_validation = S.REFUSE
                presta.date_validation = None
                presta.motif_refus = "Photo floue : les informations du document sont illisibles. Merci d'envoyer une image nette."
            presta.save()
            count += 1
        self.stdout.write(f"  {count} pièces d'identité de démonstration ajoutées.")

    # ------------------------------------------------------------------
    # Messagerie : quelques conversations, dont des négociations de tarif
    # ------------------------------------------------------------------
    def seed_conversations(self, propositions):
        P = Proposition.Statut
        en_attente = [p for p in propositions if p.statut == P.EN_ATTENTE][:8]
        acceptees = [p for p in propositions if p.statut == P.ACCEPTEE][-4:]
        count = 0
        for prop in en_attente + acceptees:
            conversation, _ = Conversation.objects.get_or_create(proposition=prop)
            if conversation.messages.exists():
                continue
            client = prop.demande.client.utilisateur
            presta = prop.prestataire.utilisateur
            debut = prop.date_proposition + timedelta(hours=random.randint(1, 6))
            tarif = int(prop.tarif_propose)
            nouveau = max(10000, tarif - random.choice([5000, 10000, 15000]))
            echanges = [
                (client, "NORMAL", "Bonjour, merci pour votre proposition. Le tarif me semble un peu élevé, est-il négociable ?"),
                (presta, "NORMAL", f"Bonjour ! Je peux faire un geste et descendre à {nouveau:,} Ar si l'intervention est en semaine.".replace(",", " ")),
                (client, "NORMAL", "Ça me convient, merci. Pouvez-vous mettre à jour la proposition ?"),
            ]
            if prop.statut == P.EN_ATTENTE and len(en_attente) and prop in en_attente[:4]:
                echanges.append((None, "SYSTEME", f"Tarif modifié : {tarif:,} Ar → {nouveau:,} Ar".replace(",", " ")))
                echanges.append((presta, "NORMAL", "C'est fait, le nouveau tarif est visible dans la proposition."))
                Proposition.objects.filter(pk=prop.pk).update(tarif_propose=Decimal(nouveau))
            if prop.statut == P.ACCEPTEE:
                echanges.append((None, "SYSTEME", "Proposition acceptée par le client. La mission a démarré."))
                echanges.append((presta, "NORMAL", "Merci pour votre confiance, je vous appelle la veille pour confirmer l'heure."))

            date_msg = debut
            for auteur, type_msg, contenu in echanges:
                message = Message.objects.create(
                    conversation=conversation, auteur=auteur, type=type_msg, contenu=contenu
                )
                Message.objects.filter(pk=message.pk).update(date_envoi=min(date_msg, self.now))
                date_msg += timedelta(minutes=random.randint(5, 180))
            # Le prestataire a tout lu ; le client a un dernier message non lu.
            Conversation.objects.filter(pk=conversation.pk).update(
                date_creation=debut,
                dernier_lu_prestataire=min(date_msg, self.now),
                dernier_lu_client=min(date_msg - timedelta(minutes=200), self.now),
            )
            count += 1
        self.stdout.write(f"  {count} conversations créées.")

    def seed_recommandations(self, demandes):
        for demande in demandes:
            try:
                calculer_recommandations(demande)
            except Exception as e:
                self.stdout.write(self.style.WARNING(
                    f"  Recommandation ignorée pour '{demande.titre}': {e}"
                ))
        self.stdout.write("  Recommandations calculées pour toutes les demandes.")
