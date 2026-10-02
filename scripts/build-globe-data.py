#!/usr/bin/env python3
"""生成分部地球用的数据 → public/data/gdg-globe.json

用法：python3 scripts/build-globe-data.py <chapters.json> <land-110m.json>
  chapters.json  来自 https://gdg.community.dev/api/chapter_region/?chapters=true（GDG 官方公开接口）
  land-110m.json 来自 https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json（Natural Earth，公有领域）

输出：
  land:     陆地点阵，[纬度×10, 经度×10, ...] 平铺的整数数组（约每 1.1° 一个点，各纬度点距相等）
  chapters: [[纬度, 经度, 地区序号, 名称, 城市, 国家代码, 链接路径], ...]
  regions:  五个地区名 + 各自分部总数（含没有坐标、地球上画不出来的）
"""
import json
import math
import sys
from pathlib import Path

chapters_path, land_path = sys.argv[1], sys.argv[2]
out = Path(__file__).resolve().parent.parent / 'public' / 'data' / 'gdg-globe.json'

# ---------- 陆地：解 TopoJSON → 多边形 → 点阵 ----------
topo = json.load(open(land_path))
sx, sy = topo['transform']['scale']
tx, ty = topo['transform']['translate']
arcs = []
for arc in topo['arcs']:
    x = y = 0
    pts = []
    for dx, dy in arc:
        x += dx
        y += dy
        pts.append((x * sx + tx, y * sy + ty))
    arcs.append(pts)


def ring(idx):
    pts = []
    for i in idx:
        a = arcs[i] if i >= 0 else arcs[~i][::-1]
        pts.extend(a if not pts else a[1:])
    return pts


polys = []  # 每个多边形：[外环, 洞...]
for g in topo['objects']['land']['geometries']:
    groups = g['arcs'] if g['type'] == 'MultiPolygon' else [g['arcs']]
    for p in groups:
        rings = [ring(r) for r in p]
        xs = [q[0] for q in rings[0]]
        ys = [q[1] for q in rings[0]]
        polys.append((rings, (min(xs), max(xs), min(ys), max(ys))))


def inside(rg, x, y):
    c = False
    n = len(rg)
    j = n - 1
    for i in range(n):
        xi, yi = rg[i]
        xj, yj = rg[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            c = not c
        j = i
    return c


def on_land(lng, lat):
    for rings, (x0, x1, y0, y1) in polys:
        if x0 <= lng <= x1 and y0 <= lat <= y1 and inside(rings[0], lng, lat):
            if not any(inside(h, lng, lat) for h in rings[1:]):
                return True
    return False


STEP = 1.1  # 约 164 行（React Bits Pro Globe 默认 200 行；再密 Canvas 2D 每帧画不动）
land = []
lat = -90 + STEP / 2
while lat < 90:
    if lat > -62:  # 南极洲太大、而且没有分部，不画
        n = max(1, round(360 * math.cos(math.radians(lat)) / STEP))
        for k in range(n):
            lng = -180 + (k + 0.5) * 360 / n
            if on_land(lng, lat):
                land += [round(lat * 10), round(lng * 10)]
    lat += STEP

# ---------- 分部 ----------
regions_raw = json.load(open(chapters_path))
known = {}  # (城市, 国家) → 坐标，用来给没有坐标的校园分部补位置
for reg in regions_raw:
    for c in reg['chapters']:
        if c['latitude'] is not None and c['city']:
            known.setdefault((c['city'].strip().lower(), c['country']), (c['latitude'], c['longitude']))


def short(title):
    # "GDG on Campus Foo University - City, Country" → "GDG on Campus Foo University"
    return title.split(' - ')[0].strip() if title.startswith('GDG on Campus') else title.strip()


chapters, regions = [], []
placed = borrowed = 0
all_countries = set()
for ri, reg in enumerate(regions_raw):
    count = 0
    for c in reg['chapters']:
        if 'test chapter' in c['title'].lower():
            continue
        count += 1
        all_countries.add(c['country'])
        la, lo = c['latitude'], c['longitude']
        if la is None:
            hit = known.get(((c['city'] or '').strip().lower(), c['country']))
            if not hit:
                continue
            # 同城多个分部会叠在一起：按 id 稍微错开一点（约 10 公里内）
            h = (c['id'] * 2654435761) % 1000 / 1000
            la, lo = hit[0] + (h - 0.5) * 0.16, hit[1] + ((h * 7) % 1 - 0.5) * 0.16
            borrowed += 1
        placed += 1
        chapters.append([round(la, 2), round(lo, 2), ri, short(c['title']), (c['city'] or '').strip(), c['country'], c['relative_url']])
    regions.append({'name': reg['title'], 'count': count})

data = {
    'source': 'gdg.community.dev/chapters (official GDG chapter list) · land: Natural Earth via world-atlas',
    'land': land,
    'chapters': chapters,
    'regions': regions,
}
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')))
# 小的统计文件打包进网站代码（标题里的数字不用等大文件加载）
stats = {'total': sum(r['count'] for r in regions), 'countries': len(all_countries), 'placed': placed,
         'regions': regions, 'updated': __import__('datetime').date.today().isoformat()}
(out.parent.parent.parent / 'src' / 'globe-stats.json').write_text(json.dumps(stats, ensure_ascii=False, indent=1))
print(f'land dots {len(land) // 2}, chapters placed {placed} (borrowed coords {borrowed}) of {sum(r["count"] for r in regions)}, '
      f'countries {len(all_countries)}, size {out.stat().st_size // 1024} KB')
