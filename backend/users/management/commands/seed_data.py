import random
from decimal import Decimal
from datetime import date, timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from users.models import Utilisateur, Prestataire
from services.models import Categorie, Service, PrestataireService
from demandes.models import Demande
from propositions.models import Proposition
from missions.models import Mission
from avis.models import Avis
from recommandations.logic import calculer_recommandations

ANTANANARIVO_CENTER = (-18.8792, 47.5079)


def jitter(base, spread=0.05):
    return Decimal(str(round(base + random.uniform(-spread, spread), 7)))


class Command(BaseCommand):
    help = "Peuple la base avec des données de démonstration cohérentes pour le projet."

    def handle(self, *args, **options):
        random.seed(42)
        self.stdout.write("Démarrage du seed...")

        categories = self.seed_categories()
        services = self.seed_services(categories)
        clients = self.seed_clients()
        prestataires = self.seed_prestataires()
        self.seed_prestataire_services(prestataires, services)
        demandes = self.seed_demandes(clients, services)
        propositions = self.seed_propositions(demandes, prestataires)
        missions = self.seed_missions(propositions)
        self.seed_avis(missions)
        self.seed_recommandations(demandes)

        self.stdout.write(self.style.SUCCESS("Seed terminé avec succès."))

    # ------------------------------------------------------------------
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
            ("Jean", "Rakoto", "Analakely"),
            ("Marie", "Razafindrabe", "Ankorondrano"),
            ("Paul", "Andrianaivo", "Ivandry"),
            ("Hanta", "Rasoanaivo", "Tsaralalana"),
            ("Tiana", "Ravalomanana", "Ambohipo"),
            ("Nirina", "Randria", "Itaosy"),
            ("Mamy", "Rakotoarivelo", "Ambatobe"),
            ("Haja", "Rasolofo", "Alasora"),
            ("Lova", "Andriamampianina", "Ankadifotsy"),
            ("Voahangi", "Ratsimba", "Antanimena"),
        ]
        clients = []
        for i, (prenom, nom, quartier) in enumerate(noms, start=1):
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
                user.set_password("Demo1234!")
                user.save()
            client = user.client_profile
            client.adresse = f"Lot {random.randint(1, 300)} {quartier}"
            client.ville = "Antananarivo"
            lat, lon = ANTANANARIVO_CENTER
            client.latitude = jitter(lat)
            client.longitude = jitter(lon)
            client.save()
            clients.append(client)
        self.stdout.write(f"  {len(clients)} clients prêts.")
        return clients

    def seed_prestataires(self):
        data = [
            ("Toky", "Rajaonarivelo", "Ankorondrano", 5, True),
            ("Fetra", "Rabe", "Andoharanofotsy", 3, True),
            ("Zo", "Rasolonjatovo", "Isotry", 8, True),
            ("Fy", "Ramanantsoa", "Analakely", 2, True),
            ("Nina", "Razanajatovo", "Ivandry", 6, False),
            ("Dera", "Andrianarivo", "Ambohipo", 10, True),
            ("Tahina", "Rakotovao", "Tsaralalana", 1, True),
            ("Soa", "Raharinirina", "Ambatobe", 4, True),
            ("Hery", "Randrianasolo", "Itaosy", 7, True),
            ("Njara", "Rakotomalala", "Alasora", 3, False),
            ("Mialy", "Ranaivoson", "Ankadifotsy", 9, True),
            ("Bako", "Rasamimanana", "Antanimena", 2, True),
        ]
        prestataires = []
        for i, (prenom, nom, quartier, exp, dispo) in enumerate(data, start=1):
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
                user.set_password("Demo1234!")
                user.save()
            presta = user.prestataire_profile
            presta.description = f"Prestataire expérimenté basé à {quartier}, Antananarivo."
            presta.adresse = f"Lot {random.randint(1, 300)} {quartier}"
            presta.ville = "Antananarivo"
            lat, lon = ANTANANARIVO_CENTER
            presta.latitude = jitter(lat)
            presta.longitude = jitter(lon)
            presta.annee_experience = exp
            presta.statut_validation = Prestataire.StatutValidation.VALIDE
            presta.disponible = dispo
            presta.save()
            prestataires.append(presta)
        self.stdout.write(f"  {len(prestataires)} prestataires prêts.")
        return prestataires

    def seed_prestataire_services(self, prestataires, services):
        count = 0
        for presta in prestataires:
            chosen = random.sample(services, k=random.choice([1, 2]))
            for service in chosen:
                tarif_min = Decimal(random.randrange(10, 60)) * 1000
                tarif_max = tarif_min + Decimal(random.randrange(20, 100)) * 1000
                _, created = PrestataireService.objects.get_or_create(
                    prestataire=presta, service=service,
                    defaults=dict(tarif_min=tarif_min, tarif_max=tarif_max, actif=True),
                )
                if created:
                    count += 1
        self.stdout.write(f"  {count} associations prestataire-service créées.")

    def seed_demandes(self, clients, services):
        titres = [
            "Réparation urgente d'un ordinateur portable",
            "Fuite d'eau sous l'évier de la cuisine",
            "Installation d'une prise électrique supplémentaire",
            "Grand nettoyage avant déménagement",
            "Déménagement d'un appartement 2 pièces",
            "Cours de soutien en mathématiques niveau collège",
            "Réparation d'un réfrigérateur",
            "Coiffure pour mariage à domicile",
            "Entretien du jardin et taille des haies",
            "Organisation d'un petit événement familial",
            "Débouchage de canalisation bouchée",
            "Installation d'un logiciel de comptabilité",
        ]
        statuts = [Demande.Statut.PUBLIEE, Demande.Statut.EN_COURS, Demande.Statut.TERMINEE]
        demandes = []
        for i, titre in enumerate(titres):
            client = clients[i % len(clients)]
            service = services[i % len(services)]
            budget_min = Decimal(random.randrange(20, 50)) * 1000
            budget_max = budget_min + Decimal(random.randrange(30, 80)) * 1000
            lat, lon = ANTANANARIVO_CENTER
            demande, created = Demande.objects.get_or_create(
                client=client, titre=titre,
                defaults=dict(
                    service=service,
                    description=f"{titre}. Intervention souhaitée rapidement, merci de proposer vos disponibilités.",
                    budget_min=budget_min,
                    budget_max=budget_max,
                    date_souhaitee=date.today() + timedelta(days=random.randint(1, 20)),
                    urgence=random.choice(Demande.Urgence.values),
                    adresse=client.adresse or "Antananarivo",
                    latitude=jitter(lat),
                    longitude=jitter(lon),
                    statut=random.choice(statuts),
                ),
            )
            demandes.append(demande)
        self.stdout.write(f"  {len(demandes)} demandes prêtes.")
        return demandes

    def seed_propositions(self, demandes, prestataires):
        propositions = []
        for demande in demandes:
            compatibles = [
                ps.prestataire for ps in PrestataireService.objects.filter(
                    service=demande.service, actif=True
                )
            ]
            if not compatibles:
                compatibles = random.sample(prestataires, k=min(2, len(prestataires)))
            chosen = random.sample(compatibles, k=min(len(compatibles), random.choice([1, 2])))
            for presta in chosen:
                tarif = Decimal(random.randrange(20, 120)) * 1000
                statut = Proposition.Statut.EN_ATTENTE
                if demande.statut in (Demande.Statut.EN_COURS, Demande.Statut.TERMINEE):
                    statut = Proposition.Statut.ACCEPTEE
                prop, created = Proposition.objects.get_or_create(
                    demande=demande, prestataire=presta,
                    defaults=dict(
                        message="Je suis disponible pour réaliser cette prestation rapidement.",
                        tarif_propose=tarif,
                        statut=statut,
                        date_reponse=timezone.now() if statut == Proposition.Statut.ACCEPTEE else None,
                    ),
                )
                propositions.append(prop)
        self.stdout.write(f"  {len(propositions)} propositions prêtes.")
        return propositions

    def seed_missions(self, propositions):
        missions = []
        acceptees = [p for p in propositions if p.statut == Proposition.Statut.ACCEPTEE]
        for i, prop in enumerate(acceptees):
            statut = Mission.Statut.TERMINEE if i % 2 == 0 else Mission.Statut.EN_COURS
            mission, created = Mission.objects.get_or_create(
                proposition=prop,
                defaults=dict(
                    statut=statut,
                    date_fin=timezone.now() if statut == Mission.Statut.TERMINEE else None,
                ),
            )
            missions.append(mission)
        self.stdout.write(f"  {len(missions)} missions prêtes.")
        return missions

    def seed_avis(self, missions):
        commentaires = [
            "Travail rapide et soigné, je recommande.",
            "Très professionnel, ponctuel et efficace.",
            "Bon rapport qualité-prix, satisfait du résultat.",
            "Communication claire, prestation conforme à mes attentes.",
            "Un peu de retard mais travail bien fait.",
            "Excellent service, à refaire sans hésiter.",
        ]
        count = 0
        for mission in missions:
            if mission.statut != Mission.Statut.TERMINEE:
                continue
            _, created = Avis.objects.get_or_create(
                mission=mission,
                defaults=dict(
                    note=random.choice([3, 4, 4, 5, 5]),
                    commentaire=random.choice(commentaires),
                    visible=True,
                ),
            )
            if created:
                count += 1
        self.stdout.write(f"  {count} avis créés.")

    def seed_recommandations(self, demandes):
        for demande in demandes:
            try:
                calculer_recommandations(demande)
            except Exception as e:
                self.stdout.write(self.style.WARNING(
                    f"  Recommandation ignorée pour '{demande.titre}': {e}"
                ))
        self.stdout.write("  Recommandations calculées pour toutes les demandes.")