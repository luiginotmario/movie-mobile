import { useMemo } from 'react';
import { LibraryItem, FilterTab } from '../utils/types';
import { WatchStatus } from '../types/models';

export function useFilteredLibrary(
  items: LibraryItem[],
  filter: FilterTab,
  mode: 'movies' | 'tv'
): LibraryItem[] {
  return useMemo(() => {
    let filtered = items;

    if (mode === 'movies') {
      filtered = filtered.filter((i) => 'releaseDate' in i);
    } else {
      filtered = filtered.filter((i) => 'numberOfSeasons' in i);
    }

    switch (filter) {
      case 'watched':
        return filtered.filter((i) => i.watchStatus === WatchStatus.Watched);
      case 'unwatched':
        return filtered.filter((i) => i.watchStatus === WatchStatus.WatchLater);
      case 'favourites':
        return filtered.filter((i) => i.isFavourite === true);
      default:
        return filtered;
    }
  }, [items, filter, mode]);
}
