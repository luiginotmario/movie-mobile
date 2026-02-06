import Foundation
import SwiftUI
import Combine

@MainActor
class MovieStore: ObservableObject {
    @Published var movies: [Movie] = []
    @Published var tvSeries: [TVSeries] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    // Filter states
    @Published var selectedMediaType: MediaType = .movie
    @Published var selectedWatchStatus: WatchStatus?
    @Published var searchText = ""
    
    private let storageKey = "savedMovies"
    private let tvStorageKey = "savedTVSeries"
    
    init() {
        loadMovies()
        loadTVSeries()
    }
    
    // MARK: - Computed Properties
    
    var filteredMovies: [Movie] {
        var filtered = movies
        
        // Filter by watch status
        if let status = selectedWatchStatus {
            filtered = filtered.filter { $0.watchStatus == status }
        }
        
        // Filter by search text
        if !searchText.isEmpty {
            filtered = filtered.filter { movie in
                movie.title.localizedCaseInsensitiveContains(searchText) ||
                movie.overview.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        return filtered.sorted { $0.dateAdded > $1.dateAdded }
    }
    
    var filteredTVSeries: [TVSeries] {
        var filtered = tvSeries
        
        if let status = selectedWatchStatus {
            filtered = filtered.filter { $0.watchStatus == status }
        }
        
        if !searchText.isEmpty {
            filtered = filtered.filter { series in
                series.title.localizedCaseInsensitiveContains(searchText) ||
                series.overview.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        return filtered.sorted { $0.dateAdded > $1.dateAdded }
    }
    
    // MARK: - Movie Management
    
    func addMovie(_ movie: Movie) {
        movies.append(movie)
        saveMovies()
    }
    
    func updateMovie(_ movie: Movie) {
        if let index = movies.firstIndex(where: { $0.id == movie.id }) {
            movies[index] = movie
            saveMovies()
        }
    }
    
    func deleteMovie(_ movie: Movie) {
        movies.removeAll { $0.id == movie.id }
        saveMovies()
    }
    
    func updateWatchStatus(for movieId: String, status: WatchStatus) {
        if let index = movies.firstIndex(where: { $0.id == movieId }) {
            movies[index].watchStatus = status
            saveMovies()
        }
    }
    
    // MARK: - TV Series Management
    
    func addTVSeries(_ series: TVSeries) {
        tvSeries.append(series)
        saveTVSeries()
    }
    
    func updateTVSeries(_ series: TVSeries) {
        if let index = tvSeries.firstIndex(where: { $0.id == series.id }) {
            tvSeries[index] = series
            saveTVSeries()
        }
    }
    
    func deleteTVSeries(_ series: TVSeries) {
        tvSeries.removeAll { $0.id == series.id }
        saveTVSeries()
    }
    
    // MARK: - Persistence
    
    private func saveMovies() {
        if let encoded = try? JSONEncoder().encode(movies) {
            UserDefaults.standard.set(encoded, forKey: storageKey)
        }
    }
    
    private func loadMovies() {
        if let data = UserDefaults.standard.data(forKey: storageKey),
           let decoded = try? JSONDecoder().decode([Movie].self, from: data) {
            movies = decoded
        }
    }
    
    private func saveTVSeries() {
        if let encoded = try? JSONEncoder().encode(tvSeries) {
            UserDefaults.standard.set(encoded, forKey: tvStorageKey)
        }
    }
    
    private func loadTVSeries() {
        if let data = UserDefaults.standard.data(forKey: tvStorageKey),
           let decoded = try? JSONDecoder().decode([TVSeries].self, from: data) {
            tvSeries = decoded
        }
    }
    
    // MARK: - API Integration Placeholders
    
    func fetchFromStreamingServices() async {
        isLoading = true
        defer { isLoading = false }
        
        // TODO: Implement Netflix, Prime Video API integration
        // This will automatically fetch watched content
    }
    
    func analyzeURLForMovie(url: String) async throws -> Movie? {
        isLoading = true
        defer { isLoading = false }
        
        // TODO: Implement Instagram/TikTok URL analysis
        // Use API endpoints to extract video and identify movie
        return nil
    }
    
    func searchMovieByVoice(description: String) async throws -> [Movie] {
        isLoading = true
        defer { isLoading = false }
        
        // TODO: Implement NL search with 11Labs voice integration
        return []
    }
}
