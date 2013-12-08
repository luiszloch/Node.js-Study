# Album-Manager

This is our module for managir photo albums based on a directory. We assum that, given a path, there is an albums sub-folder, and each of its individual sub-folders are themselves the albums. Files in those sub-folders are photos.

## Album Manager

The album manager exposes a single function, 'albums', which returns an array of 'Album' objects for each album it contains.

## Album Object

The album object has the following two properties and one method:

* 'name' -- The name of the album
* 'path' -- The path of the album
* 'photos()' -- Calling this method will return all the album's photos