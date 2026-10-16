from decimal import Decimal

from messagerie.models import Message
from propositions.models import Proposition
from users.tests import BaseTestCase


class MessagerieTests(BaseTestCase):
    def ouvrir(self, utilisateur):
        self.connecter(utilisateur)
        return self.client.get(f'/api/propositions/{self.proposition.id}/conversation/')

    def test_participants_ouvrent_et_echangent(self):
        reponse = self.ouvrir(self.client_user)
        self.assertEqual(reponse.status_code, 200)
        conv_id = reponse.data['id']
        self.assertTrue(reponse.data['peut_ecrire'])
        self.assertEqual(reponse.data['mon_role'], 'CLIENT')

        url = f'/api/conversations/{conv_id}/messages/'
        self.assertEqual(self.client.post(url, {'contenu': 'Trop cher ?'}, format='json').status_code, 201)
        self.assertEqual(self.client.post(url, {'contenu': '   '}, format='json').status_code, 400)

        self.connecter(self.presta_user)
        self.assertEqual(self.client.get('/api/conversations/non-lus/').data['non_lus'], 1)
        messages = self.client.get(url).data
        self.assertEqual(messages[0]['contenu'], 'Trop cher ?')
        self.assertFalse(messages[0]['est_moi'])
        self.client.post(f'/api/conversations/{conv_id}/lire/')
        self.assertEqual(self.client.get('/api/conversations/non-lus/').data['non_lus'], 0)

    def test_tiers_sans_acces(self):
        conv_id = self.ouvrir(self.client_user).data['id']
        self.connecter(self.autre_presta_user)
        self.assertEqual(self.client.get(f'/api/conversations/{conv_id}/messages/').status_code, 404)
        self.assertEqual(self.client.get(f'/api/propositions/{self.proposition.id}/conversation/').status_code, 404)

    def test_admin_lecture_seule(self):
        conv_id = self.ouvrir(self.client_user).data['id']
        self.connecter(self.admin)
        url = f'/api/conversations/{conv_id}/messages/'
        self.assertEqual(self.client.get(url).status_code, 200)
        self.assertEqual(self.client.post(url, {'contenu': 'Modération'}, format='json').status_code, 403)

    def test_modification_tarif_genere_message_systeme(self):
        self.connecter(self.presta_user)
        reponse = self.client.patch(
            f'/api/propositions/{self.proposition.id}/', {'tarif_propose': '65000'}, format='json'
        )
        self.assertEqual(reponse.status_code, 200, reponse.data)
        systeme = Message.objects.get(conversation__proposition=self.proposition, type=Message.Type.SYSTEME)
        self.assertIn('75 000 Ar', systeme.contenu)
        self.assertIn('65 000 Ar', systeme.contenu)

    def test_statut_non_modifiable_par_le_prestataire(self):
        self.connecter(self.presta_user)
        self.client.patch(f'/api/propositions/{self.proposition.id}/', {'statut': 'ACCEPTEE'}, format='json')
        self.proposition.refresh_from_db()
        self.assertEqual(self.proposition.statut, Proposition.Statut.EN_ATTENTE)

    def test_refus_passe_le_chat_en_lecture_seule(self):
        conv_id = self.ouvrir(self.client_user).data['id']
        self.assertEqual(self.client.post(f'/api/propositions/{self.proposition.id}/refuser/').status_code, 200)
        reponse = self.client.post(f'/api/conversations/{conv_id}/messages/', {'contenu': 'Encore là ?'}, format='json')
        self.assertEqual(reponse.status_code, 400)
        self.assertTrue(Message.objects.filter(conversation_id=conv_id, type=Message.Type.SYSTEME).exists())

        self.connecter(self.presta_user)
        reponse = self.client.patch(
            f'/api/propositions/{self.proposition.id}/', {'tarif_propose': Decimal('50000')}, format='json'
        )
        self.assertEqual(reponse.status_code, 400)

    def test_acceptation_garde_le_chat_ouvert(self):
        conv_id = self.ouvrir(self.client_user).data['id']
        self.assertEqual(self.client.post(f'/api/propositions/{self.proposition.id}/accepter/').status_code, 201)
        reponse = self.client.post(f'/api/conversations/{conv_id}/messages/', {'contenu': 'À demain'}, format='json')
        self.assertEqual(reponse.status_code, 201)

    def test_proposition_enrichie(self):
        self.ouvrir(self.client_user)
        donnees = self.client.get('/api/propositions/').data[0]
        self.assertEqual(donnees['prestataire_info']['nom'], 'Tojo')
        self.assertIn('note_moyenne', donnees['prestataire_info'])
        self.assertIsNotNone(donnees['conversation'])
