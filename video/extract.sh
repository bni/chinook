#!/bin/bash
ffmpeg -ss 00:02:00 -i in.mp4 -frames:v 40 -vf "select=not(mod(n\,10))" -fps_mode vfr frames/out_%03d.jpg
ffmpeg -ss 00:02:00 -i in.mp4 -t 13 -map 0 -c copy out.mp4

# Pipe video stream (rtsp:// ???) to ffmpeg that outputs every 10 frames to jpeg.
# Use chokidar to trigger as the jpegs appear.
# Use Bedrock ConversStream API to send jpegs continously as they appear and read the streaming response.
# Use websockets in the client and server to return the conversation continously.
