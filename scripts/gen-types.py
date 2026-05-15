import urllib.request
import json
import unicodedata
import re
import os

def slugify(s):
    s = unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode('ascii').lower()
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s

# Fetch departments again to be sure
with urllib.request.urlopen('https://geo.api.gouv.fr/departements') as r:
    depts = json.loads(r.read().decode())

places_data_path = os.path.join('src', 'lib', 'places-data.ts')
with open(places_data_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Generate the union type strings
dept_types = [f'  | "{slugify(d["nom"])}"' for d in depts]
dept_types.append('  | "luxembourg-country"')

# Generate labels
dept_labels = [f'  "{slugify(d["nom"])}": "{d["nom"]}",' for d in depts]
dept_labels.append('  "luxembourg-country": "Luxembourg",')

# I will manually edit the file to avoid messing up the structure
# but I have the data now.
for dt in dept_types:
    print(dt)
print("\nLabels:")
for dl in dept_labels:
    print(dl)
