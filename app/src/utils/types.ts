import { Movie, TVSeries } from '../types/models';

export type LibraryItem = Movie | TVSeries;

export type FilterTab = 'all' | 'watched' | 'favourites' | 'unwatched';

export const isMovie = (item: LibraryItem): item is Movie =>
  'releaseDate' in item && 'runtime' in item;

export const isTVSeries = (item: LibraryItem): item is TVSeries =>
  'numberOfSeasons' in item && 'numberOfEpisodes' in item;
