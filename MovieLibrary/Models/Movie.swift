import Foundation
import SwiftUI

struct Movie: Identifiable, Codable, Equatable {
    let id: String
    var title: String
    var posterURL: String?
    var backdropURL: String?
    var overview: String
    var releaseDate: String?
    var rating: Double?
    var rottenTomatoesScore: Int?
    var genres: [String]
    var runtime: Int? // in minutes
    var director: String?
    var cast: [String]
    
    // User-specific data
    var watchStatus: WatchStatus
    var dateAdded: Date
    var userRating: Double?
    var notes: String?
    var sourceService: StreamingService?
    
    init(
        id: String = UUID().uuidString,
        title: String,
        posterURL: String? = nil,
        backdropURL: String? = nil,
        overview: String = "",
        releaseDate: String? = nil,
        rating: Double? = nil,
        rottenTomatoesScore: Int? = nil,
        genres: [String] = [],
        runtime: Int? = nil,
        director: String? = nil,
        cast: [String] = [],
        watchStatus: WatchStatus = .watchLater,
        dateAdded: Date = Date(),
        userRating: Double? = nil,
        notes: String? = nil,
        sourceService: StreamingService? = nil
    ) {
        self.id = id
        self.title = title
        self.posterURL = posterURL
        self.backdropURL = backdropURL
        self.overview = overview
        self.releaseDate = releaseDate
        self.rating = rating
        self.rottenTomatoesScore = rottenTomatoesScore
        self.genres = genres
        self.runtime = runtime
        self.director = director
        self.cast = cast
        self.watchStatus = watchStatus
        self.dateAdded = dateAdded
        self.userRating = userRating
        self.notes = notes
        self.sourceService = sourceService
    }
}

enum WatchStatus: String, Codable, CaseIterable {
    case watchLater = "Watch Later"
    case watching = "Watching"
    case watched = "Watched"
    
    var icon: String {
        switch self {
        case .watchLater: return "bookmark"
        case .watching: return "play.circle"
        case .watched: return "checkmark.circle"
        }
    }
    
    var color: Color {
        switch self {
        case .watchLater: return .blue
        case .watching: return .orange
        case .watched: return .green
        }
    }
}

enum StreamingService: String, Codable, CaseIterable {
    case netflix = "Netflix"
    case primeVideo = "Prime Video"
    case disneyPlus = "Disney+"
    case hboMax = "HBO Max"
    case appleTV = "Apple TV+"
    case hulu = "Hulu"
    case other = "Other"
    
    var icon: String {
        switch self {
        case .netflix: return "n.square.fill"
        case .primeVideo: return "p.square.fill"
        case .disneyPlus: return "d.square.fill"
        case .hboMax: return "h.square.fill"
        case .appleTV: return "tv.fill"
        case .hulu: return "h.circle.fill"
        case .other: return "film.fill"
        }
    }
    
    var color: Color {
        switch self {
        case .netflix: return .red
        case .primeVideo: return .blue
        case .disneyPlus: return .blue
        case .hboMax: return .purple
        case .appleTV: return .gray
        case .hulu: return .green
        case .other: return .gray
        }
    }
}

enum MediaType: String, Codable, CaseIterable {
    case movie = "Movie"
    case tvSeries = "TV Series"
    
    var icon: String {
        switch self {
        case .movie: return "film"
        case .tvSeries: return "tv"
        }
    }
}

// Extended Movie model for TV Series
struct TVSeries: Identifiable, Codable {
    let id: String
    var title: String
    var posterURL: String?
    var overview: String
    var numberOfSeasons: Int
    var numberOfEpisodes: Int
    var watchStatus: WatchStatus
    var currentSeason: Int?
    var currentEpisode: Int?
    var dateAdded: Date
    var sourceService: StreamingService?
}
