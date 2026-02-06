import SwiftUI

struct URLAnalyzerView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var movieStore: MovieStore
    
    @State private var urlText = ""
    @State private var isAnalyzing = false
    @State private var analyzedMovie: Movie?
    @State private var errorMessage: String?
    @State private var showSuccess = false
    
    var body: some View {
        NavigationView {
            ZStack {
                Color.black.ignoresSafeArea()
                
                VStack(spacing: 24) {
                    // Header
                    VStack(spacing: 12) {
                        Image(systemName: "link.circle.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.blue)
                        
                        Text("Analyze Social Media URL")
                            .font(.system(size: 24, weight: .bold))
                            .foregroundColor(.white)
                        
                        Text("Paste a link from Instagram or TikTok to find the movie")
                            .font(.system(size: 15))
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 40)
                    }
                    .padding(.top, 40)
                    
                    // URL Input
                    VStack(alignment: .leading, spacing: 12) {
                        Text("URL")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.gray)
                        
                        HStack {
                            Image(systemName: detectPlatform(from: urlText))
                                .foregroundColor(.gray)
                            
                            TextField("https://instagram.com/... or https://tiktok.com/...", text: $urlText)
                                .textInputAutocapitalization(.never)
                                .autocorrectionDisabled()
                                .foregroundColor(.white)
                                .submitLabel(.done)
                                .onSubmit {
                                    analyzeURL()
                                }
                            
                            if !urlText.isEmpty {
                                Button(action: { urlText = "" }) {
                                    Image(systemName: "xmark.circle.fill")
                                        .foregroundColor(.gray)
                                }
                            }
                        }
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.white.opacity(0.1))
                        )
                    }
                    .padding(.horizontal, 24)
                    
                    // Platform Indicators
                    HStack(spacing: 20) {
                        PlatformIndicator(
                            icon: "camera.fill",
                            name: "Instagram",
                            isActive: urlText.contains("instagram")
                        )
                        
                        PlatformIndicator(
                            icon: "music.note",
                            name: "TikTok",
                            isActive: urlText.contains("tiktok")
                        )
                    }
                    .padding(.horizontal, 24)
                    
                    // Analyze Button
                    Button(action: analyzeURL) {
                        HStack(spacing: 12) {
                            if isAnalyzing {
                                ProgressView()
                                    .tint(.white)
                                Text("Analyzing...")
                            } else {
                                Image(systemName: "sparkles")
                                Text("Analyze URL")
                            }
                        }
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(
                            RoundedRectangle(cornerRadius: 14)
                                .fill(
                                    LinearGradient(
                                        colors: urlText.isEmpty ? [.gray] : [.blue, .purple],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                        )
                    }
                    .disabled(urlText.isEmpty || isAnalyzing)
                    .padding(.horizontal, 24)
                    
                    // Error Message
                    if let error = errorMessage {
                        Text(error)
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.red)
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color.red.opacity(0.1))
                            )
                            .padding(.horizontal, 24)
                    }
                    
                    // Result Preview
                    if let movie = analyzedMovie {
                        VStack(spacing: 16) {
                            Divider()
                                .background(Color.white.opacity(0.2))
                            
                            Text("Found Movie!")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.green)
                            
                            MovieResultCard(movie: movie)
                            
                            Button(action: {
                                movieStore.addMovie(movie)
                                showSuccess = true
                                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                                    dismiss()
                                }
                            }) {
                                HStack {
                                    Image(systemName: "plus.circle.fill")
                                    Text("Add to Library")
                                }
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .fill(Color.green)
                                )
                            }
                        }
                        .padding(.horizontal, 24)
                    }
                    
                    Spacer()
                    
                    // Info
                    VStack(spacing: 8) {
                        Text("How it works")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.gray)
                        
                        Text("We analyze the video content to identify the movie and add it to your library")
                            .font(.system(size: 11))
                            .foregroundColor(.gray.opacity(0.7))
                            .multilineTextAlignment(.center)
                    }
                    .padding(.horizontal, 40)
                    .padding(.bottom, 20)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") {
                        dismiss()
                    }
                }
            }
            .alert("Success!", isPresented: $showSuccess) {
                Button("OK") { }
            } message: {
                Text("Movie added to your library")
            }
        }
        .preferredColorScheme(.dark)
    }
    
    private func detectPlatform(from url: String) -> String {
        if url.contains("instagram") {
            return "camera.fill"
        } else if url.contains("tiktok") {
            return "music.note"
        } else {
            return "link"
        }
    }
    
    private func analyzeURL() {
        guard !urlText.isEmpty else { return }
        
        isAnalyzing = true
        errorMessage = nil
        analyzedMovie = nil
        
        Task {
            do {
                // TODO: Implement actual Instagram/TikTok API integration
                // For now, simulate the analysis
                try await Task.sleep(nanoseconds: 2_000_000_000) // 2 seconds
                
                // Simulated result
                let movie = Movie(
                    title: "The Shawshank Redemption",
                    posterURL: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
                    overview: "Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison.",
                    releaseDate: "1994-09-23",
                    rating: 8.7,
                    genres: ["Drama", "Crime"],
                    runtime: 142,
                    director: "Frank Darabont",
                    cast: ["Tim Robbins", "Morgan Freeman"],
                    watchStatus: .watchLater
                )
                
                await MainActor.run {
                    analyzedMovie = movie
                    isAnalyzing = false
                }
            } catch {
                await MainActor.run {
                    errorMessage = "Failed to analyze URL. Please try again."
                    isAnalyzing = false
                }
            }
        }
    }
}

struct PlatformIndicator: View {
    let icon: String
    let name: String
    let isActive: Bool
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 24))
                .foregroundColor(isActive ? .blue : .gray)
            
            Text(name)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(isActive ? .blue : .gray)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(isActive ? Color.blue.opacity(0.1) : Color.white.opacity(0.05))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(isActive ? Color.blue : Color.clear, lineWidth: 2)
                )
        )
    }
}

struct MovieResultCard: View {
    let movie: Movie
    
    var body: some View {
        HStack(spacing: 12) {
            // Poster
            if let posterURL = movie.posterURL, let url = URL(string: posterURL) {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    default:
                        Rectangle()
                            .fill(Color.white.opacity(0.1))
                    }
                }
                .frame(width: 60, height: 90)
                .cornerRadius(8)
            }
            
            // Info
            VStack(alignment: .leading, spacing: 6) {
                Text(movie.title)
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(.white)
                    .lineLimit(2)
                
                if let year = movie.releaseDate?.prefix(4) {
                    Text(String(year))
                        .font(.system(size: 14))
                        .foregroundColor(.gray)
                }
                
                if !movie.genres.isEmpty {
                    Text(movie.genres.prefix(2).joined(separator: ", "))
                        .font(.system(size: 13))
                        .foregroundColor(.gray)
                        .lineLimit(1)
                }
            }
            
            Spacer()
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.white.opacity(0.05))
        )
    }
}

#Preview {
    URLAnalyzerView()
        .environmentObject(MovieStore())
}
