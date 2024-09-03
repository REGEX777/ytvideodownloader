
YouTube Downloader
==================
## [WORK IN PROGRESS PROJECT]
Welcome to the YouTube Downloader project! This application allows users to download videos from YouTube by simply providing a video URL. The app supports multiple video formats and quality levels.

Features
--------

*   Download YouTube videos by URL.
*   Choose from available video formats and quality levels.
*   Sanitized file naming for downloads.
*   Download progress displayed in the server logs.

Installation
------------

To install and run this project, follow these steps:

    git clone https://github.com/yourusername/ytvideodownloader.git
    cd ytvideodownloader
    npm install

Running the App
---------------

To start the application, run the following command:

    npm start

The app will be available at `http://localhost:3000`

Usage
-----

To download a video:

*   Navigate to the home page at `http://localhost:3000`.
*   Enter the YouTube video URL you want to download.
*   Select the desired format and quality from the options provided.
*   Click the download button to start downloading the video.

API Endpoints
-------------

### GET /api/youtube/download/formats

Fetches available video formats for a given YouTube URL.

    http://localhost:3000/api/youtube/download/formats?url=YOUTUBE_VIDEO_URL

### GET /api/youtube/download/video

Downloads the selected video format.

    http://localhost:3000/api/youtube/download/video?url=YOUTUBE_VIDEO_URL&itag=ITAG

License
-------

This project is licensed under the MIT License.

Contributing
------------

Contributions are welcome! Please feel free to submit a pull request.
