import math
from django.db.models import Avg
from services.models import PrestataireService
from missions.models import Mission
from avis.models import Avis
from .models import Recommandation

# Constantes de normalisation (ajustables selon le contexte réel)
DISTANCE_MAX_KM = 50       # au-delà, score de proximité = 0
EXPERIENCE_MAX_ANNEES = 10  # au-delà, score d'expérience plafonné à 100
MISSIONS_MAX = 20           # au-delà, score de missions plafonné à 100

# Poids définis par l'encadreur
POIDS_PROXIMITE = 0.30
POIDS_NOTE = 0.25
POIDS_DISPONIBILITE = 0.20
POIDS_EXPERIENCE = 0.15
POIDS_MISSIONS = 0.10


def calculer_distance_km(lat1, lon1, lat2, lon2):
    """Formule de Haversine : distance en km entre deux points GPS."""
    R = 6371  # rayon de la Terre en km
    phi1, phi2 = math.radians(float(lat1)), math.radians(float(lat2))
    delta_phi = math.radians(float(lat2) - float(lat1))
    delta_lambda = math.radians(float(lon2) - float(lon1))

    a = (math.sin(delta_phi / 2) ** 2
         + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def score_proximite(prestataire, demande):
    if prestataire.latitude is None or prestataire.longitude is None:
        return 0, None
    distance = calculer_distance_km(
        demande.latitude, demande.longitude,
        prestataire.latitude, prestataire.longitude,
    )
    score = max(0, 100 - (distance / DISTANCE_MAX_KM) * 100)
    return round(min(score, 100), 2), round(distance, 2)


def score_note(prestataire):
    moyenne = Avis.objects.filter(
        mission__proposition__prestataire=prestataire, visible=True
    ).aggregate(Avg('note'))['note__avg']
    if moyenne is None:
        return 50.0  # neutre si pas encore d'avis
    return round((moyenne / 5) * 100, 2)


def score_disponibilite(prestataire):
    return 100.0 if prestataire.disponible else 0.0


def score_experience(prestataire):
    annees = min(prestataire.annee_experience, EXPERIENCE_MAX_ANNEES)
    return round((annees / EXPERIENCE_MAX_ANNEES) * 100, 2)


def score_missions(prestataire):
    nb = Mission.objects.filter(
        proposition__prestataire=prestataire, statut=Mission.Statut.TERMINEE
    ).count()
    nb = min(nb, MISSIONS_MAX)
    return round((nb / MISSIONS_MAX) * 100, 2)


def calculer_recommandations(demande):
    """Calcule, persiste et retourne les recommandations classées pour une demande."""
    prestataire_ids = PrestataireService.objects.filter(
        service=demande.service, actif=True
    ).values_list('prestataire_id', flat=True).distinct()

    resultats = []

    from users.models import Prestataire
    prestataires = Prestataire.objects.filter(id__in=prestataire_ids)

    for prestataire in prestataires:
        s_prox, distance_km = score_proximite(prestataire, demande)
        s_note = score_note(prestataire)
        s_dispo = score_disponibilite(prestataire)
        s_exp = score_experience(prestataire)
        s_miss = score_missions(prestataire)

        score_global = (
            POIDS_PROXIMITE * s_prox
            + POIDS_NOTE * s_note
            + POIDS_DISPONIBILITE * s_dispo
            + POIDS_EXPERIENCE * s_exp
            + POIDS_MISSIONS * s_miss
        )

        justification_parts = []
        if distance_km is not None:
            justification_parts.append(f"à {distance_km} km")
        justification_parts.append(f"note {s_note}/100")
        justification_parts.append("disponible" if prestataire.disponible else "indisponible")
        justification_parts.append(f"{prestataire.annee_experience} an(s) d'expérience")
        justification = "Recommandé pour : " + ", ".join(justification_parts) + "."

        resultats.append({
            'prestataire': prestataire,
            'score_global': round(score_global, 2),
            's_prox': s_prox, 's_note': s_note, 's_dispo': s_dispo,
            's_exp': s_exp, 's_miss': s_miss,
            'justification': justification,
        })

    resultats.sort(key=lambda r: r['score_global'], reverse=True)

    Recommandation.objects.filter(demande=demande).delete()
    objets = []
    for position, r in enumerate(resultats, start=1):
        objets.append(Recommandation(
            demande=demande,
            prestataire=r['prestataire'],
            score_global=r['score_global'],
            score_proximite=r['s_prox'],
            score_note=r['s_note'],
            score_disponibilite=r['s_dispo'],
            score_experience=r['s_exp'],
            score_missions=r['s_miss'],
            position=position,
            justification=r['justification'],
        ))
    Recommandation.objects.bulk_create(objets)

    return Recommandation.objects.filter(demande=demande).order_by('position')