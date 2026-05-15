import urllib.request
import json
import os

# Walloon provinces (INS codes starting with 5, 6, 7, 8, 9)
# 50000: Walloon Brabant
# 60000: Hainaut
# 70000: Liège
# 80000: Luxembourg
# 90000: Namur
# Brussels (21000) is also French-speaking but often its own entity.

try:
    # Use a source that has coordinates. Open-Meteo Geocoding can be used but it's for search.
    # I will search for a static list of Belgian municipalities.
    # For now, I'll use a curated list of significant Walloon towns to ensure some volume.
    walloon_towns = [
        ("Charleroi", 50.4108, 4.4446, 201733),
        ("Liège", 50.6331, 5.5775, 195278),
        ("Namur", 50.4674, 4.8719, 111432),
        ("Mons", 50.4542, 3.9567, 95299),
        ("La Louvière", 50.4794, 4.1867, 80719),
        ("Tournai", 50.6056, 3.3878, 69129),
        ("Seraing", 50.5967, 5.5083, 64270),
        ("Mouscron", 50.7433, 3.2139, 58234),
        ("Verviers", 50.5932, 5.8638, 55198),
        ("Braine-l'Alleud", 50.6833, 4.3667, 39837),
        ("Herstal", 50.6667, 5.6333, 39958),
        ("Châtelet", 50.4000, 4.5333, 36101),
        ("Wavre", 50.7171, 4.6079, 34305),
        ("Binche", 50.4114, 4.1656, 33598),
        ("Louvain-la-Neuve", 50.6681, 4.6114, 30000),
        ("Ottignies-Louvain-la-Neuve", 50.6681, 4.6114, 31385),
        ("Arlon", 49.6833, 5.8167, 29733),
        ("Ath", 50.6300, 3.7772, 29164),
        ("Nivelles", 50.5975, 4.3236, 28521),
        ("Verniers", 50.5932, 5.8638, 55198),
        ("Huy", 50.5183, 5.2333, 21293),
        ("Dinant", 50.2581, 4.9117, 13544),
        ("Malmedy", 50.4264, 6.0275, 12654),
        ("Bastogne", 50.0000, 5.7167, 15894),
        ("Durbuy", 50.3525, 5.4561, 11374),
        ("Spa", 50.4917, 5.8667, 10378),
        ("Chimay", 50.0492, 4.3125, 9844),
        ("Bouillon", 49.7944, 5.0667, 5353),
        ("Rochefort", 50.1633, 5.2217, 12107),
        ("Waterloo", 50.7167, 4.3833, 30174),
        ("Tubize", 50.6833, 4.2000, 25914),
        ("Soignies", 50.5833, 4.0667, 27603),
        ("Thuin", 50.3333, 4.2833, 14625),
        ("Andenne", 50.4833, 5.1000, 27017),
        ("Gembloux", 50.5667, 4.7000, 25763),
        ("Eghezée", 50.5833, 4.9000, 16247),
        ("Hannut", 50.6667, 5.0833, 16435),
        ("Waremme", 50.6964, 5.2539, 15168),
        ("Eupen", 50.6308, 6.0317, 19526),
        ("Aubange", 49.5667, 5.8000, 16927),
        ("Marche-en-Famenne", 50.2267, 5.3442, 17454),
        ("Virton", 49.5667, 5.5333, 11323),
        ("Philippeville", 50.1967, 4.5458, 9228),
        ("Walcourt", 50.2514, 4.4319, 18376),
        ("Couvin", 50.0514, 4.4967, 13782)
    ]

    places_path = os.path.join('src', 'lib', 'places.json')
    with open(places_path, 'r', encoding='utf-8') as f:
        places = json.load(f)

    existing_keys = set((p['name'].lower(), p['province']) for p in places)
    added = 0
    for name, lat, lon, pop in walloon_towns:
        if (name.lower(), 'wallonie') not in existing_keys:
            places.append({
                'name': name,
                'lat': lat,
                'lon': lon,
                'population': pop,
                'province': 'wallonie'
            })
            added += 1

    with open(places_path, 'w', encoding='utf-8') as f:
        json.dump(places, f, ensure_ascii=False, indent=2)
    print(f'Added {added} Walloon towns.')

except Exception as e:
    print(f'Error: {e}')
