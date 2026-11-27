#!/usr/bin/env python3
"""Copy QCF brief sources from the internal archive into data/briefs/src/<category>/YYYYMMDD.zh.json
and posters into briefs-media/posters/ (resized JPEG). Only public-safe fields are copied:
per-item 'qcf' commentary and the 'implications' section are internal and are NOT imported
unless --include-internal is given.
Usage: python3 tools/briefs/import_from_archive.py [--poster-dir DIR] [--json-dir DIR] [--include-internal]
"""
import argparse, glob, json, os, re, shutil
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ap = argparse.ArgumentParser()
ap.add_argument('--json-dir', default='/workspace/qcf/briefs_poster')
ap.add_argument('--archive', default='/workspace/qcf/archive/08_Briefs')
ap.add_argument('--include-internal', action='store_true')
a = ap.parse_args()
PATTERNS = {'biogene': 'brief_*.json', 'qe-rwa': 'qe_rwa_brief_*.json', 'edu': 'cu_edu_brief_*.json'}
ITEM_KEYS = ['region', 'tag', 'title', 'what', 'why', 'src', 'date', 'url']
n = 0
for cat, pat in PATTERNS.items():
    for f in sorted(glob.glob(os.path.join(a.json_dir, pat))):
        if cat == 'biogene' and os.path.basename(f).startswith(('qe_', 'cu_')):
            continue
        d8 = re.search(r'(\d{8})', f).group(1)
        d = json.load(open(f, encoding='utf-8'))
        out = {k: d[k] for k in ('date_cn', 'coverage', 'summary', 'trends', 'footer') if k in d}
        keys = ITEM_KEYS + (['qcf'] if a.include_internal else [])
        out['items'] = [{k: i[k] for k in keys if k in i} for i in d['items']]
        if a.include_internal and 'implications' in d:
            out['implications'] = d['implications']
        dst = os.path.join(ROOT, 'data/briefs/src', cat, d8 + '.zh.json')
        json.dump(out, open(dst, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        n += 1
print('imported', n, 'zh sources')
# posters (BioGene only has posters)
p = 0
for f in sorted(glob.glob(os.path.join(a.archive, 'BioGene', 'QCF_BioGene_*_Poster_*.png'))):
    d8 = re.search(r'(\d{8})', f).group(1)
    dst = os.path.join(ROOT, 'briefs-media/posters', f'biogene-{d8}.jpg')
    if not os.path.exists(dst):
        im = Image.open(f).convert('RGB'); im.thumbnail((1080, 1350)); im.save(dst, 'JPEG', quality=82, optimize=True, progressive=True)
    p += 1
print('posters', p)
