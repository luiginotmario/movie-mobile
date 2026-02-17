import { supabase } from '../lib/supabase';
import { LibraryItem, Movie, TVSeries } from '../utils/types';
import { WatchStatus } from '../types/models';

class LibraryService {
  private static instance: LibraryService;

  static getInstance(): LibraryService {
    if (!LibraryService.instance) {
      LibraryService.instance = new LibraryService();
    }
    return LibraryService.instance;
  }

  /**
   * Get all movies for the current user
   */
  async getUserMovies(userId: string): Promise<LibraryItem[]> {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('user_id', userId)
        .order('date_added', { ascending: false });

      if (error) throw error;

      return (data || []).map((movie) => this.mapDatabaseToLibraryItem(movie));
    } catch (error) {
      console.error('Failed to fetch user movies:', error);
      return [];
    }
  }

  /**
   * Add a movie to the user's library
   */
  async addMovie(userId: string, movieData: Partial<Movie>): Promise<boolean> {
    try {
      const { error } = await supabase.from('movies').insert({
        user_id: userId,
        tmdb_id: movieData.id,
        title: movieData.title,
        poster_url: movieData.posterURL,
        backdrop_url: movieData.backdropURL,
        overview: movieData.overview,
        release_date: movieData.releaseDate,
        genres: movieData.genres || [],
        rating: movieData.rating,
        rotten_tomatoes_score: movieData.rottenTomatoesScore,
        runtime: movieData.runtime,
        director: movieData.director,
        cast: movieData.cast || [],
        watch_status: movieData.watchStatus || WatchStatus.WatchLater,
        is_favourite: false,
        date_added: new Date().toISOString(),
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to add movie:', error);
      return false;
    }
  }

  /**
   * Remove a movie from the user's library
   */
  async removeMovie(userId: string, tmdbId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('user_id', userId)
        .eq('tmdb_id', tmdbId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to remove movie:', error);
      return false;
    }
  }

  /**
   * Update movie watch status
   */
  async updateWatchStatus(userId: string, tmdbId: string, status: WatchStatus): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('movies')
        .update({ watch_status: status })
        .eq('user_id', userId)
        .eq('tmdb_id', tmdbId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to update watch status:', error);
      return false;
    }
  }

  /**
   * Toggle favourite status
   */
  async toggleFavourite(userId: string, tmdbId: string): Promise<boolean> {
    try {
      // First get current status
      const { data, error: fetchError } = await supabase
        .from('movies')
        .select('is_favourite')
        .eq('user_id', userId)
        .eq('tmdb_id', tmdbId)
        .single();

      if (fetchError) throw fetchError;

      // Toggle it
      const { error: updateError } = await supabase
        .from('movies')
        .update({ is_favourite: !data.is_favourite })
        .eq('user_id', userId)
        .eq('tmdb_id', tmdbId);

      if (updateError) throw updateError;
      return true;
    } catch (error) {
      console.error('Failed to toggle favourite:', error);
      return false;
    }
  }

  /**
   * Check if a movie exists in user's library
   */
  async movieExists(userId: string, tmdbId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('id')
        .eq('user_id', userId)
        .eq('tmdb_id', tmdbId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return !!data;
    } catch (error) {
      console.error('Failed to check movie existence:', error);
      return false;
    }
  }

  /**
   * Map database row to LibraryItem type
   */
  private mapDatabaseToLibraryItem(dbMovie: any): LibraryItem {
    return {
      id: dbMovie.tmdb_id,
      title: dbMovie.title,
      posterURL: dbMovie.poster_url,
      backdropURL: dbMovie.backdrop_url,
      overview: dbMovie.overview,
      releaseDate: dbMovie.release_date,
      genres: dbMovie.genres || [],
      rating: dbMovie.rating,
      rottenTomatoesScore: dbMovie.rotten_tomatoes_score,
      runtime: dbMovie.runtime,
      director: dbMovie.director,
      cast: dbMovie.cast || [],
      watchStatus: dbMovie.watch_status || WatchStatus.WatchLater,
      isFavourite: dbMovie.is_favourite || false,
      dateAdded: new Date(dbMovie.date_added),
    };
  }
}

export const libraryService = LibraryService.getInstance();
