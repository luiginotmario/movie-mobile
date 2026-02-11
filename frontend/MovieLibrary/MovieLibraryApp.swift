import SwiftUI
import UserNotifications
import GoogleSignIn

@main
struct MovieLibraryApp: App {
    @StateObject private var movieStore = MovieStore()
    @StateObject private var notificationManager = NotificationManager()
    
    init() {
        setupAppearance()
    }
    
    var body: some Scene {
        WindowGroup {
            AuthView()
                .environmentObject(movieStore)
                .environmentObject(notificationManager)
                .onAppear {
                    notificationManager.requestAuthorization()
                }
                .onOpenURL { url in
                    handleDeepLink(url)
                }
        }
    }
    
    private func handleDeepLink(_ url: URL) {
        // Handle Google Sign-In callback
        if GIDSignIn.sharedInstance.handle(url) {
            return
        }
        
        // Handle movielibrary:// deep links
        guard url.scheme == "movielibrary" else { return }
        
        // Handle account linking: movielibrary://link?token=...
        if url.host == "link",
           let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
           let token = components.queryItems?.first(where: { $0.name == "token" })?.value {
            
            Task {
                do {
                    try await AuthManager.shared.linkSocialMediaAccount(token: token)
                    print("✅ Account linked via deep link")
                } catch AuthError.notAuthenticated {
                    // User not logged in - save token for after auth
                    print("💾 Token saved, will link after authentication")
                } catch {
                    print("❌ Failed to link account: \(error.localizedDescription)")
                }
            }
        }
    }
    
    private func setupAppearance() {
        // Configure navigation bar appearance for liquid glass effect
        let appearance = UINavigationBarAppearance()
        appearance.configureWithTransparentBackground()
        appearance.backgroundColor = UIColor.systemBackground.withAlphaComponent(0.8)
        
        // Apply blur effect
        let blurEffect = UIBlurEffect(style: .systemMaterial)
        appearance.backgroundEffect = blurEffect
        
        UINavigationBar.appearance().standardAppearance = appearance
        UINavigationBar.appearance().scrollEdgeAppearance = appearance
        UINavigationBar.appearance().compactAppearance = appearance
    }
}
