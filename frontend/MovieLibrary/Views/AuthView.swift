import SwiftUI

struct AuthView: View {
    @StateObject private var authManager = AuthManager.shared
    @State private var showAlert = false
    @State private var alertMessage = ""
    
    var body: some View {
        if authManager.isAuthenticated || authManager.isGuestMode {
            ContentView()
        } else {
            authScreen
        }
    }
    
    var authScreen: some View {
        ZStack {
            // Background with movie poster grid
            Image("Container")
                .resizable()
                .scaledToFill()
                .ignoresSafeArea()
            
            // Dark overlay gradient - uses semantic colors
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(UIColor.systemBackground).opacity(0.7),
                    Color(UIColor.systemBackground).opacity(0.85)
                ]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            VStack(spacing: 0) {
                Spacer()
                    .frame(height: 120)
                
                // Logo container with rounded corners
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color(red: 0.50, green: 0.23, blue: 0.27).opacity(0.5))
                        .frame(width: 66, height: 66)
                    
                    Image("Logo")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 50, height: 50)
                        .accessibilityLabel("MovieFriend logo")
                }
                .padding(.bottom, 24)
                
                // App title - Dynamic Type support
                Text("MovieFriend")
                    .font(.system(.title, design: .default, weight: .medium))
                    .foregroundColor(Color(UIColor.label))
                    .padding(.bottom, 8)
                
                // Subtitle - Dynamic Type support
                Text("Your entertainment library for free")
                    .font(.system(.body, design: .default, weight: .medium))
                    .foregroundColor(Color(UIColor.secondaryLabel))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
                    .padding(.bottom, 64)
                
                // Continue with Google button
                Button(action: {
                    Task {
                        do {
                            try await authManager.signInWithGoogle()
                        } catch {
                            alertMessage = error.localizedDescription
                            showAlert = true
                        }
                    }
                }) {
                    HStack(spacing: 12) {
                        // Google icon placeholder
                        Circle()
                            .fill(Color.white)
                            .frame(width: 20, height: 20)
                            .overlay(
                                Text("G")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(.blue)
                            )
                        
                        Text("Continue with Google")
                            .font(.body.weight(.medium))
                    }
                    .foregroundColor(Color(UIColor.label))
                    .frame(maxWidth: .infinity)
                    .frame(height: 44)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color(UIColor.systemBackground))
                            .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)
                    )
                }
                .accessibilityLabel("Continue with Google")
                .accessibilityHint("Sign in using your Google account")
                .padding(.horizontal, 16)
                .padding(.bottom, 64)
                
                // Skip for now button
                Button(action: {
                    authManager.continueAsGuest()
                }) {
                    Text("Skip for now")
                        .font(.body.weight(.medium))
                        .foregroundColor(Color(UIColor.secondaryLabel))
                        .frame(height: 44)
                        .padding(.horizontal, 24)
                }
                .accessibilityLabel("Skip for now")
                .accessibilityHint("Continue using the app without signing in")
                
                Spacer()
                    .frame(height: 96)
            }
        }
        .alert("Authentication Error", isPresented: $showAlert) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(alertMessage)
        }
        .preferredColorScheme(.dark)
    }
}

struct AuthView_Previews: PreviewProvider {
    static var previews: some View {
        AuthView()
    }
}
