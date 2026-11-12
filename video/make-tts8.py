"""Generates narration mp3s with edge-tts and build8/scenes8.json with measured durations."""
import asyncio, json, os, subprocess, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(ROOT, 'build8')
VOICE = 'en-US-AndrewNeural'
RATE = os.environ.get('TTS_RATE', '+5%')  # tuned so 1285 words ≈ 8:15 video

sys.path.insert(0, ROOT)
os.environ.setdefault('NODE_PATH', ROOT)
import subprocess as sp
out = sp.run(['node', '-e',
  'const {SCENES}=require("./narration8.js");console.log(JSON.stringify(SCENES))'],
  capture_output=True, text=True, cwd=ROOT)
if out.returncode != 0:
    sys.exit(out.stderr)
SCENES = json.loads(out.stdout)

os.makedirs(BUILD, exist_ok=True)

async def gen(sc):
    import edge_tts
    mp3 = os.path.join(BUILD, f"{sc['id']}.mp3")
    if os.path.exists(mp3) and os.path.getsize(mp3) > 1000:
        return mp3  # already generated at this rate
    last = None
    for attempt in range(6):
        try:
            await edge_tts.Communicate(sc['text'], VOICE, rate=RATE).save(mp3)
            if os.path.getsize(mp3) > 1000:
                return mp3
        except Exception as e:
            last = e
            await asyncio.sleep(2 + attempt * 3)
    raise last

async def main():
    for sc in SCENES:
        mp3 = await gen(sc)
        probe = subprocess.run(
            [os.path.join(ROOT, 'node_modules', 'ffprobe-static', 'bin', 'win32', 'x64', 'ffprobe.exe'),
             '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3],
            capture_output=True, text=True)
        sc['narrSec'] = round(float(probe.stdout.strip()), 2)
        print(f"✓ {sc['id']}  {sc['narrSec']}s")

asyncio.run(main())

with open(os.path.join(BUILD, 'scenes8.json'), 'w', encoding='utf-8') as f:
    json.dump(SCENES, f, indent=2, ensure_ascii=False)
total = sum(s['narrSec'] for s in SCENES) + len(SCENES) * 1.5
print(f"TOTAL narration {sum(s['narrSec'] for s in SCENES):.0f}s → video ≈ {total/60:.1f} min")
