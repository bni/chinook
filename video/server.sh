#!/bin/bash
ffmpeg -f avfoundation -pix_fmt uyvy422 -framerate 30 -video_size 640x480 -i "0" -c:v libx264 -preset ultrafast -tune zerolatency -f mpegts udp://127.0.0.1:5004
