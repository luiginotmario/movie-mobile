import SwiftUI

struct AddMovieView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var movieStore: MovieStore
    
    @State private var title = ""
    @State private var overview = ""
    @State private var releaseDate = Date()
    @State private var selectedGenres: Set<String> = []
    @State private var watchStatus: WatchStatus = .watchLater
    @State private var sourceService: StreamingService?
    @State private var posterURL = ""
    
    let availableGenres = [
        "Action", "Adventure", "Animation", "Comedy", "Crime",
        "Documentary", "Drama", "Fantasy", "Horror", "Mystery",
        "Romance", "Science Fiction", "Thriller", "War", "Western"
    ]
    
    var body: some View {
        NavigationView {
            ZStack {
                Color.black.ignoresSafeArea()
                
                Form {
                    Section("Basic Information") {
                        TextField("Movie Title", text: $title)
                        
                        DatePicker("Release Date", selection: $releaseDate, displayedComponents: .date)
                        
                        TextField("Poster URL (optional)", text: $posterURL)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                    }
                    
                    Section("Overview") {
                        TextEditor(text: $overview)
                            .frame(height: 100)
                    }
                    
                    Section("Genres") {
                        FlowLayout(spacing: 8) {
                            ForEach(availableGenres, id: \.self) { genre in
                                GenreChip(
                                    genre: genre,
                                    isSelected: selectedGenres.contains(genre),
                                    action: {
                                        if selectedGenres.contains(genre) {
                                            selectedGenres.remove(genre)
                                        } else {
                                            selectedGenres.insert(genre)
                                        }
                                    }
                                )
                            }
                        }
                    }
                    
                    Section("Watch Status") {
                        Picker("Status", selection: $watchStatus) {
                            ForEach(WatchStatus.allCases, id: \.self) { status in
                                Label(status.rawValue, systemImage: status.icon)
                                    .tag(status)
                            }
                        }
                        .pickerStyle(.segmented)
                    }
                    
                    Section("Streaming Service") {
                        Picker("Service", selection: $sourceService) {
                            Text("None").tag(nil as StreamingService?)
                            ForEach(StreamingService.allCases, id: \.self) { service in
                                Label(service.rawValue, systemImage: service.icon)
                                    .tag(service as StreamingService?)
                            }
                        }
                    }
                }
                .scrollContentBackground(.hidden)
            }
            .navigationTitle("Add Movie")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Add") {
                        addMovie()
                    }
                    .disabled(title.isEmpty)
                }
            }
            .preferredColorScheme(.dark)
        }
    }
    
    private func addMovie() {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        
        let movie = Movie(
            title: title,
            posterURL: posterURL.isEmpty ? nil : posterURL,
            overview: overview,
            releaseDate: dateFormatter.string(from: releaseDate),
            genres: Array(selectedGenres),
            watchStatus: watchStatus,
            sourceService: sourceService
        )
        
        movieStore.addMovie(movie)
        dismiss()
    }
}

struct GenreChip: View {
    let genre: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(genre)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(isSelected ? .white : .gray)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(
                    Capsule()
                        .fill(isSelected ? Color.blue : Color.white.opacity(0.1))
                )
        }
    }
}

struct FlowLayout: Layout {
    var spacing: CGFloat = 8
    
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = FlowResult(
            in: proposal.replacingUnspecifiedDimensions().width,
            subviews: subviews,
            spacing: spacing
        )
        return result.size
    }
    
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = FlowResult(
            in: bounds.width,
            subviews: subviews,
            spacing: spacing
        )
        for (index, subview) in subviews.enumerated() {
            subview.place(at: CGPoint(x: bounds.minX + result.positions[index].x, y: bounds.minY + result.positions[index].y), proposal: .unspecified)
        }
    }
    
    struct FlowResult {
        var size: CGSize = .zero
        var positions: [CGPoint] = []
        
        init(in maxWidth: CGFloat, subviews: Subviews, spacing: CGFloat) {
            var x: CGFloat = 0
            var y: CGFloat = 0
            var lineHeight: CGFloat = 0
            
            for subview in subviews {
                let size = subview.sizeThatFits(.unspecified)
                
                if x + size.width > maxWidth && x > 0 {
                    x = 0
                    y += lineHeight + spacing
                    lineHeight = 0
                }
                
                positions.append(CGPoint(x: x, y: y))
                lineHeight = max(lineHeight, size.height)
                x += size.width + spacing
            }
            
            self.size = CGSize(width: maxWidth, height: y + lineHeight)
        }
    }
}

#Preview {
    AddMovieView()
        .environmentObject(MovieStore())
}
