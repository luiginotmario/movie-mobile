import Foundation
import SwiftUI
import GoogleSignIn

/// Manages user authentication (Google, Apple, Guest mode)
class AuthManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var isGuestMode = false
    
    // Pending link token from social media deep link
    @Published var pendingLinkToken: String?
    
    static let shared = AuthManager()
    
    private init() {
        checkAuthState()
    }
    
    // MARK: - Auth State
    
    func checkAuthState() {
        // Check if user is already logged in (from UserDefaults or Keychain)
        if let userId = UserDefaults.standard.string(forKey: "user_id"),
           let email = UserDefaults.standard.string(forKey: "user_email") {
            currentUser = User(id: userId, email: email, name: nil)
            isAuthenticated = true
            isGuestMode = false
        } else if UserDefaults.standard.bool(forKey: "is_guest") {
            isGuestMode = true
            isAuthenticated = false
        }
    }
    
    // MARK: - Google Sign-In
    
    func signInWithGoogle() async throws {
        print("🔵 Google Sign-In initiated")
        
        // Get the root view controller
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let rootViewController = windowScene.windows.first?.rootViewController else {
            throw AuthError.googleSignInFailed
        }
        
        // Configure Google Sign-In
        let config = GIDConfiguration(clientID: Config.googleClientID)
        GIDSignIn.sharedInstance.configuration = config
        
        // Present Google Sign-In UI
        let result = try await GIDSignIn.sharedInstance.signIn(withPresenting: rootViewController)
        
        guard let idToken = result.user.idToken?.tokenString else {
            throw AuthError.googleSignInFailed
        }
        
        // Get user info
        let email = result.user.profile?.email ?? ""
        let name = result.user.profile?.name ?? ""
        
        print("✅ Google Sign-In successful: \(email)")
        
        // Send ID token to backend for verification
        try await verifyGoogleToken(idToken: idToken, email: email, name: name)
        
        // Link account if there's a pending token
        if let token = pendingLinkToken {
            try await linkAccountToBackend(userId: currentUser!.id, token: token)
            pendingLinkToken = nil
        }
    }
    
    private func verifyGoogleToken(idToken: String, email: String, name: String) async throws {
        // TODO: Send to your backend for verification
        // For now, create local user
        
        let userId = UUID().uuidString
        currentUser = User(id: userId, email: email, name: name)
        isAuthenticated = true
        isGuestMode = false
        
        // Save to UserDefaults
        UserDefaults.standard.set(userId, forKey: "user_id")
        UserDefaults.standard.set(email, forKey: "user_email")
        UserDefaults.standard.removeObject(forKey: "is_guest")
        
        print("✅ User authenticated: \(email)")
    }
    
    // MARK: - Guest Mode
    
    func continueAsGuest() {
        isGuestMode = true
        isAuthenticated = false
        UserDefaults.standard.set(true, forKey: "is_guest")
        print("👤 Continuing as guest")
    }
    
    // MARK: - Account Linking
    
    func linkSocialMediaAccount(token: String) async throws {
        guard let user = currentUser else {
            // Save token for after authentication
            pendingLinkToken = token
            throw AuthError.notAuthenticated
        }
        
        // Call backend to link account
        try await linkAccountToBackend(userId: user.id, token: token)
        pendingLinkToken = nil
    }
    
    private func linkAccountToBackend(userId: String, token: String) async throws {
        // TODO: Call backend /api/link-account endpoint
        let urlString = "YOUR_BACKEND_URL/api/link-account"
        guard let url = URL(string: urlString) else {
            throw AuthError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["user_id": userId, "link_token": token]
        request.httpBody = try JSONEncoder().encode(body)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw AuthError.linkingFailed
        }
        
        print("✅ Account linked successfully")
    }
    
    // MARK: - Sign Out
    
    func signOut() {
        currentUser = nil
        isAuthenticated = false
        isGuestMode = false
        pendingLinkToken = nil
        
        // Clear stored credentials
        UserDefaults.standard.removeObject(forKey: "user_id")
        UserDefaults.standard.removeObject(forKey: "user_email")
        UserDefaults.standard.removeObject(forKey: "is_guest")
        
        print("👋 Signed out")
    }
}

// MARK: - Models

struct User: Codable {
    let id: String
    let email: String
    let name: String?
}

enum AuthError: LocalizedError {
    case notImplemented
    case notAuthenticated
    case invalidURL
    case linkingFailed
    case googleSignInFailed
    
    var errorDescription: String? {
        switch self {
        case .notImplemented:
            return "This feature is not yet implemented"
        case .notAuthenticated:
            return "User is not authenticated"
        case .invalidURL:
            return "Invalid backend URL"
        case .linkingFailed:
            return "Failed to link social media account"
        case .googleSignInFailed:
            return "Google Sign-In failed"
        }
    }
}
