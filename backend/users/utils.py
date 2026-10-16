"""Fonctions utilitaires partagées autour des utilisateurs et de leurs profils."""
from django.db.models import Avg, Count, Q


def nom_affiche(utilisateur):
    """Nom lisible d'un utilisateur : « Prénom Nom », sinon son identifiant."""
    if utilisateur is None:
        return 'Utilisateur supprimé'
    if getattr(utilisateur, 'date_suppression', None):
        return 'Compte supprimé'
    nom = f"{utilisateur.first_name} {utilisateur.last_name}".strip()
    return nom or utilisateur.username


def stats_missions(queryset_missions):
    """Compteurs de missions par statut, à partir d'un queryset de Mission."""
    from missions.models import Mission

    agg = queryset_missions.aggregate(
        total=Count('id'),
        en_cours=Count('id', filter=Q(statut=Mission.Statut.EN_COURS)),
        terminees=Count('id', filter=Q(statut=Mission.Statut.TERMINEE)),
        annulees=Count('id', filter=Q(statut=Mission.Statut.ANNULEE)),
    )
    return {cle: agg[cle] or 0 for cle in ('total', 'en_cours', 'terminees', 'annulees')}


def note_prestataire(prestataire):
    """Note moyenne (arrondie à 2 décimales) et nombre d'avis visibles d'un prestataire."""
    from avis.models import Avis

    agg = Avis.objects.filter(
        mission__proposition__prestataire=prestataire, visible=True
    ).aggregate(moyenne=Avg('note'), nombre=Count('id'))
    moyenne = agg['moyenne']
    return (round(float(moyenne), 2) if moyenne is not None else None), agg['nombre'] or 0


def resume_prestataire(prestataire):
    """Résumé public d'un prestataire, affiché à côté de ses propositions."""
    note, nb_avis = note_prestataire(prestataire)
    return {
        'id': prestataire.id,
        'nom': nom_affiche(prestataire.utilisateur),
        'ville': prestataire.ville,
        'annee_experience': prestataire.annee_experience,
        'disponible': prestataire.disponible,
        'verifie': prestataire.est_verifie,
        'note_moyenne': note,
        'nb_avis': nb_avis,
    }
