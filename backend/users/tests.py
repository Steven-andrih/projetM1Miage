import io
import os
import shutil
import tempfile
from datetime import date
from decimal import Decimal

from django.core.files.storage import FileSystemStorage
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework.test import APITestCase

from demandes.models import Demande
from missions.models import Mission
from propositions.models import Proposition
from services.models import Categorie, Service
from users.models import Prestataire, Utilisateur

MOT_DE_PASSE = 'MotDePasse123!'


def image_png(nom='cin.png'):
    tampon = io.BytesIO()
    Image.new('RGB', (40, 30), (120, 140, 200)).save(tampon, format='PNG')
    return SimpleUploadedFile(nom, tampon.getvalue(), content_type='image/png')


class BaseTestCase(APITestCase):
    """Jeu de données minimal : un admin, un client avec une demande, deux prestataires."""

    def setUp(self):
        # Stockage temporaire pour ne pas écrire dans private_media/
        self.dossier = tempfile.mkdtemp()
        self.champ_document = Prestataire._meta.get_field('document_identite')
        self.ancien_stockage = self.champ_document.storage
        self.champ_document.storage = FileSystemStorage(location=self.dossier)

        self.admin = Utilisateur.objects.create_user('admin_t', password=MOT_DE_PASSE, role=Utilisateur.Role.ADMIN)
        self.client_user = Utilisateur.objects.create_user(
            'client_t', password=MOT_DE_PASSE, role=Utilisateur.Role.CLIENT, first_name='Rina', last_name='Rabe'
        )
        self.presta_user = Utilisateur.objects.create_user(
            'presta_t', password=MOT_DE_PASSE, role=Utilisateur.Role.PRESTATAIRE, first_name='Tojo'
        )
        self.autre_presta_user = Utilisateur.objects.create_user(
            'presta_autre', password=MOT_DE_PASSE, role=Utilisateur.Role.PRESTATAIRE
        )
        self.presta = self.presta_user.prestataire_profile

        categorie = Categorie.objects.create(nom='Plomberie')
        service = Service.objects.create(categorie=categorie, nom='Fuite')
        self.demande = Demande.objects.create(
            client=self.client_user.client_profile, service=service, titre='Fuite cuisine',
            description='Fuite sous évier', date_souhaitee=date.today(), adresse='Analakely',
            latitude=Decimal('-18.9'), longitude=Decimal('47.5'), statut=Demande.Statut.PUBLIEE,
            budget_min=Decimal('40000'), budget_max=Decimal('60000'),
        )
        self.proposition = Proposition.objects.create(
            demande=self.demande, prestataire=self.presta, message='Dispo demain', tarif_propose=Decimal('75000')
        )

    def tearDown(self):
        self.champ_document.storage = self.ancien_stockage
        shutil.rmtree(self.dossier, ignore_errors=True)

    def connecter(self, utilisateur):
        self.client.force_authenticate(user=utilisateur)


class VerificationIdentiteTests(BaseTestCase):
    URL_DOC = '/api/users/prestataire/me/document/'

    def envoyer(self, fichier=None, type_document='CIN'):
        return self.client.post(
            self.URL_DOC, {'type_document': type_document, 'document': fichier or image_png()}, format='multipart'
        )

    def test_envoi_document_passe_en_attente(self):
        self.connecter(self.presta_user)
        reponse = self.envoyer()
        self.assertEqual(reponse.status_code, 201, reponse.data)
        self.presta.refresh_from_db()
        self.assertEqual(self.presta.statut_validation, Prestataire.StatutValidation.EN_ATTENTE)
        self.assertTrue(self.presta.a_document)
        self.assertIsNotNone(self.presta.date_soumission)
        self.assertEqual(self.client.get(self.URL_DOC).status_code, 200)

    def test_fichier_non_image_refuse(self):
        self.connecter(self.presta_user)
        faux = SimpleUploadedFile('cin.png', b'pas une image', content_type='image/png')
        self.assertEqual(self.envoyer(faux).status_code, 400)
        mauvais_format = SimpleUploadedFile('cin.pdf', b'%PDF-1.4', content_type='application/pdf')
        self.assertEqual(self.envoyer(mauvais_format).status_code, 400)

    def test_client_ne_peut_pas_envoyer(self):
        self.connecter(self.client_user)
        self.assertEqual(self.envoyer().status_code, 403)

    def test_document_reserve_admin(self):
        self.connecter(self.presta_user)
        self.envoyer()
        url_admin = f'/api/admin/prestataires/{self.presta.id}/document/'
        self.connecter(self.autre_presta_user)
        self.assertEqual(self.client.get(url_admin).status_code, 403)
        self.connecter(self.client_user)
        self.assertEqual(self.client.get(url_admin).status_code, 403)
        self.connecter(self.admin)
        self.assertEqual(self.client.get(url_admin).status_code, 200)

    def test_validation_puis_remplacement_interdit(self):
        self.connecter(self.presta_user)
        self.envoyer()
        self.connecter(self.admin)
        self.assertEqual(self.client.post(f'/api/admin/prestataires/{self.presta.id}/valider/').status_code, 200)
        self.presta.refresh_from_db()
        self.assertEqual(self.presta.statut_validation, Prestataire.StatutValidation.VALIDE)
        self.connecter(self.presta_user)
        self.assertEqual(self.envoyer().status_code, 400)

    def test_refus_exige_un_motif_et_nouvel_envoi_remet_en_attente(self):
        self.connecter(self.presta_user)
        self.envoyer()
        self.connecter(self.admin)
        url = f'/api/admin/prestataires/{self.presta.id}/refuser/'
        self.assertEqual(self.client.post(url, {'motif': '  '}, format='json').status_code, 400)
        self.assertEqual(self.client.post(url, {'motif': 'Photo floue'}, format='json').status_code, 200)
        self.presta.refresh_from_db()
        self.assertEqual(self.presta.statut_validation, Prestataire.StatutValidation.REFUSE)
        self.assertEqual(self.presta.motif_refus, 'Photo floue')

        self.connecter(self.presta_user)
        self.assertEqual(self.envoyer(type_document='PASSEPORT').status_code, 201)
        self.presta.refresh_from_db()
        self.assertEqual(self.presta.statut_validation, Prestataire.StatutValidation.EN_ATTENTE)
        self.assertEqual(self.presta.motif_refus, '')

    def test_liste_verifications(self):
        self.connecter(self.presta_user)
        self.envoyer()
        self.connecter(self.admin)
        donnees = self.client.get('/api/admin/verifications/').data
        self.assertEqual([p['id'] for p in donnees], [self.presta.id])


class GestionUtilisateursTests(BaseTestCase):
    def test_liste_filtree_par_role_et_reservee_admin(self):
        self.connecter(self.client_user)
        self.assertEqual(self.client.get('/api/admin/utilisateurs/').status_code, 403)
        self.connecter(self.admin)
        donnees = self.client.get('/api/admin/utilisateurs/?role=PRESTATAIRE').data
        self.assertEqual({u['username'] for u in donnees}, {'presta_t', 'presta_autre'})
        donnees = self.client.get('/api/admin/utilisateurs/?role=CLIENT&search=rina').data
        self.assertEqual([u['username'] for u in donnees], ['client_t'])

    def test_detail_prestataire(self):
        self.connecter(self.admin)
        donnees = self.client.get(f'/api/admin/utilisateurs/{self.presta_user.id}/').data
        self.assertEqual(donnees['propositions']['total'], 1)
        self.assertIn('services', donnees)
        self.assertIn('missions', donnees)

    def test_desactivation_bloque_connexion_et_masque_demandes(self):
        self.connecter(self.admin)
        url = f'/api/admin/utilisateurs/{self.client_user.id}/desactiver/'
        self.assertEqual(self.client.post(url).status_code, 200)
        self.client_user.refresh_from_db()
        self.assertFalse(self.client_user.is_active)

        self.client.force_authenticate(user=None)
        jeton = self.client.post('/api/token/', {'username': 'client_t', 'password': MOT_DE_PASSE}, format='json')
        self.assertEqual(jeton.status_code, 401)

        self.connecter(self.presta_user)
        ids = [d['id'] for d in self.client.get('/api/demandes/').data]
        self.assertNotIn(self.demande.id, ids)

        self.connecter(self.admin)
        self.client.post(f'/api/admin/utilisateurs/{self.client_user.id}/reactiver/')
        self.client_user.refresh_from_db()
        self.assertTrue(self.client_user.is_active)

    def test_prestataire_desactive_masque_ses_propositions(self):
        self.presta_user.is_active = False
        self.presta_user.save()
        self.connecter(self.client_user)
        self.assertEqual(self.client.get('/api/propositions/').data, [])

    def test_suppression_anonymise_et_conserve_historique(self):
        self.proposition.statut = Proposition.Statut.ACCEPTEE
        self.proposition.save()
        mission = Mission.objects.create(proposition=self.proposition)

        self.connecter(self.admin)
        self.assertEqual(self.client.delete(f'/api/admin/utilisateurs/{self.presta_user.id}/').status_code, 204)
        self.presta_user.refresh_from_db()
        self.assertFalse(self.presta_user.is_active)
        self.assertTrue(self.presta_user.est_supprime)
        self.assertEqual(self.presta_user.email, '')
        self.assertTrue(Mission.objects.filter(pk=mission.pk).exists())
        ids = [u['id'] for u in self.client.get('/api/admin/utilisateurs/').data]
        self.assertNotIn(self.presta_user.id, ids)

    def test_admin_non_gerable(self):
        self.connecter(self.admin)
        self.assertEqual(self.client.delete(f'/api/admin/utilisateurs/{self.admin.id}/').status_code, 403)

    def test_profil_me_sans_profil_renvoie_404(self):
        self.connecter(self.admin)
        self.assertEqual(self.client.get('/api/users/client/me/').status_code, 404)
        self.assertEqual(self.client.get('/api/users/prestataire/me/').status_code, 404)

    def test_profil_public_prestataire(self):
        self.connecter(self.client_user)
        donnees = self.client.get(f'/api/users/prestataires/{self.presta.id}/').data
        self.assertEqual(donnees['nom'], 'Tojo')
        self.assertFalse(donnees['verifie'])
        self.assertNotIn('email', donnees)


class PhotoProfilTests(BaseTestCase):
    URL = '/api/users/me/photo/'

    def setUp(self):
        super().setUp()
        self.media = tempfile.mkdtemp()
        self.override = self.settings(MEDIA_ROOT=self.media)
        self.override.enable()

    def tearDown(self):
        self.override.disable()
        shutil.rmtree(self.media, ignore_errors=True)
        super().tearDown()

    def envoyer(self, utilisateur, taille=(800, 500)):
        self.connecter(utilisateur)
        tampon = io.BytesIO()
        Image.new('RGBA', taille, (200, 80, 80, 255)).save(tampon, format='PNG')
        fichier = SimpleUploadedFile('moi.png', tampon.getvalue(), content_type='image/png')
        return self.client.post(self.URL, {'photo': fichier}, format='multipart')

    def test_chaque_role_peut_envoyer_une_photo_recadree(self):
        for utilisateur in (self.admin, self.client_user, self.presta_user):
            reponse = self.envoyer(utilisateur)
            self.assertEqual(reponse.status_code, 201, reponse.data)
            self.assertTrue(reponse.data['photo'].startswith('/media/photos/'))
            utilisateur.refresh_from_db()
            with Image.open(utilisateur.photo.path) as image:
                self.assertEqual(image.size, (400, 400))
                self.assertEqual(image.format, 'JPEG')

    def test_photo_visible_par_les_autres(self):
        photo = self.envoyer(self.presta_user).data['photo']
        self.connecter(self.client_user)
        proposition = self.client.get('/api/propositions/').data[0]
        self.assertEqual(proposition['prestataire_info']['photo'], photo)
        self.assertEqual(self.client.get(f'/api/users/prestataires/{self.presta.id}/').data['photo'], photo)
        self.connecter(self.admin)
        utilisateurs = self.client.get('/api/admin/utilisateurs/?role=PRESTATAIRE').data
        self.assertIn(photo, [u['photo'] for u in utilisateurs])

    def test_remplacement_supprime_l_ancienne_et_suppression(self):
        self.envoyer(self.client_user)
        self.client_user.refresh_from_db()
        ancien_chemin = self.client_user.photo.path
        self.envoyer(self.client_user)
        self.assertFalse(os.path.exists(ancien_chemin))

        reponse = self.client.delete(self.URL)
        self.assertEqual(reponse.status_code, 200)
        self.assertIsNone(reponse.data['photo'])
        self.assertIsNone(self.client.get('/api/users/me/').data['photo'])

    def test_format_refuse(self):
        self.connecter(self.client_user)
        faux = SimpleUploadedFile('moi.gif', b'GIF89a', content_type='image/gif')
        self.assertEqual(self.client.post(self.URL, {'photo': faux}, format='multipart').status_code, 400)
        self.client.force_authenticate(user=None)
        self.assertEqual(self.client.post(self.URL, {'photo': image_png()}, format='multipart').status_code, 401)
