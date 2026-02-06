import Foundation

@MainActor
class StreamingServiceManager: ObservableObject {
    @Published var isConnected: [StreamingService: Bool] = [:]
    @Published var isSyncing = false
    @Published var lastSyncDate: Date?
    
    private let apiService = APIService.shared
    
    init() {
        loadConnectionStatus()
    }
    
    // MARK: - Connection Management
    
    func connectService(_ service: StreamingService) async throws {
        // TODO: Implement OAuth flow for each service
        // This would open a web view for user authentication
        
        isConnected[service] = true
        saveConnectionStatus()
    }
    
    func disconnectService(_ service: StreamingService) {
        isConnected[service] = false
        saveConnectionStatus()
    }
    
    func isServiceConnected(_ service: StreamingService) -> Bool {
        return isConnected[service] ?? false
    }
    
    // MARK: - Sync Watch History
    
    func syncAllServices() async throws -> [Movie] {
        isSyncing = true
        defer { isSyncing = false }
        
        var allMovies: [Movie] = []
        
        for service in StreamingService.allCases {
            guard isServiceConnected(service) else { continue }
            
            do {
                let movies = try await syncService(service)
                allMovies.append(contentsOf: movies)
            } catch {
                print("Failed to sync \(service.rawValue): \(error)")
            }
        }
        
        lastSyncDate = Date()
        saveLastSyncDate()
        
        return allMovies
    }
    
    func syncService(_ service: StreamingService) async throws -> [Movie] {
        switch service {
        case .netflix:
            return try await apiService.fetchNetflixWatchHistory()
        case .primeVideo:
            return try await apiService.fetchPrimeVideoWatchHistory()
        case .disneyPlus:
            return try await apiService.fetchDisneyPlusWatchHistory()
        case .hboMax:
            return try await apiService.fetchHBOMaxWatchHistory()
        case .appleTV:
            return try await apiService.fetchAppleTVWatchHistory()
        case .hulu:
            return try await apiService.fetchHuluWatchHistory()
        case .other:
            return []
        }
    }
    
    // MARK: - Persistence
    
    private func saveConnectionStatus() {
        let dict = isConnected.reduce(into: [String: Bool]()) { result, pair in
            result[pair.key.rawValue] = pair.value
        }
        UserDefaults.standard.set(dict, forKey: "streamingServiceConnections")
    }
    
    private func loadConnectionStatus() {
        if let dict = UserDefaults.standard.dictionary(forKey: "streamingServiceConnections") as? [String: Bool] {
            isConnected = dict.reduce(into: [StreamingService: Bool]()) { result, pair in
                if let service = StreamingService(rawValue: pair.key) {
                    result[service] = pair.value
                }
            }
        }
    }
    
    private func saveLastSyncDate() {
        UserDefaults.standard.set(lastSyncDate, forKey: "lastStreamingSyncDate")
    }
    
    private func loadLastSyncDate() {
        lastSyncDate = UserDefaults.standard.object(forKey: "lastStreamingSyncDate") as? Date
    }
}
