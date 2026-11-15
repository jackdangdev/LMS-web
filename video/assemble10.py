"""Assembles the final v2 8-minute EduNova introduction (30-slide structure + Cypress demo)."""
import json, os, subprocess, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
FFMPEG = os.path.join(ROOT, 'node_modules', 'ffmpeg-static', 'ffmpeg.exe')
FFPROBE = os.path.join(ROOT, 'node_modules', 'ffprobe-static', 'bin', 'win32', 'x64', 'ffprobe.exe')
BUILD = os.path.join(ROOT, 'build10')
OUT = os.path.join(ROOT, '..', 'docs', 'assets', 'video', 'EduNova-Demo-Video.mp4')

SCENES = json.load(open(os.path.join(BUILD, 'scenes10.json'), encoding='utf-8'))

LEAD_MS = 500          # narration starts 0.5s after each cut
TAIL_S = 1.0           # quiet tail after narration ends

def run(args):
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr[-1200:])
        sys.exit(f'ffmpeg failed: {" ".join(args[:6])}...')

segments = []
for i, sc in enumerate(SCENES):
    sid, narr = sc['id'], sc['narrSec']
    dur = round(narr + LEAD_MS / 1000 + TAIL_S, 2)
    seg = os.path.join(BUILD, f'seg-{sid}.mp4')
    audio = os.path.join(BUILD, f'{sid}.mp3')
    af = f'adelay={LEAD_MS}|{LEAD_MS},apad,aresample=44100'
    if i == 0:
        vf = 'scale=1440:900,fade=t=in:st=0:d=0.8,format=yuv420p'
    elif i == len(SCENES) - 1:
        vf = 'scale=1440:900,fade=t=out:st=%.2f:d=0.8,format=yuv420p' % (dur - 0.8)
    else:
        vf = 'scale=1440:900,format=yuv420p'

    if sc['type'] == 'slide':
        img = os.path.join(BUILD, sc['slide'] + '.png')
        run([FFMPEG, '-y', '-loop', '1', '-framerate', '30', '-i', img, '-i', audio,
             '-t', str(dur), '-vf', vf, '-af', af,
             '-c:v', 'libx264', '-preset', 'medium', '-crf', '22',
             '-c:a', 'aac', '-b:a', '160k', '-ac', '2', '-ar', '44100', seg])
    elif sc['type'] == 'cypress':
        vid = os.path.join(BUILD, sc['video'])
        run([FFMPEG, '-y', '-i', vid, '-i', audio,
             '-t', str(dur), '-r', '30', '-vf', vf, '-af', af,
             '-c:v', 'libx264', '-preset', 'medium', '-crf', '22',
             '-c:a', 'aac', '-b:a', '160k', '-ac', '2', '-ar', '44100', seg])
    else:  # app — webm screen recording (auto slow-mo if narration is longer)
        webm = os.path.join(BUILD, 'vid', sc.get('src', sid) + '.webm')
        probe = subprocess.run([FFPROBE, '-v', 'error', '-show_entries', 'format=duration',
                                '-of', 'csv=p=0', webm], capture_output=True, text=True)
        webm_dur = float(probe.stdout.strip())
        stretch = dur / webm_dur
        if stretch > 1.05:
            vf = f'setpts={stretch:.4f}*PTS,' + vf
        run([FFMPEG, '-y', '-i', webm, '-i', audio,
             '-t', str(dur), '-r', '30', '-vf', vf, '-af', af,
             '-c:v', 'libx264', '-preset', 'medium', '-crf', '22',
             '-c:a', 'aac', '-b:a', '160k', '-ac', '2', '-ar', '44100', seg])
    segments.append(seg)
    print(f'✓ seg {sid} ({dur}s)')

listing = os.path.join(BUILD, 'concat.txt')
with open(listing, 'w') as f:
    for seg in segments:
        f.write(f"file '{seg}'\n")

os.makedirs(os.path.dirname(OUT), exist_ok=True)
run([FFMPEG, '-y', '-f', 'concat', '-safe', '0', '-i', listing,
     '-c', 'copy', '-movflags', '+faststart', OUT])

probe = subprocess.run([FFPROBE,
                        '-v', 'error', '-show_entries', 'format=duration,size', '-of', 'csv=p=0', OUT],
                       capture_output=True, text=True)
dur_s, size_b = probe.stdout.strip().split(',')
print(f'FINAL: {OUT}')
print(f'duration {float(dur_s)/60:.2f} min · {int(size_b)/1e6:.1f} MB')
