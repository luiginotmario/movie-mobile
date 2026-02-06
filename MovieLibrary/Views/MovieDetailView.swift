import SwiftUI

struct MovieDetailView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var movieStore: MovieStore
    @State var movie: Movie
    @State private var showDeleteAlert = false
    @State private var rottenTomatoesScore: Int?
    @State private var isLoadingScore = false
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background
                Color.black.ignoresSafeArea()
                
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
                        // Backdrop Header
                        backdropHeader
                        
                        // Content
                        VStack(alignment: .leading, spacing: 24) {
                            // Title and Year
                            titleSection
                            
                            // Ratings
                            ratingsSection
                            
                            // Watch Status Picker
                            watchStatusSection
                            
                            // Metadata
                            metadataSection
                            
                            // Overview
                            overviewSection
                            
                            // Cast
                            if !movie.cast.isEmpty {
                                castSection
                            }
                            
                            // User Notes
                            notesSection
                            
                            // Delete Button
                            deleteButton
                        }
                        .padding(.horizontal, 20)
                        .padding(.bottom, 40)
                    }
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 28))
                            .foregroundColor(.white.opacity(0.8))
                            .symbolRenderingMode(.hierarchical)
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: saveChanges) {
                        Text("Save")
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundColor(.blue)
                    }
                }
            }
            .alert("Delete Movie", isPresented: $showDeleteAlert) {
                Button("Cancel", role: .cancel) { }
                Button("Delete", role: .destructive) {
                    movieStore.deleteMovie(movie)
                    dismiss()
                }
            } message: {
                Text("Are you sure you want to delete \(movie.title) from your library?")
            }
        }
        .preferredColorScheme(.dark)
        .onAppear {
            loadRottenTomatoesScore()
        }
    }
    
    // MARK: - View Components
    
    private var backdropHeader: some View {
        ZStack(alignment: .bottom) {
            // Backdrop Image
            if let backdropURL = movie.backdropURL ?? movie.posterURL,
               let url = URL(string: backdropURL) {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(height: 300)
                            .clipped()
                    default:
                        Rectangle()
                            .fill(
                                LinearGradient(
                                    colors: [Color.blue.opacity(0.3), Color.purple.opacity(0.3)],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .frame(height: 300)
                    }
                }
            } else {
                Rectangle()
                    .fill(
                        LinearGradient(
                            colors: [Color.blue.opacity(0.3), Color.purple.opacity(0.3)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(height: 300)
            }
            
            // Gradient Overlay
            LinearGradient(
                colors: [Color.clear, Color.black.opacity(0.8), Color.black],
                startPoint: .top,
                endPoint: .bottom
            )
            .frame(height: 300)
        }
        .frame(height: 300)
    }
    
    private var titleSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(movie.title)
                .font(.system(size: 32, weight: .bold))
                .foregroundColor(.white)
            
            HStack(spacing: 12) {
                if let year = movie.releaseDate?.prefix(4) {
                    Text(String(year))
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.gray)
                }
                
                if let runtime = movie.runtime {
                    Text("•")
                        .foregroundColor(.gray)
                    
                    Text("\(runtime) min")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.gray)
                }
                
                if let service = movie.sourceService {
                    Text("•")
                        .foregroundColor(.gray)
                    
                    HStack(spacing: 4) {
                        Image(systemName: service.icon)
                            .font(.system(size: 14))
                        Text(service.rawValue)
                            .font(.system(size: 16, weight: .medium))
                    }
                    .foregroundColor(service.color)
                }
            }
        }
    }
    
    private var ratingsSection: some View {
        HStack(spacing: 20) {
            // TMDB Rating
            if let rating = movie.rating {
                RatingCard(
                    icon: "star.fill",
                    score: String(format: "%.1f", rating),
                    label: "Rating",
                    color: .yellow
                )
            }
            
            // Rotten Tomatoes
            if let rtScore = rottenTomatoesScore ?? movie.rottenTomatoesScore {
                RatingCard(
                    icon: rtScore >= 60 ? "hand.thumbsup.fill" : "hand.thumbsdown.fill",
                    score: "\(rtScore)%",
                    label: "RT Score",
                    color: rtScore >= 60 ? .green : .red
                )
            } else if isLoadingScore {
                RatingCard(
                    icon: "ellipsis",
                    score: "...",
                    label: "RT Score",
                    color: .gray
                )
            }
            
            Spacer()
        }
    }
    
    private var watchStatusSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Watch Status")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.white)
            
            HStack(spacing: 12) {
                ForEach(WatchStatus.allCases, id: \.self) { status in
                    Button(action: {
                        withAnimation {
                            movie.watchStatus = status
                        }
                    }) {
                        VStack(spacing: 8) {
                            Image(systemName: status.icon)
                                .font(.system(size: 20, weight: .semibold))
                                .foregroundColor(movie.watchStatus == status ? .white : .gray)
                            
                            Text(status.rawValue)
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(movie.watchStatus == status ? .white : .gray)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(movie.watchStatus == status ? status.color.opacity(0.3) : Color.white.opacity(0.05))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(movie.watchStatus == status ? status.color : Color.clear, lineWidth: 2)
                                )
                        )
                    }
                }
            }
        }
    }
    
    private var metadataSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            if !movie.genres.isEmpty {
                HStack(spacing: 8) {
                    ForEach(movie.genres.prefix(3), id: \.self) { genre in
                        Text(genre)
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.white)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(
                                Capsule()
                                    .fill(Color.white.opacity(0.2))
                            )
                    }
                }
            }
            
            if let director = movie.director {
                HStack(spacing: 8) {
                    Text("Director:")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(.gray)
                    
                    Text(director)
                        .font(.system(size: 15, weight: .medium))
                        .foregroundColor(.white)
                }
            }
        }
    }
    
    private var overviewSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Overview")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.white)
            
            Text(movie.overview.isEmpty ? "No overview available." : movie.overview)
                .font(.system(size: 15, weight: .regular))
                .foregroundColor(.gray)
                .lineSpacing(4)
        }
    }
    
    private var castSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Cast")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.white)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(movie.cast.prefix(10), id: \.self) { actor in
                        Text(actor)
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.white)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(Color.white.opacity(0.1))
                            )
                    }
                }
            }
        }
    }
    
    private var notesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Personal Notes")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.white)
            
            TextEditor(text: Binding(
                get: { movie.notes ?? "" },
                set: { movie.notes = $0.isEmpty ? nil : $0 }
            ))
            .font(.system(size: 15))
            .foregroundColor(.white)
            .scrollContentBackground(.hidden)
            .background(Color.white.opacity(0.05))
            .cornerRadius(12)
            .frame(height: 100)
        }
    }
    
    private var deleteButton: some View {
        Button(action: { showDeleteAlert = true }) {
            HStack {
                Image(systemName: "trash")
                Text("Delete from Library")
            }
            .font(.system(size: 16, weight: .semibold))
            .foregroundColor(.red)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.red.opacity(0.1))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.red.opacity(0.3), lineWidth: 1)
                    )
            )
        }
        .padding(.top, 20)
    }
    
    // MARK: - Actions
    
    private func saveChanges() {
        movieStore.updateMovie(movie)
        dismiss()
    }
    
    private func loadRottenTomatoesScore() {
        guard movie.rottenTomatoesScore == nil else { return }
        
        isLoadingScore = true
        
        // TODO: Implement Rotten Tomatoes API or Exa search
        // For now, simulate loading
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            // Simulated score - replace with actual API call
            rottenTomatoesScore = Int.random(in: 40...95)
            isLoadingScore = false
        }
    }
}

struct RatingCard: View {
    let icon: String
    let score: String
    let label: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(color)
                
                Text(score)
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(.white)
            }
            
            Text(label)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.gray)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.white.opacity(0.05))
        )
    }
}

#Preview {
    MovieDetailView(movie: Movie(
        title: "Inception",
        posterURL: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
        overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        releaseDate: "2010-07-16",
        rating: 8.8,
        rottenTomatoesScore: 87,
        genres: ["Action", "Science Fiction", "Adventure"],
        runtime: 148,
        director: "Christopher Nolan",
        cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Ellen Page"],
        watchStatus: .watched
    ))
    .environmentObject(MovieStore())
}
