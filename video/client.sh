#!/bin/bash
ffmpeg -i udp://127.0.0.1:5004 -vf "select=not(mod(n\,10))" -fps_mode vfr frames/frame_%03d.jpg
