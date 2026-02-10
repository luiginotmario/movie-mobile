import Foundation

/// Configuration file template for API keys and environment variables
/// 1. Copy this file to Config.swift
/// 2. Replace the placeholder values with your actual API keys
/// 3. Never commit Config.swift to version control (it's in .gitignore)
struct Config {
    // TMDB API Configuration
    // Get your API key from: https://www.themoviedb.org/settings/api
    static let tmdbAPIKey: String = {
        if let envKey = ProcessInfo.processInfo.environment["TMDB_API_KEY"] {
            return envKey
        }
        return "YOUR_TMDB_API_KEY_HERE"
    }()
    
    // Supabase Configuration
    // Get your credentials from: https://app.supabase.com/project/_/settings/api
    static let supabaseURL: String = {
        if let envURL = ProcessInfo.processInfo.environment["SUPABASE_URL"] {
            return envURL
        }
        return "https://your-project.supabase.co"
    }()
    
    static let supabaseAnonKey: String = {
        if let envKey = ProcessInfo.processInfo.environment["SUPABASE_ANON_KEY"] {
            return envKey
        }
        return "YOUR_SUPABASE_ANON_KEY_HERE"
    }()
}
