import requests
from decouple import config

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = "openrouter/free"

def ameliorer_texte(texte_brut, contexte="annonce de service"):
    """
    Envoie un texte brut à OpenRouter pour le reformuler de façon
    plus claire et professionnelle. Retourne le texte amélioré,
    ou lève une exception si l'appel échoue.
    """
    prompt = (
        f"Tu es un assistant qui améliore des descriptions pour une plateforme "
        f"de mise en relation de services locaux. "
        f"Reformule le texte suivant (type: {contexte}) pour qu'il soit plus clair, "
        f"plus complet et plus professionnel, sans changer les informations factuelles "
        f"(prix, lieu, délais). Ne réponds qu'avec le texte amélioré, sans commentaire ni guillemets.\n\n"
        f"Texte original : {texte_brut}"
    )

    response = requests.post(
        OPENROUTER_URL,
        headers={
            "Authorization": f"Bearer {config('OPENROUTER_API_KEY')}",
            "Content-Type": "application/json",
        },
        json={
            "model": OPENROUTER_MODEL,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=20,
    )
    response.raise_for_status()
    data = response.json()
    return data['choices'][0]['message']['content'].strip()