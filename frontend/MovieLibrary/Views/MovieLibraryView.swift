import SwiftUI

struct MovieLibraryView: View {
    @EnvironmentObject var movieStore: MovieStore
    @State private var selectedMovie: Movie?
    @State private var showMovieDetail = false
    
    // Grid Columns
    private let columns = [
        GridItem(.adaptive(minimum: 150), spacing: 16)
    ]
    
    var body: some View {
        ScrollView {
            LazyVGrid(columns: columns, spacing: 20) {
                ForEach(movieStore.filteredMovies) { movie in
                    MoviePosterCard(movie: movie)
                        .onTapGesture {
                            selectedMovie = movie
                            showMovieDetail = true
                        }
                }
            }
            .padding()
        }
        .sheet(item: $selectedMovie) { movie in
            MovieDetailView(movie: movie)
        }
    }
}

struct MoviePosterCard: View {
    let movie: Movie
    @State private var imageLoaded = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Poster Image
            ZStack(alignment: .topTrailing) {
                if let posterURL = movie.posterURL, let url = URL(string: posterURL) {
                    AsyncImage(url: url) { phase in
                        switch phase {
                        case .empty:
                            Rectangle()
                                .fill(Color.white.opacity(0.1))
                                .overlay(
                                    ProgressView()
                                        .tint(.white)
                                )
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(2/3, contentMode: .fill)
                                .transition(.opacity)
                        case .failure:
                            Rectangle()
                                .fill(Color.white.opacity(0.1))
                                .overlay(
                                    Image(systemName: "film")
                                        .font(.system(size: 30))
                                        .foregroundColor(.gray)
                                )
                        @unknown default:
                            EmptyView()
                        }
                    }
                } else {
                    // Placeholder
                    Rectangle()
                        .fill(
                            LinearGradient(
                                colors: [Color.blue.opacity(0.3), Color.purple.opacity(0.3)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .overlay(
                            VStack {
                                Image(systemName: "film")
                                    .font(.system(size: 30))
                                    .foregroundColor(.white.opacity(0.6))
                                
                                Text(movie.title)
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(.white.opacity(0.8))
                                    .multilineTextAlignment(.center)
                                    .lineLimit(3)
                                    .padding(.horizontal, 8)
                            }
                        )
                        .aspectRatio(2/3, contentMode: .fill)
                }
                
                // Status Badge
                Image(systemName: movie.watchStatus.icon)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.white)
                    .padding(6)
                    .background(
                        Circle()
                            .fill(movie.watchStatus.color)
                            .shadow(color: .black.opacity(0.3), radius: 4, x: 0, y: 2)
                    )
                    .padding(8)
            }
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.4), radius: 8, x: 0, y: 4)
            
            // Movie Title
            Text(movie.title)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(.white)
                .lineLimit(2)
                .multilineTextAlignment(.leading)
            
            // Rating
            if let rating = movie.rating {
                HStack(spacing: 4) {
                    Image(systemName: "star.fill")
                        .font(.system(size: 10))
                        .foregroundColor(.yellow)
                    
                    Text(String(format: "%.1f", rating))
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.gray)
                }
            }
        }
    }
}

struct EmptyLibraryView: View {
    let mediaType: MediaType
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: mediaType == .movie ? "film.stack" : "tv.and.mediabox")
                .font(.system(size: 60))
                .foregroundColor(.gray.opacity(0.5))
            
            Text("No \(mediaType.rawValue)s Yet")
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(.white)
            
            Text("Add your first \(mediaType.rawValue.lowercased()) to start building your library")
                .font(.system(size: 16))
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
        }
    }
}

struct TVSeriesLibraryView: View {
    @EnvironmentObject var movieStore: MovieStore
    
    // Grid Columns
    private let columns = [
        GridItem(.adaptive(minimum: 150), spacing: 16)
    ]
    
    var body: some View {
        ScrollView {
            LazyVGrid(columns: columns, spacing: 20) {
                ForEach(movieStore.filteredTVSeries) { series in
                    TVSeriesPosterCard(series: series)
                }
            }
            .padding()
        }
    }
}

struct TVSeriesPosterCard: View {
    let series: TVSeries
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ZStack(alignment: .topTrailing) {
                if let posterURL = series.posterURL, let url = URL(string: posterURL) {
                    AsyncImage(url: url) { phase in
                        switch phase {
                        case .empty:
                            Rectangle()
                                .fill(Color.white.opacity(0.1))
                                .overlay(ProgressView().tint(.white))
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(2/3, contentMode: .fill)
                        case .failure:
                            Rectangle()
                                .fill(Color.white.opacity(0.1))
                                .overlay(
                                    Image(systemName: "tv")
                                        .font(.system(size: 30))
                                        .foregroundColor(.gray)
                                )
                        @unknown default:
                            EmptyView()
                        }
                    }
                } else {
                    Rectangle()
                        .fill(
                            LinearGradient(
                                colors: [Color.green.opacity(0.3), Color.blue.opacity(0.3)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .overlay(
                            VStack {
                                Image(systemName: "tv")
                                    .font(.system(size: 30))
                                    .foregroundColor(.white.opacity(0.6))
                                
                                Text(series.title)
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(.white.opacity(0.8))
                                    .multilineTextAlignment(.center)
                                    .lineLimit(3)
                                    .padding(.horizontal, 8)
                            }
                        )
                        .aspectRatio(2/3, contentMode: .fill)
                }
                
                Image(systemName: series.watchStatus.icon)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.white)
                    .padding(6)
                    .background(
                        Circle()
                            .fill(series.watchStatus.color)
                            .shadow(color: .black.opacity(0.3), radius: 4, x: 0, y: 2)
                    )
                    .padding(8)
            }
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.4), radius: 8, x: 0, y: 4)
            
            Text(series.title)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(.white)
                .lineLimit(2)
            
            Text("\(series.numberOfSeasons) Season\(series.numberOfSeasons != 1 ? "s" : "")")
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(.gray)
        }
    }
}

#Preview {
    MovieLibraryView()
        .environmentObject(MovieStore())
        .preferredColorScheme(.dark)
}
