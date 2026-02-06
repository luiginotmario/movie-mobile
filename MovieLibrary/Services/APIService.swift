import Foundation

class APIService {
    static let shared = APIService()
    
    // API Keys - Replace with actual keys
    private let tmdbAPIKey = "YOUR_TMDB_API_KEY"
    private let elevenLabsAPIKey = "YOUR_ELEVENLABS_API_KEY"
    
    private init() {}
    
    // MARK: - TMDB API
    
    func searchMovie(query: String) async throws -> [Movie] {
        let encodedQuery = query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        let urlString = "https://api.themoviedb.org/3/search/movie?api_key=\(tmdbAPIKey)&query=\(encodedQuery)"
        
        guard let url = URL(string: urlString) else {
            throw APIError.invalidURL
        }
        
        let (data, _) = try await URLSession.shared.data(from: url)
        let response = try JSONDecoder().decode(TMDBSearchResponse.self, from: data)
        
        return response.results.map { tmdbMovie in
            Movie(
                id: String(tmdbMovie.id),
                title: tmdbMovie.title,
                posterURL: tmdbMovie.posterPath.map { "https://image.tmdb.org/t/p/w500\($0)" },
                backdropURL: tmdbMovie.backdropPath.map { "https://image.tmdb.org/t/p/w1280\($0)" },
                overview: tmdbMovie.overview,
                releaseDate: tmdbMovie.releaseDate,
                rating: tmdbMovie.voteAverage,
                genres: [],
                watchStatus: .watchLater
            )
        }
    }
    
    func getMovieDetails(movieId: String) async throws -> Movie {
        let urlString = "https://api.themoviedb.org/3/movie/\(movieId)?api_key=\(tmdbAPIKey)&append_to_response=credits"
        
        guard let url = URL(string: urlString) else {
            throw APIError.invalidURL
        }
        
        let (data, _) = try await URLSession.shared.data(from: url)
        let details = try JSONDecoder().decode(TMDBMovieDetails.self, from: data)
        
        return Movie(
            id: String(details.id),
            title: details.title,
            posterURL: details.posterPath.map { "https://image.tmdb.org/t/p/w500\($0)" },
            backdropURL: details.backdropPath.map { "https://image.tmdb.org/t/p/w1280\($0)" },
            overview: details.overview,
            releaseDate: details.releaseDate,
            rating: details.voteAverage,
            genres: details.genres.map { $0.name },
            runtime: details.runtime,
            director: details.credits?.crew.first(where: { $0.job == "Director" })?.name,
            cast: details.credits?.cast.prefix(10).map { $0.name } ?? [],
            watchStatus: .watchLater
        )
    }
    
    // MARK: - Rotten Tomatoes (via Exa or scraping)
    
    func getRottenTomatoesScore(movieTitle: String, year: String?) async throws -> Int? {
        // TODO: Implement Exa search or Rotten Tomatoes API
        // For now, return nil to trigger fallback
        return nil
    }
    
    // MARK: - 11Labs Voice AI
    
    func transcribeAudio(audioData: Data) async throws -> String {
        // TODO: Implement 11Labs transcription
        // This would convert audio to text for voice search
        return ""
    }
    
    func searchMovieByDescription(description: String) async throws -> [Movie] {
        // Use NL processing to search TMDB
        // Extract key terms and search
        return try await searchMovie(query: description)
    }
    
    // MARK: - Social Media Analysis
    
    func analyzeInstagramURL(url: String) async throws -> Movie? {
        // TODO: Implement Instagram API integration
        // 1. Extract video from Instagram post
        // 2. Analyze video frames/audio
        // 3. Match to movie database
        
        // For now, return a placeholder
        throw APIError.notImplemented
    }
    
    func analyzeTikTokURL(url: String) async throws -> Movie? {
        // TODO: Implement TikTok API integration
        // 1. Extract video from TikTok post
        // 2. Analyze video content
        // 3. Match to movie database
        
        throw APIError.notImplemented
    }
    
    // MARK: - Streaming Services
    
    func fetchNetflixWatchHistory() async throws -> [Movie] {
        // TODO: Implement Netflix API integration
        // Note: Netflix doesn't have a public API, may need to use unofficial methods
        throw APIError.notImplemented
    }
    
    func fetchPrimeVideoWatchHistory() async throws -> [Movie] {
        // TODO: Implement Prime Video API integration
        throw APIError.notImplemented
    }
    
    func fetchDisneyPlusWatchHistory() async throws -> [Movie] {
        // TODO: Implement Disney+ API integration
        throw APIError.notImplemented
    }
    
    func fetchHBOMaxWatchHistory() async throws -> [Movie] {
        // TODO: Implement HBO Max API integration
        throw APIError.notImplemented
    }
    
    func fetchAppleTVWatchHistory() async throws -> [Movie] {
        // TODO: Implement Apple TV API integration
        throw APIError.notImplemented
    }
    
    func fetchHuluWatchHistory() async throws -> [Movie] {
        // TODO: Implement Hulu API integration
        throw APIError.notImplemented
    }
}

// MARK: - API Models

struct TMDBSearchResponse: Codable {
    let results: [TMDBMovie]
}

struct TMDBMovie: Codable {
    let id: Int
    let title: String
    let overview: String
    let posterPath: String?
    let backdropPath: String?
    let releaseDate: String?
    let voteAverage: Double?
    
    enum CodingKeys: String, CodingKey {
        case id, title, overview
        case posterPath = "poster_path"
        case backdropPath = "backdrop_path"
        case releaseDate = "release_date"
        case voteAverage = "vote_average"
    }
}

struct TMDBMovieDetails: Codable {
    let id: Int
    let title: String
    let overview: String
    let posterPath: String?
    let backdropPath: String?
    let releaseDate: String?
    let voteAverage: Double?
    let runtime: Int?
    let genres: [TMDBGenre]
    let credits: TMDBCredits?
    
    enum CodingKeys: String, CodingKey {
        case id, title, overview, runtime, genres, credits
        case posterPath = "poster_path"
        case backdropPath = "backdrop_path"
        case releaseDate = "release_date"
        case voteAverage = "vote_average"
    }
}

struct TMDBGenre: Codable {
    let id: Int
    let name: String
}

struct TMDBCredits: Codable {
    let cast: [TMDBCast]
    let crew: [TMDBCrew]
}

struct TMDBCast: Codable {
    let name: String
    let character: String
}

struct TMDBCrew: Codable {
    let name: String
    let job: String
}

enum APIError: Error, LocalizedError {
    case invalidURL
    case notImplemented
    case networkError
    case decodingError
    case unauthorized
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .notImplemented:
            return "This feature is not yet implemented"
        case .networkError:
            return "Network error occurred"
        case .decodingError:
            return "Failed to decode response"
        case .unauthorized:
            return "Unauthorized access"
        }
    }
}
