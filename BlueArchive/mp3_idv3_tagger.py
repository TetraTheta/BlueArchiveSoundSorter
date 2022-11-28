#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
This script will set IDv3 tag to Blue Archive JP BGM files converted to MP3 format
Since Blue Archive JP's BGM is OGG format, you must transcode them into MP3 format first

Usage:
python <this script>.py [-i input_directory] [-d database_file]

Requirements:
  - Some Python packages
      - eyed3
        pip install eyed3
      - python-magic-bin
        pip install python-magic-bin
  - Directory only contains transcoded BA JP BGM files
    This script only process MP3 files. No OGG files!

Note:
  - I included unassigned tracks for later comvenience

"""

import json
import os
import argparse
import eyed3
from pathlib import Path

# Do not use this script as module
if __name__ != '__main__':
    print('This script must run as main, not module!')
    exit()

# Change current working directory for scripting
os.chdir(Path(__file__).resolve().parent)

# Define argument-related method first


def dir_path(string: str):
    if isinstance(string, str):
        given_path = Path(string)

    given_path = given_path.resolve().absolute()

    if given_path.is_dir():
        return given_path
    else:
        # os.mkdir(given_path) # No, don't create source directory
        raise NotADirectoryError('Given directory is not actual directory!')


# Define arguments
parser = argparse.ArgumentParser()
parser.description = 'Set IDv3 tags to MP3 files from database JSON file'
parser.add_argument('-i', '--input', type=dir_path, default='mp3')
parser.add_argument('-d', '--database', type=argparse.FileType('r',
                    encoding='utf-8'), default='database.json')

# Parse arguments
argument = parser.parse_args()

# Process database file
db = json.load(argument.database)

database = db['database']
common = db['common']

# Open Album Art file
artfile = open('game_ost_album_art.webp', 'rb')
art = artfile.read()

# Process input directory files
input_list = list(argument.input.glob('*.mp3'))

for i in input_list:
    for d in database:
        if i.stem == d['name_old']:
            file = eyed3.load(i)
            tag = file.tag
            tag.album = common['album']
            tag.album_artist = common['album_artist']
            tag.artist = d['artist']
            tag.title = d['title']
            tag.track_num = (d['track'], None)
            tag.recording_date = common['year']
            tag.images.set(3, art, 'image/webp')
            tag.save()
            file.rename(d['name_new'])

# Close files for safety
artfile.close()
argument.database.close()
