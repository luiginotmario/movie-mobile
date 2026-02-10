import Foundation

class APIService {
    static let shared = APIService()
    
    // TMDB API Configuration
    private let tmdbAPIKey: String
    private let tmdbBaseURL = "https://api.themoviedb.org/3"
    private let imageBaseURL = "https://image.tmdb.org/t/p"
    
    private init() {
        // Load API key from Config
        self.tmdbAPIKey = Config.tmdbAPIKey
    }
    
    // MARK: - TMDB API Methods
    
    /// Search for movies by query string
    func searchMovie(query: String) async throws -> [Movie] {
        let encodedQuery = query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        let urlString = "\(tmdbBaseURL)/search/movie?api_key=\(tmdbAPIKey)&query=\(encodedQuery)"
        
        guard let url = URL(string: urlString) else {
            throw APIError.invalidURL
        }
        
        let (data, _) = try await URLSession.shared.data(from: url)
        let response = try JSONDecoder().decode(TMDBSearchResponse.self, from: data)
        
        return response.results.map { tmdbMovie in
            Movie(
                id: String(tmdbMovie.id),
                title: tmdbMovie.title,
                posterURL: tmdbMovie.posterPath.map { "\(imageBaseURL)/w500\($0)" },
                backdropURL: tmdbMovie.backdropPath.map { "\(imageBaseURL)/w1280\($0)" },
                overview: tmdbMovie.overview,
                releaseDate: tmdbMovie.releaseDate,
                rating: tmdbMovie.voteAverage,
                genres: [],
                watchStatus: .watchLater
            )
        }
    }
    
    /// Get detailed information about a specific movie
    func getMovieDetails(movieId: String) async throws -> Movie {
        let urlString = "\(tmdbBaseURL)/movie/\(movieId)?api_key=\(tmdbAPIKey)&append_to_response=credits,videos"
        
        guard let url = URL(string: urlString) else {
            throw APIError.invalidURL
        }
        
        let (data, _) = try await URLSession.shared.data(from: url)
        let details = try JSONDecoder().decode(TMDBMovieDetails.self, from: data)
        
        return Movie(
            id: String(details.id),
            title: details.title,
            posterURL: details.posterPath.map { "\(imageBaseURL)/w500\($0)" },
            backdropURL: details.backdropPath.map { "\(imageBaseURL)/w1280\($0)" },
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
    
    /// Search for TV series by query string
    func searchTVSeries(query: String) async throws -> [TVSeries] {
        let encodedQuery = query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        let urlString = "\(tmdbBaseURL)/search/tv?api_key=\(tmdbAPIKey)&query=\(encodedQuery)"
        
        guard let url = URL(string: urlString) else {
            throw APIError.invalidURL
        }
        
        let (data, _) = try await URLSession.shared.data(from: url)
        let response = try JSONDecoder().decode(TMDBTVSearchResponse.self, from: data)
        
        return response.results.map { tmdbTV in
            TVSeries(
                id: String(tmdbTV.id),
                title: tmdbTV.name,
                posterURL: tmdbTV.posterPath.map { "\(imageBaseURL)/w500\($0)" },
                overview: tmdbTV.overview,
                numberOfSeasons: tmdbTV.numberOfSeasons ?? 0,
                numberOfEpisodes: tmdbTV.numberOfEpisodes ?? 0,
                watchStatus: .watchLater,
                dateAdded: Date()
            )
        }
    }
    
    /// Get video trailers for a movie
    func getMovieVideos(movieId: String) async throws -> [TMDBVideo] {
        let urlString = "\(tmdbBaseURL)/movie/\(movieId)/videos?api_key=\(tmdbAPIKey)"
        
        guard let url = URL(string: urlString) else {
            throw APIError.invalidURL
        }
        
        let (data, _) = try await URLSession.shared.data(from: url)
        let response = try JSONDecoder().decode(TMDBVideosResponse.self, from: data)
        
        return response.results
    }
}

// MARK: - API Models

// Movie Search Response
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

// Movie Details Response
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

// TV Series Search Response
struct TMDBTVSearchResponse: Codable {
    let results: [TMDBTVSeries]
}

struct TMDBTVSeries: Codable {
    let id: Int
    let name: String
    let overview: String
    let posterPath: String?
    let numberOfSeasons: Int?
    let numberOfEpisodes: Int?
    
    enum CodingKeys: String, CodingKey {
        case id, name, overview
        case posterPath = "poster_path"
        case numberOfSeasons = "number_of_seasons"
        case numberOfEpisodes = "number_of_episodes"
    }
}

// Shared Models
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

// Videos/Trailers Response
struct TMDBVideosResponse: Codable {
    let results: [TMDBVideo]
}

struct TMDBVideo: Codable {
    let key: String
    let name: String
    let site: String
    let type: String
    let official: Bool?
    
    var youtubeURL: String? {
        guard site == "YouTube" else { return nil }
        return "https://www.youtube.com/watch?v=\(key)"
    }
}

// API Errors
enum APIError: Error, LocalizedError {
    case invalidURL
    case networkError
    case decodingError
    case unauthorized
    case notFound
    case serverError
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .networkError:
            return "Network error occurred"
        case .decodingError:
            return "Failed to decode response"
        case .unauthorized:
            return "Unauthorized - Check your API key"
        case .notFound:
            return "Resource not found"
        case .serverError:
            return "Server error occurred"
        }
    }
}
