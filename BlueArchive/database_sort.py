import json

with open('database.json', 'r', encoding='utf-8') as file_read:
    db = json.load(file_read)
    for i in db['database']:
        if not 'artist' in i:
            i['artist'] = ""
        if 'album' in i:
            del i['album']
        if 'albumartist' in i:
            del i['albumartist']
        if 'year' in i:
            del i['year']
    
    with open('database.json', 'w', encoding='utf-8') as database2:
        database2.write(json.dumps(db, sort_keys=True))

# No need to close files
