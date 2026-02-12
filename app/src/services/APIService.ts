import axios from 'axios';
import { Config } from '../config';
import {
  Movie,
  TVSeries,
  WatchStatus,
  TMDBSearchResponse,
  TMDBMovieDetails,
  TMDBTVSearchResponse,
  TMDBVideosResponse,
  TMDBVideo,
  APIError,
} from '../types/models';

class APIService {
  private static instance: APIService;
  private tmdbAPIKey: string;
  private tmdbBaseURL = 'https://api.themoviedb.org/3';
  private imageBaseURL = 'https://image.tmdb.org/t/p';

  private constructor() {
    this.tmdbAPIKey = Config.tmdbAPIKey;
  }

  static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  // MARK: - TMDB API Methods

  /**
   * Search for movies by query string
   */
  async searchMovie(query: string): Promise<Movie[]> {
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `${this.tmdbBaseURL}/search/movie?api_key=${this.tmdbAPIKey}&query=${encodedQuery}`;

      const response = await axios.get<TMDBSearchResponse>(url);
      
      return response.data.results.map((tmdbMovie) => ({
        id: String(tmdbMovie.id),
        title: tmdbMovie.title,
        posterURL: tmdbMovie.poster_path
          ? `${this.imageBaseURL}/w500${tmdbMovie.poster_path}`
          : undefined,
        backdropURL: tmdbMovie.backdrop_path
          ? `${this.imageBaseURL}/w1280${tmdbMovie.backdrop_path}`
          : undefined,
        overview: tmdbMovie.overview,
        releaseDate: tmdbMovie.release_date,
        rating: tmdbMovie.vote_average,
        genres: [],
        cast: [],
        watchStatus: WatchStatus.WatchLater,
        dateAdded: new Date(),
      }));
    } catch (error) {
      throw new APIError('Failed to search movies');
    }
  }

  /**
   * Get detailed information about a specific movie
   */
  async getMovieDetails(movieId: string): Promise<Movie> {
    try {
      const url = `${this.tmdbBaseURL}/movie/${movieId}?api_key=${this.tmdbAPIKey}&append_to_response=credits,videos`;

      const response = await axios.get<TMDBMovieDetails>(url);
      const details = response.data;

      return {
        id: String(details.id),
        title: details.title,
        posterURL: details.poster_path
          ? `${this.imageBaseURL}/w500${details.poster_path}`
          : undefined,
        backdropURL: details.backdrop_path
          ? `${this.imageBaseURL}/w1280${details.backdrop_path}`
          : undefined,
        overview: details.overview,
        releaseDate: details.release_date,
        rating: details.vote_average,
        genres: details.genres.map((g) => g.name),
        runtime: details.runtime,
        director: details.credits?.crew.find((c) => c.job === 'Director')?.name,
        cast: details.credits?.cast.slice(0, 10).map((c) => c.name) || [],
        watchStatus: WatchStatus.WatchLater,
        dateAdded: new Date(),
      };
    } catch (error) {
      throw new APIError('Failed to get movie details');
    }
  }

  /**
   * Search for TV series by query string
   */
  async searchTVSeries(query: string): Promise<TVSeries[]> {
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `${this.tmdbBaseURL}/search/tv?api_key=${this.tmdbAPIKey}&query=${encodedQuery}`;

      const response = await axios.get<TMDBTVSearchResponse>(url);

      return response.data.results.map((tmdbTV) => ({
        id: String(tmdbTV.id),
        title: tmdbTV.name,
        posterURL: tmdbTV.poster_path
          ? `${this.imageBaseURL}/w500${tmdbTV.poster_path}`
          : undefined,
        overview: tmdbTV.overview,
        numberOfSeasons: tmdbTV.number_of_seasons || 0,
        numberOfEpisodes: tmdbTV.number_of_episodes || 0,
        watchStatus: WatchStatus.WatchLater,
        dateAdded: new Date(),
      }));
    } catch (error) {
      throw new APIError('Failed to search TV series');
    }
  }

  /**
   * Get video trailers for a movie
   */
  async getMovieVideos(movieId: string): Promise<TMDBVideo[]> {
    try {
      const url = `${this.tmdbBaseURL}/movie/${movieId}/videos?api_key=${this.tmdbAPIKey}`;

      const response = await axios.get<TMDBVideosResponse>(url);
      return response.data.results;
    } catch (error) {
      throw new APIError('Failed to get movie videos');
    }
  }

  /**
   * Get trending movies (for homepage)
   */
  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<Movie[]> {
    try {
      const url = `${this.tmdbBaseURL}/trending/movie/${timeWindow}?api_key=${this.tmdbAPIKey}`;

      const response = await axios.get<TMDBSearchResponse>(url);
      
      return response.data.results.map((tmdbMovie) => ({
        id: String(tmdbMovie.id),
        title: tmdbMovie.title,
        posterURL: tmdbMovie.poster_path
          ? `${this.imageBaseURL}/w500${tmdbMovie.poster_path}`
          : undefined,
        backdropURL: tmdbMovie.backdrop_path
          ? `${this.imageBaseURL}/w1280${tmdbMovie.backdrop_path}`
          : undefined,
        overview: tmdbMovie.overview,
        releaseDate: tmdbMovie.release_date,
        rating: tmdbMovie.vote_average,
        genres: [],
        cast: [],
        watchStatus: WatchStatus.WatchLater,
        dateAdded: new Date(),
      }));
    } catch (error) {
      throw new APIError('Failed to get trending movies');
    }
  }

  /**
   * Get popular movies (for homepage)
   */
  async getPopularMovies(): Promise<Movie[]> {
    try {
      const url = `${this.tmdbBaseURL}/movie/popular?api_key=${this.tmdbAPIKey}`;

      const response = await axios.get<TMDBSearchResponse>(url);
      
      return response.data.results.map((tmdbMovie) => ({
        id: String(tmdbMovie.id),
        title: tmdbMovie.title,
        posterURL: tmdbMovie.poster_path
          ? `${this.imageBaseURL}/w500${tmdbMovie.poster_path}`
          : undefined,
        backdropURL: tmdbMovie.backdrop_path
          ? `${this.imageBaseURL}/w1280${tmdbMovie.backdrop_path}`
          : undefined,
        overview: tmdbMovie.overview,
        releaseDate: tmdbMovie.release_date,
        rating: tmdbMovie.vote_average,
        genres: [],
        cast: [],
        watchStatus: WatchStatus.WatchLater,
        dateAdded: new Date(),
      }));
    } catch (error) {
      throw new APIError('Failed to get popular movies');
    }
  }

  /**
   * Get YouTube URL for a video
   */
  getYoutubeURL(video: TMDBVideo): string | null {
    if (video.site === 'YouTube') {
      return `https://www.youtube.com/watch?v=${video.key}`;
    }
    return null;
  }
}

export default APIService.getInstance();
