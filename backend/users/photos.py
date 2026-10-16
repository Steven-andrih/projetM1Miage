"""Traitement des photos de profil : validation, recadrage carré et compression."""
import io
import secrets

from django.conf import settings
from django.core.files.base import ContentFile
from PIL import Image, ImageOps, UnidentifiedImageError
from rest_framework import serializers

TAILLE_PHOTO = 400  # côté du carré final, en pixels


def valider_image(fichier, extensions, taille_max):
    extension = fichier.name.rsplit('.', 1)[-1].lower() if '.' in fichier.name else ''
    if extension not in extensions:
        raise serializers.ValidationError('Formats acceptés : JPG, PNG ou WEBP.')
    if fichier.size > taille_max:
        raise serializers.ValidationError(f'Le fichier ne doit pas dépasser {taille_max // (1024 * 1024)} Mo.')
    try:
        image = Image.open(fichier)
        image.verify()
    except (UnidentifiedImageError, OSError):
        raise serializers.ValidationError("Le fichier n'est pas une image valide.")
    finally:
        fichier.seek(0)
    return fichier


def preparer_photo(fichier, utilisateur):
    """Recadre au centre en carré, redimensionne et convertit en JPEG. Renvoie (nom, contenu)."""
    image = Image.open(fichier)
    image = ImageOps.exif_transpose(image)
    if image.mode not in ('RGB', 'L'):
        fond = Image.new('RGB', image.size, (255, 255, 255))
        if image.mode in ('RGBA', 'LA', 'P'):
            image = image.convert('RGBA')
            fond.paste(image, mask=image.split()[-1])
        else:
            fond.paste(image.convert('RGB'))
        image = fond
    image = ImageOps.fit(image.convert('RGB'), (TAILLE_PHOTO, TAILLE_PHOTO), Image.Resampling.LANCZOS)
    tampon = io.BytesIO()
    image.save(tampon, format='JPEG', quality=85, optimize=True)
    # Nom unique à chaque envoi : évite qu'un navigateur garde l'ancienne image en cache
    nom = f"utilisateur_{utilisateur.pk}_{secrets.token_hex(4)}.jpg"
    return nom, ContentFile(tampon.getvalue())


class PhotoProfilSerializer(serializers.Serializer):
    photo = serializers.FileField()

    def validate_photo(self, fichier):
        return valider_image(fichier, settings.PHOTO_PROFIL_EXTENSIONS, settings.PHOTO_PROFIL_TAILLE_MAX)
