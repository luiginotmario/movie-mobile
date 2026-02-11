// Movie and TV Series Models

export interface Movie {
  id: string;
  title: string;
  posterURL?: string;
  backdropURL?: string;
  overview: string;
  releaseDate?: string;
  rating?: number;
  rottenTomatoesScore?: number;
  genres: string[];
  runtime?: number; // in minutes
  director?: string;
  cast: string[];
  // User-specific data
  watchStatus: WatchStatus;
  dateAdded: Date;
  userRating?: number;
  notes?: string;
  sourceService?: StreamingService;
}

export interface TVSeries {
  id: string;
  title: string;
  posterURL?: string;
  overview: string;
  numberOfSeasons: number;
  numberOfEpisodes: number;
  watchStatus: WatchStatus;
  currentSeason?: number;
  currentEpisode?: number;
  dateAdded: Date;
  sourceService?: StreamingService;
}

export enum WatchStatus {
  WatchLater = 'Watch Later',
  Watching = 'Watching',
  Watched = 'Watched',
}

export enum StreamingService {
  Netflix = 'Netflix',
  PrimeVideo = 'Prime Video',
  DisneyPlus = 'Disney+',
  HBOMax = 'HBO Max',
  AppleTV = 'Apple TV+',
  Hulu = 'Hulu',
  Other = 'Other',
}

export enum MediaType {
  Movie = 'Movie',
  TVSeries = 'TV Series',
}

// TMDB API Response Types

export interface TMDBSearchResponse {
  results: TMDBMovie[];
}

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  vote_average?: number;
}

export interface TMDBMovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  vote_average?: number;
  runtime?: number;
  genres: TMDBGenre[];
  credits?: TMDBCredits;
}

export interface TMDBTVSearchResponse {
  results: TMDBTVSeries[];
}

export interface TMDBTVSeries {
  id: number;
  name: string;
  overview: string;
  poster_path?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBCredits {
  cast: TMDBCast[];
  crew: TMDBCrew[];
}

export interface TMDBCast {
  name: string;
  character: string;
}

export interface TMDBCrew {
  name: string;
  job: string;
}

export interface TMDBVideosResponse {
  results: TMDBVideo[];
}

export interface TMDBVideo {
  key: string;
  name: string;
  site: string;
  type: string;
  official?: boolean;
}

export class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIError';
  }
}
