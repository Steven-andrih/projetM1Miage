"""Règles métier de la messagerie client ↔ prestataire."""
from django.db.models import Q
from django.utils import timezone

from propositions.models import Proposition
from users.models import Utilisateur
from .models import Conversation, Message

# Le chat reste ouvert après acceptation pour organiser la mission.
STATUTS_ECRITURE = (Proposition.Statut.EN_ATTENTE, Proposition.Statut.ACCEPTEE)


def obtenir_conversation(proposition):
    conversation, _ = Conversation.objects.get_or_create(proposition=proposition)
    return conversation


def role_participant(conversation, utilisateur):
    """'CLIENT' ou 'PRESTATAIRE' si l'utilisateur participe à la conversation, sinon None."""
    proposition = conversation.proposition
    if proposition.demande.client.utilisateur_id == utilisateur.id:
        return Utilisateur.Role.CLIENT
    if proposition.prestataire.utilisateur_id == utilisateur.id:
        return Utilisateur.Role.PRESTATAIRE
    return None


def peut_lire(conversation, utilisateur):
    return utilisateur.role == Utilisateur.Role.ADMIN or role_participant(conversation, utilisateur) is not None


def peut_ecrire(conversation, utilisateur=None):
    """Écriture réservée aux participants, tant que la proposition est en attente ou acceptée."""
    if conversation.proposition.statut not in STATUTS_ECRITURE:
        return False
    if utilisateur is None:
        return True
    return role_participant(conversation, utilisateur) is not None


def messages_non_lus(conversation, utilisateur):
    """Messages reçus (y compris système) depuis la dernière lecture de l'utilisateur."""
    role = role_participant(conversation, utilisateur)
    if role is None:
        return Message.objects.none()
    dernier_lu = (
        conversation.dernier_lu_client if role == Utilisateur.Role.CLIENT
        else conversation.dernier_lu_prestataire
    )
    qs = conversation.messages.exclude(auteur=utilisateur)
    if dernier_lu:
        qs = qs.filter(date_envoi__gt=dernier_lu)
    return qs


def marquer_lu(conversation, utilisateur):
    role = role_participant(conversation, utilisateur)
    maintenant = timezone.now()
    if role == Utilisateur.Role.CLIENT:
        conversation.dernier_lu_client = maintenant
        conversation.save(update_fields=['dernier_lu_client'])
    elif role == Utilisateur.Role.PRESTATAIRE:
        conversation.dernier_lu_prestataire = maintenant
        conversation.save(update_fields=['dernier_lu_prestataire'])


def conversations_de(utilisateur):
    """Conversations visibles par un utilisateur (toutes pour l'admin)."""
    qs = Conversation.objects.select_related(
        'proposition__demande__client__utilisateur',
        'proposition__prestataire__utilisateur',
    )
    if utilisateur.role == Utilisateur.Role.ADMIN:
        return qs
    return qs.filter(
        Q(proposition__demande__client__utilisateur=utilisateur)
        | Q(proposition__prestataire__utilisateur=utilisateur)
    )


def total_non_lus(utilisateur):
    if utilisateur.role == Utilisateur.Role.ADMIN:
        return 0
    return sum(messages_non_lus(c, utilisateur).count() for c in conversations_de(utilisateur))


def message_systeme(proposition, texte):
    """Ajoute un message système dans la conversation de la proposition (créée au besoin)."""
    conversation = obtenir_conversation(proposition)
    return Message.objects.create(conversation=conversation, type=Message.Type.SYSTEME, contenu=texte)


def message_systeme_si_conversation(proposition, texte):
    """Message système uniquement si une conversation existe déjà (évite d'en créer des vides)."""
    conversation = Conversation.objects.filter(proposition=proposition).first()
    if conversation:
        Message.objects.create(conversation=conversation, type=Message.Type.SYSTEME, contenu=texte)


def format_ariary(montant):
    try:
        valeur = int(round(float(montant)))
    except (TypeError, ValueError):
        return '—'
    return f"{valeur:,}".replace(',', ' ') + ' Ar'
