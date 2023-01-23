#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json
import shutil
import argparse
import os
from pathlib import Path

# Do not use this script as module
if __name__ != '__main__':
    print('This script must run as main, not as module!')
    exit(1)


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
        os.mkdir(given_path)
        return given_path


def str2bool(string: str):
    if isinstance(string, bool):
        return str
    if string.lower() in ('1', 't', 'true', 'y', 'yes'):
        return True
    elif string.lower() in ('0', 'f', 'false', 'n', 'no'):
        return False
    else:
        raise argparse.ArgumentTypeError('Boolean value is expected')


def is_json(obj):
    try:
        json_object = json.loads(obj)
        iter(json_object)
    except Exception as e:
        return False
    return True


# Define arguments
parser = argparse.ArgumentParser()
parser.description = 'Copy files listed in MediaCatalog.json to output directory with renaming them'
parser.add_argument('-i', '--input', type=dir_path,
                    default='MediaPatch')
parser.add_argument('-o', '--output', type=dir_path,
                    default='output')
parser.add_argument('-c', '--catalog', type=argparse.FileType('r', encoding='utf-8'),
                    default='MediaPatch/MediaCatalog.json')
parser.add_argument('-t', '--theme-only', type=str2bool, default=True)

# Parse arguments
argument = parser.parse_args()
# print(argument)


# Process catalog file
# if not is_json(argument.catalog):
#	raise ValueError('Given MediaCatalog.json file is not JSON')
catalog = json.load(argument.catalog)

# Print notice
print("This will take a while... Please wait...")

# Process source directory
input_dict = dict()
noticed = dict()
for filename in argument.input.glob('*'):
    if filename.name.endswith('.dat') or filename.name.endswith('.hash') or filename.name.endswith('.json'):
        continue
    input_dict[filename.resolve()] = filename.stat().st_size

for dict_key, dict_value in input_dict.items():
    for catalog_item in catalog['Table'].values():
        # Skip non-Theme files when '--only-theme' flag is set to True
        if argument.only_theme and not catalog_item['path'].startswith('Audio/BGM'):
            continue
        if catalog_item['isInbuild'] == True and not catalog_item['fileName'] in noticed:
            print(
                f"WARNING: {catalog_item['fileName']} is not in MediaPatch directory! Extract it from APK.")
            noticed[catalog_item['fileName']] = True
            continue
        if int(dict_value) == int(catalog_item['bytes']):
            shutil.copy(dict_key, Path(argument.output).absolute() /
                        catalog_item['fileName'])
            del catalog_item

# Close MediaCatalog.json file for safety
argument.catalog.close()

# Print notice
print("Job done.")
