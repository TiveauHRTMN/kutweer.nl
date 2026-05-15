import urllib.request
import json
import unicodedata
import re

def slugify(s):
    s = unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode('ascii').lower()
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s

with urllib.request.urlopen('https://geo.api.gouv.fr/departements') as r:
    depts = json.loads(r.read().decode())

print('export const FR_REGION_TO_PROVINCE: Record<string, Province> = {')
for d in depts:
    slug = slugify(d['nom'])
    print(f'  "{slug}": "{slug}",')
print('  "wallonie": "wallonie",')
print('};')

print('\nexport const FR_REGION_LABELS: Record<string, string> = {')
for d in depts:
    slug = slugify(d['nom'])
    print(f'  "{slug}": "{d["nom"]} ({d["code"]})",')
print('  "wallonie": "Wallonie",')
print('};')
