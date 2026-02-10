import SwiftUI

struct TMDBSearchView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var movieStore: MovieStore
    
    @State private var searchText = ""
    @State private var searchResults: [Movie] = []
    @State private var isSearching = false
    @State private var errorMessage: String?
    
    var body: some View {
        NavigationView {
            ZStack {
                Color.black.ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Search Bar
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.gray)
                        
                        TextField("Search movies or TV series...", text: $searchText)
                            .textInputAutocapitalization(.never)
                            .foregroundColor(.white)
                            .submitLabel(.search)
                            .onSubmit {
                                performSearch()
                            }
                        
                        if !searchText.isEmpty {
                            Button(action: {
                                searchText = ""
                                searchResults = []
                                errorMessage = nil
                            }) {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundColor(.gray)
                            }
                        }
                    }
                    .padding()
                    .background(Color.white.opacity(0.1))
                    .cornerRadius(12)
                    .padding()
                    
                    // Results
                    if isSearching {
                        Spacer()
                        ProgressView()
                            .tint(.white)
                            .scaleEffect(1.5)
                        Spacer()
                    } else if let error = errorMessage {
                        Spacer()
                        VStack(spacing: 16) {
                            Image(systemName: "exclamationmark.triangle")
                                .font(.system(size: 50))
                                .foregroundColor(.red)
                            
                            Text(error)
                                .font(.system(size: 16))
                                .foregroundColor(.white)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 40)
                            
                            Button("Try Again") {
                                performSearch()
                            }
                            .foregroundColor(.blue)
                        }
                        Spacer()
                    } else if searchResults.isEmpty && !searchText.isEmpty {
                        Spacer()
                        VStack(spacing: 16) {
                            Image(systemName: "film.stack")
                                .font(.system(size: 50))
                                .foregroundColor(.gray)
                            
                            Text("No results found")
                                .font(.system(size: 16))
                                .foregroundColor(.white)
                        }
                        Spacer()
                    } else if !searchResults.isEmpty {
                        ScrollView {
                            LazyVStack(spacing: 12) {
                                ForEach(searchResults) { movie in
                                    TMDBSearchResultCard(movie: movie) {
                                        movieStore.addMovie(movie)
                                        dismiss()
                                    }
                                }
                            }
                            .padding()
                        }
                    } else {
                        Spacer()
                        VStack(spacing: 16) {
                            Image(systemName: "magnifyingglass")
                                .font(.system(size: 50))
                                .foregroundColor(.gray.opacity(0.5))
                            
                            Text("Search TMDB Database")
                                .font(.system(size: 20, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("Search for movies and TV series from The Movie Database")
                                .font(.system(size: 14))
                                .foregroundColor(.gray)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 40)
                        }
                        Spacer()
                    }
                }
            }
            .navigationTitle("Search TMDB")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
        .preferredColorScheme(.dark)
    }
    
    private func performSearch() {
        guard !searchText.isEmpty else { return }
        
        isSearching = true
        errorMessage = nil
        
        Task {
            do {
                let results = try await APIService.shared.searchMovie(query: searchText)
                
                await MainActor.run {
                    searchResults = results
                    isSearching = false
                }
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                    isSearching = false
                }
            }
        }
    }
}

struct TMDBSearchResultCard: View {
    let movie: Movie
    let onAdd: () -> Void
    
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
                            .overlay(
                                Image(systemName: "film")
                                    .foregroundColor(.gray)
                            )
                    }
                }
                .frame(width: 70, height: 105)
                .cornerRadius(8)
            }
            
            // Info
            VStack(alignment: .leading, spacing: 8) {
                Text(movie.title)
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(.white)
                    .lineLimit(2)
                
                if let year = movie.releaseDate?.prefix(4) {
                    Text(String(year))
                        .font(.system(size: 14))
                        .foregroundColor(.gray)
                }
                
                if let rating = movie.rating {
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .font(.system(size: 12))
                            .foregroundColor(.yellow)
                        Text(String(format: "%.1f", rating))
                            .font(.system(size: 14))
                            .foregroundColor(.gray)
                    }
                }
                
                Text(movie.overview)
                    .font(.system(size: 12))
                    .foregroundColor(.gray.opacity(0.8))
                    .lineLimit(2)
                
                Spacer()
            }
            
            Spacer()
            
            // Add Button
            Button(action: onAdd) {
                Image(systemName: "plus.circle.fill")
                    .font(.system(size: 30))
                    .foregroundColor(.green)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.white.opacity(0.05))
        )
    }
}

#Preview {
    TMDBSearchView()
        .environmentObject(MovieStore())
}
