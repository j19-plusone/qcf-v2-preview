#!/usr/bin/env python3
"""Build the QCF Briefs section (briefs.html + brief-<cat>-<YYYYMMDD>.html + data/briefs/briefs.json)
from data/briefs/src/<cat>/<YYYYMMDD>.zh.json and the matching .en.json translation.
Bilingual text is emitted as data-zh / data-en attributes so the site-wide language selector
in assets/app.js switches it; other site languages fall back to English plus a machine-translation link.
Usage: python3 tools/briefs/build_briefs.py [--permanent DIR]
"""
import argparse, datetime, glob, html, json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ap = argparse.ArgumentParser()
ap.add_argument('--permanent', default='/workspace/qcf/archive/08_Briefs/_Permanent', help='folder with *_Record.md; skipped if missing (data/briefs/permanent.json is reused)')
a = ap.parse_args()

CATS = {
 'biogene': dict(zh='人类生物基因', en='Human Bio-Gene', eyebrow='QCF-L · LIFE SCIENCES',
   dzh='追踪全球基因编辑、基因组学、长寿科学与量子/AI 生命科学的可核验进展，按中国、美国、欧洲与国际其他地区整理。',
   den='Verifiable global progress in gene editing, genomics, longevity science and quantum/AI life sciences, organised by China, the US, Europe and the rest of the world.'),
 'qe-rwa': dict(zh='量子能生态 RWA', en='Quantum Energy & RWA', eyebrow='QCF-E · QUANTUM ENERGY',
   dzh='追踪量子能源、聚变与能源资产代币化（RWA，真实世界资产上链）的政策、资金与落地进展。',
   den='Policy, funding and deployment news on quantum energy, fusion and the tokenisation of real-world energy assets (RWA).'),
 'edu': dict(zh='文明大学国际教育', en='Civilization University · International Education', eyebrow='QCF-U · CIVILIZATION UNIVERSITY',
   dzh='追踪国际高等教育政策、学生流动、跨境办学、量子与 AI 人才培养以及高校捐赠动态。',
   den='International higher-education policy, student mobility, transnational education, quantum and AI talent development, and university philanthropy.'),
}
MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
def en_date(d8): return f"{int(d8[6:])} {MONTHS[int(d8[4:6])-1]} {d8[:4]}"
def zh_date(d8): return f"{d8[:4]}年{int(d8[4:6])}月{int(d8[6:])}日"
def iso(d8): return f"{d8[:4]}-{d8[4:6]}-{d8[6:]}"
E = lambda s: html.escape(str(s), quote=True)

def bi(tag, zh, en, cls='', extra=''):
    """Element whose content app.js swaps by language. Attribute values are HTML-escaped text (app.js uses innerHTML)."""
    zh = zh or en; en = en or zh
    c = f' class="{cls}"' if cls else ''
    return f'<{tag}{c}{extra} data-zh="{E(E(zh))}" data-en="{E(E(en))}">{E(zh)}</{tag}>'

def kind(cat, d8):
    if cat == 'biogene' and d8 < '20261106':
        return ('日报', 'Daily Brief')
    return ('周报', 'Weekly Brief')

def title_pair(cat, d8):
    k = kind(cat, d8); c = CATS[cat]
    return (f"{c['zh']}{k[0]} · {zh_date(d8)}", f"{c['en']} {k[1]} · {en_date(d8)}")

HEAD = '''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>{title}</title><meta name="description" content="{desc}"><meta name="theme-color" content="#060e1b"><meta name="robots" content="index,follow"><link rel="canonical" href="https://qcf.org.cn/{path}"><link rel="icon" href="brand/qcf-official-logo.svg" type="image/svg+xml"><link rel="stylesheet" href="assets/style.css?v=20261102"><link rel="stylesheet" href="assets/briefs.css?v=20261127"></head><body><main>'''
TAIL = '''<p class="mt-note small mute" id="mt-note" hidden></p></main><script src="assets/app.js?v=20261127"></script><script src="assets/briefs.js?v=20261127"></script></body></html>'''

briefs = []
for cat in CATS:
    for f in sorted(glob.glob(os.path.join(ROOT, 'data/briefs/src', cat, '*.zh.json'))):
        d8 = os.path.basename(f)[:8]
        zh = json.load(open(f, encoding='utf-8'))
        ef = f.replace('.zh.json', '.en.json')
        en = json.load(open(ef, encoding='utf-8')) if os.path.exists(ef) else None
        briefs.append(dict(cat=cat, d8=d8, zh=zh, en=en))
briefs.sort(key=lambda b: (b['d8'], b['cat']), reverse=True)

def g(b, key, idx=None, sub=None):
    """(zh, en) pair; en falls back to zh when a translation is missing."""
    def pick(d):
        if d is None: return None
        if key == 'items':
            its = d.get('items', [])
            return its[idx].get(sub) if idx < len(its) else None
        v = d.get(key)
        if idx is not None:
            return v[idx] if isinstance(v, list) and idx < len(v) else None
        return v
    z = pick(b['zh']); e = pick(b['en'])
    return z, (e or z)

index = []
for b in briefs:
    cat, d8 = b['cat'], b['d8']
    tz, te = title_pair(cat, d8)
    path = f"brief-{cat}-{d8}.html"
    sz, se = g(b, 'summary')
    cz, ce = g(b, 'coverage')
    index.append(dict(category=cat, date=iso(d8), href=path, title_zh=tz, title_en=te, summary_zh=sz, summary_en=se,
                      items=len(b['zh']['items']), english=b['en'] is not None))
    o = [HEAD.format(title=E(tz + ' · QCF'), desc=E(sz[:150]), path=path)]
    o.append('<section class="story brief-hero"><div class="reading-width">')
    o.append(f'<p class="small"><a href="briefs.html#{cat}" class="crumb">← <span data-zh="简报" data-en="Briefs">简报</span> / {bi("span", CATS[cat]["zh"], CATS[cat]["en"])}</a></p>')
    o.append(f'<div class="eyebrow">{E(CATS[cat]["eyebrow"])} · {iso(d8)}</div>')
    o.append(bi('h1', tz, te, 'brief-title'))
    o.append(bi('p', cz, ce, 'mute small'))
    o.append(bi('p', sz, se, 'lead'))
    if b['en'] is None:
        o.append('<p class="note" data-zh="英文版正在整理中。" data-en="English translation in preparation; Chinese original shown.">英文版正在整理中。</p>')
    o.append('<p class="note teaser-note" data-zh="本页为公开摘要，列出本期条目与来源。完整简报不以网页或 PDF 下载形式公开；请在下方索取全文，我们将把 PDF 发送至您的邮箱。" data-en="This page is a public teaser: a summary plus this edition’s item titles and sources. The full brief is not published as a web page or a downloadable PDF. Request the full text below and we will email you the PDF.">本页为公开摘要，列出本期条目与来源。完整简报不以网页或 PDF 下载形式公开；请在下方索取全文，我们将把 PDF 发送至您的邮箱。</p>')
    o.append('</div></section><section class="alt"><div class="reading-width">')
    o.append(f'<h2 data-zh="本期要闻（{len(b["zh"]["items"])} 条）" data-en="This edition ({len(b["zh"]["items"])} items)">本期要闻（{len(b["zh"]["items"])} 条）</h2>')
    for i, it in enumerate(b['zh']['items']):
        p = lambda k: g(b, 'items', i, k)
        rz, re_ = p('region'); tgz, tge = p('tag'); hz, he = p('title'); srz, sre = p('src')
        o.append(f'<article class="brief-item card teaser" id="item-{i+1}">')
        tags = bi('span', rz, re_, 'pill') + (bi('span', tgz, tge, 'pill ghost') if tgz else '')
        o.append(f'<div class="pills"><span class="num">{i+1:02d}</span>{tags}</div>')
        o.append(bi('h3', hz, he))
        src = []
        if it.get('date'): src.append(f'<time datetime="{E(it["date"][:10])}">{E(it["date"])}</time>')
        src.append(bi('span', srz, sre))
        if it.get('url'): src.append(f'<a href="{E(it["url"])}" target="_blank" rel="noopener noreferrer" data-zh="原文链接 ↗" data-en="Original source ↗">原文链接 ↗</a>')
        o.append('<p class="src small"><span class="gold" data-zh="来源" data-en="Source">来源</span> ' + ' · '.join(src) + '</p></article>')
    consent_zh = '我已阅读并同意<a href="privacy.html">《隐私政策》</a>，并同意接收该期完整简报的 PDF。'
    consent_en = 'I have read and agree to the <a href="privacy.html">Privacy Policy</a>, and I agree to receive the PDF of this brief.'
    o.append('<div class="request-full card" id="request-full">')
    o.append('<h2 data-zh="索取全文" data-en="Request full text">索取全文</h2>')
    o.append('<p data-zh="完整简报将由 Founder@qcf.org.cn 发送给已填写邮箱并勾选同意的读者。" data-en="The full brief will be emailed from Founder@qcf.org.cn to readers who give an email address and consent.">完整简报将由 Founder@qcf.org.cn 发送给已填写邮箱并勾选同意的读者。</p>')
    o.append('<p class="note form-backend-note" data-zh="目前尚未接入表单后端（站点为静态 GitHub Pages）。提交后将打开您的邮件程序，预填一封发给 Founder@qcf.org.cn 的申请；接入免费表单服务后，申请将直接送达该邮箱。" data-en="A form backend is not yet connected (this site is static GitHub Pages). Submitting will open your email app with a pre-filled message to Founder@qcf.org.cn. Once a free form service is connected, requests will go to that address directly.">目前尚未接入表单后端（站点为静态 GitHub Pages）。提交后将打开您的邮件程序，预填一封发给 Founder@qcf.org.cn 的申请；接入免费表单服务后，申请将直接送达该邮箱。</p>')
    o.append(f'<form id="brief-request-form" class="brief-request" novalidate data-brief-title-zh="{E(tz)}" data-brief-title-en="{E(te)}" data-brief-date="{iso(d8)}" data-brief-cat="{E(cat)}">')
    o.append('<label><span data-zh="电子邮箱（必填）" data-en="Email (required)">电子邮箱（必填）</span><input type="email" name="email" required autocomplete="email" inputmode="email"></label>')
    o.append('<label><span data-zh="姓名（可选）" data-en="Name (optional)">姓名（可选）</span><input type="text" name="name" autocomplete="name"></label>')
    o.append(f'<label class="consent"><input type="checkbox" name="consent" required><span data-zh="{E(consent_zh)}" data-en="{E(consent_en)}">{consent_zh}</span></label>')
    o.append('<button type="submit" class="btn" data-zh="索取全文" data-en="Request full text">索取全文</button>')
    o.append('<p class="form-status small" id="brief-request-status" hidden role="status"></p>')
    o.append('</form></div>')
    o.append('<p class="note" data-zh="所列事实与数字均引自公开来源，以原文为准。QCF 简报为公开信息整理，不构成投资、医疗或法律建议。" data-en="Facts and figures are taken from the public sources listed; the original sources prevail. QCF briefs summarise public information and are not investment, medical or legal advice.">所列事实与数字均引自公开来源，以原文为准。QCF 简报为公开信息整理，不构成投资、医疗或法律建议。</p>')
    # prev/next within category
    same = [x for x in briefs if x['cat'] == cat]
    k = [x['d8'] for x in same].index(d8)
    nav = []
    if k + 1 < len(same): nav.append(f'<a class="btn ghost sm" href="brief-{cat}-{same[k+1]["d8"]}.html" data-zh="← 上一期" data-en="← Previous">← 上一期</a>')
    nav.append('<a class="btn ghost sm" href="briefs.html#' + cat + '" data-zh="全部简报" data-en="All briefs">全部简报</a>')
    if k > 0: nav.append(f'<a class="btn ghost sm" href="brief-{cat}-{same[k-1]["d8"]}.html" data-zh="下一期 →" data-en="Next →">下一期 →</a>')
    o.append('<div class="brief-nav">' + ''.join(nav) + '</div></div></section>' + TAIL)

    open(os.path.join(ROOT, path), 'w', encoding='utf-8').write('\n'.join(o))

# permanent archive records
perm_path = os.path.join(ROOT, 'data/briefs/permanent.json')
perm = json.load(open(perm_path, encoding='utf-8')) if os.path.exists(perm_path) else []
if os.path.isdir(a.permanent):
    perm = []
    for f in sorted(glob.glob(os.path.join(a.permanent, '*_Record.md')), reverse=True):
        t = open(f, encoding='utf-8').read()
        d8 = os.path.basename(f)[:8]
        def field(*names):
            for n in names:
                m = re.search(r'^-\s*\**\s*(?:' + n + r')[^：:\n]*\**\s*[：:]\**\s*(.+)$', t, re.M | re.I)
                if m: return m.group(1).strip()
            return ''
        title = field('标题', 'Title')
        if not title:
            title = re.search(r'^#\s+(.+)$', t, re.M).group(1).strip()
            title = re.sub(r'^(永久记录\s*)?\d{8}\s*[|｜]?\s*', '', title)
        venue = field('期刊', 'Journal', '机构', 'Publisher', 'Organi[sz]ation')
        venue = re.split(r'[;；]|, published| online', venue)[0].strip().rstrip('，,')
        lm = field('链接', 'DOI', 'Link') or t
        url = re.search(r'https?://[^\s）；;，,·]+', lm)
        url = url.group(0).rstrip('.') if url else ''
        if url.count(')') > url.count('('): url = url.rstrip(')')
        if not url:
            doi = re.search(r'10\.\d{4,9}/[^\s）；;，,]+', t)
            url = 'https://doi.org/' + doi.group(0) if doi else ''
        venue_en = venue
        for zh_, en_ in [('（', ' ('), ('）', ')'), ('，', ', '), ('开放获取', 'open access'), ('同行评审', 'peer-reviewed'), ('第四版', '4th edition')]:
            venue_en = venue_en.replace(zh_, en_)
        perm.append(dict(date=iso(d8), title=title, venue=venue, venue_en=venue_en, url=url, file=os.path.basename(f)))
    perm_en = {}
    pe = os.path.join(ROOT, 'data/briefs/permanent.en.json')
    if os.path.exists(pe): perm_en = json.load(open(pe, encoding='utf-8'))
    for p in perm:
        p.update(perm_en.get(p['file'], {}))
    json.dump(perm, open(perm_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

json.dump(dict(generated=datetime.datetime.now().astimezone().isoformat(timespec='minutes'), categories={k: dict(zh=v['zh'], en=v['en']) for k, v in CATS.items()}, briefs=index), open(os.path.join(ROOT, 'data/briefs/briefs.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

# index page
o = [HEAD.format(title='QCF 简报 · Briefs', desc='QCF 简报：人类生物基因、量子能生态 RWA、文明大学国际教育，每周更新，附原始来源。', path='briefs.html')]
o.append('<section class="story brief-hero"><div class="reading-width"><div class="eyebrow">QCF · BRIEFS</div>')
o.append(bi('h1', 'QCF 简报', 'QCF Briefs'))
o.append(bi('p', 'QCF 每周整理三个领域的全球进展：人类生物基因、量子能生态 RWA、文明大学国际教育。公开页面提供摘要与条目标题、来源；完整简报请在各期页面索取，将以 PDF 发送至您的邮箱。按发布时间倒序排列。', 'Each week QCF summarises global progress in three fields: human bio-gene science, quantum energy and RWA, and international education for the Civilization University. Public pages show a summary plus item titles and sources. Request the full brief on each edition page and we will email you the PDF. Newest first.', 'lead'))
o.append('<div class="tabs" role="tablist">')
counts = {c: sum(1 for x in index if x['category'] == c) for c in CATS}
for c, v in CATS.items():
    o.append(f'<button class="tab" role="tab" data-cat="{c}" aria-selected="false"><span data-zh="{E(E(v["zh"]))}" data-en="{E(E(v["en"]))}">{E(v["zh"])}</span> <span class="count">{counts[c]}</span></button>')
o.append(f'<button class="tab" role="tab" data-cat="permanent" aria-selected="false"><span data-zh="永久档案" data-en="Permanent archive">永久档案</span> <span class="count">{len(perm)}</span></button></div></div></section>')
o.append('<section class="alt"><div class="reading-width">')
for c, v in CATS.items():
    o.append(f'<div class="panel" id="{c}" data-panel="{c}"><div class="eyebrow">{E(v["eyebrow"])}</div>' + bi('h2', v['zh'], v['en']) + bi('p', v['dzh'], v['den'], 'mute'))
    for x in [x for x in index if x['category'] == c]:
        o.append(f'<a class="brief-row" href="{x["href"]}"><div><time datetime="{x["date"]}" class="small mute">{x["date"]} · <span data-zh="{x["items"]} 条" data-en="{x["items"]} items">{x["items"]} 条</span></time>' + bi('h3', x['title_zh'], x['title_en']) + bi('p', x['summary_zh'], x['summary_en'], 'clamp') + '</div></a>')
    o.append('</div>')
o.append('<div class="panel" id="permanent" data-panel="permanent"><div class="eyebrow">QCF · PERMANENT ARCHIVE</div>' + bi('h2', '永久档案', 'Permanent archive') + bi('p', '简报中引用的顶刊论文与权威年度报告长期保留，链接指向原始出版页。', 'Peer-reviewed papers in leading journals and authoritative annual reports cited in our briefs are kept permanently. Links go to the original publisher pages.', 'mute') + '<ol class="perm">')
for p in perm:
    venue = bi('span', p['venue'], p.get('venue_en') or p['venue'], 'small mute') if p['venue'] else ''
    tt = bi('span', p['title'], p.get('title_en') or p['title'], 'ptitle')
    link = f'<a href="{E(p["url"])}" target="_blank" rel="noopener noreferrer">{tt} ↗</a>' if p['url'] else tt
    o.append(f'<li><time class="small mute" datetime="{p["date"]}">{p["date"]}</time>{link}{venue}</li>')
o.append('</ol></div>')
o.append('<p class="note" data-zh="另见：QCF-E 量子科技与量子能生态部署简报（含 PDF 档案）。" data-en="See also: QCF-E quantum technology and quantum energy deployment briefs (with PDF archive).">另见：QCF-E 量子科技与量子能生态部署简报（含 PDF 档案）。</p><p><a class="btn ghost sm" href="quantum-energy-briefs.html" data-zh="打开 QCF-E 简报" data-en="Open QCF-E briefs">打开 QCF-E 简报</a></p>')
o.append('</div></section>' + TAIL)
open(os.path.join(ROOT, 'briefs.html'), 'w', encoding='utf-8').write('\n'.join(o))
print('built', len(index), 'brief pages;', counts, '; permanent', len(perm), '; english', sum(x['english'] for x in index))
