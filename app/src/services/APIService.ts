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
  private omdbAPIKey: string;
  private tmdbBaseURL = 'https://api.themoviedb.org/3';
  private omdbBaseURL = 'http://www.omdbapi.com';
  private imageBaseURL = 'https://image.tmdb.org/t/p';

  private constructor() {
    this.tmdbAPIKey = Config.tmdbAPIKey;
    this.omdbAPIKey = Config.omdbAPIKey;
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

  /**
   * Get Rotten Tomatoes score from OMDB API using IMDB ID
   */
  async getRottenTomatoesScore(imdbId: string): Promise<number | undefined> {
    try {
      const url = `${this.omdbBaseURL}/?apikey=${this.omdbAPIKey}&i=${imdbId}`;
      const response = await axios.get(url);
      
      if (response.data.Response === 'True' && response.data.Ratings) {
        const rtRating = response.data.Ratings.find(
          (r: any) => r.Source === 'Rotten Tomatoes'
        );
        
        if (rtRating && rtRating.Value) {
          // Extract percentage (e.g., "73%" -> 73)
          return parseInt(rtRating.Value.replace('%', ''), 10);
        }
      }
      
      return undefined;
    } catch (error) {
      console.error('Failed to get RT score:', error);
      return undefined;
    }
  }

  /**
   * Get watch providers for a movie
   */
  async getWatchProviders(movieId: string, region: string = 'US'): Promise<any[]> {
    try {
      const url = `${this.tmdbBaseURL}/movie/${movieId}/watch/providers?api_key=${this.tmdbAPIKey}`;
      const response = await axios.get(url);
      
      const regionData = response.data.results[region];
      if (!regionData) return [];
      
      // Return flatrate (streaming) providers
      return (regionData.flatrate || []).map((provider: any) => ({
        id: provider.provider_id,
        name: provider.provider_name,
        logo: `${this.imageBaseURL}/original${provider.logo_path}`,
      }));
    } catch (error) {
      console.error('Failed to get watch providers:', error);
      return [];
    }
  }

  /**
   * Get full movie details with RT score
   */
  async getMovieDetailsWithRT(movieId: string): Promise<Movie> {
    try {
      const url = `${this.tmdbBaseURL}/movie/${movieId}?api_key=${this.tmdbAPIKey}&append_to_response=credits,videos,external_ids`;

      const response = await axios.get<any>(url);
      const details = response.data;

      // Get RT score if IMDB ID is available
      let rottenTomatoesScore: number | undefined;
      if (details.external_ids?.imdb_id) {
        rottenTomatoesScore = await this.getRottenTomatoesScore(details.external_ids.imdb_id);
      }

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
        rottenTomatoesScore,
        genres: details.genres.map((g: any) => g.name),
        runtime: details.runtime,
        director: details.credits?.crew.find((c: any) => c.job === 'Director')?.name,
        cast: details.credits?.cast.slice(0, 10).map((c: any) => c.name) || [],
        watchStatus: WatchStatus.WatchLater,
        dateAdded: new Date(),
      };
    } catch (error) {
      throw new APIError('Failed to get movie details with RT score');
    }
  }
}

export default APIService.getInstance();
