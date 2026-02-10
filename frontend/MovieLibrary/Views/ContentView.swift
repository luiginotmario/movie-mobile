import SwiftUI

struct ContentView: View {
    @EnvironmentObject var movieStore: MovieStore
    @State private var showAddMovie = false
    @State private var showSearchMovie = false
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background gradient
                LinearGradient(
                    colors: [Color.black, Color(red: 0.1, green: 0.1, blue: 0.15)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Custom Tab Selector
                    MediaTypeSelector(selectedMediaType: $movieStore.selectedMediaType)
                        .padding(.horizontal)
                        .padding(.top, 8)
                    
                    // Filter Pills
                    FilterPillsView(
                        selectedWatchStatus: $movieStore.selectedWatchStatus,
                        searchText: $movieStore.searchText
                    )
                    .padding(.horizontal)
                    .padding(.vertical, 12)
                    
                    // Main Content
                    if movieStore.selectedMediaType == .movie {
                        MovieLibraryView()
                    } else {
                        TVSeriesLibraryView()
                    }
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Text("My Library")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button(action: { showAddMovie = true }) {
                            Label("Add Manually", systemImage: "square.and.pencil")
                        }
                        
                        Button(action: { showSearchMovie = true }) {
                            Label("Search TMDB", systemImage: "magnifyingglass")
                        }
                    } label: {
                        Image(systemName: "plus")
                            .font(.system(size: 20, weight: .semibold))
                            .foregroundColor(.white)
                    }
                }
            }
            .sheet(isPresented: $showAddMovie) {
                AddMovieView()
            }
            .sheet(isPresented: $showSearchMovie) {
                TMDBSearchView()
            }
        }
        .preferredColorScheme(.dark)
    }
}

struct MediaTypeSelector: View {
    @Binding var selectedMediaType: MediaType
    
    var body: some View {
        HStack(spacing: 12) {
            ForEach(MediaType.allCases, id: \.self) { type in
                Button(action: {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                        selectedMediaType = type
                    }
                }) {
                    HStack(spacing: 6) {
                        Image(systemName: type.icon)
                            .font(.system(size: 16, weight: .semibold))
                        
                        Text(type.rawValue)
                            .font(.system(size: 16, weight: .semibold))
                    }
                    .foregroundColor(selectedMediaType == type ? .white : .gray)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(
                        ZStack {
                            if selectedMediaType == type {
                                RoundedRectangle(cornerRadius: 20)
                                    .fill(Color.white.opacity(0.2))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 20)
                                            .stroke(Color.white.opacity(0.3), lineWidth: 1)
                                    )
                            } else {
                                RoundedRectangle(cornerRadius: 20)
                                    .fill(Color.white.opacity(0.05))
                            }
                        }
                    )
                }
            }
            
            Spacer()
        }
    }
}

struct FilterPillsView: View {
    @Binding var selectedWatchStatus: WatchStatus?
    @Binding var searchText: String
    @State private var showSearchBar = false
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                // Search Button/Bar
                if showSearchBar {
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.gray)
                        
                        TextField("Search...", text: $searchText)
                            .foregroundColor(.white)
                        
                        if !searchText.isEmpty {
                            Button(action: { searchText = "" }) {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundColor(.gray)
                            }
                        }
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(Color.white.opacity(0.1))
                    .cornerRadius(20)
                    .frame(width: 200)
                } else {
                    Button(action: { withAnimation { showSearchBar = true } }) {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.white)
                            .padding(8)
                            .background(Color.white.opacity(0.1))
                            .clipShape(Circle())
                    }
                }
                
                // All Filter
                FilterPill(
                    title: "All",
                    isSelected: selectedWatchStatus == nil,
                    action: { selectedWatchStatus = nil }
                )
                
                // Status Filters
                ForEach(WatchStatus.allCases, id: \.self) { status in
                    FilterPill(
                        title: status.rawValue,
                        icon: status.icon,
                        color: status.color,
                        isSelected: selectedWatchStatus == status,
                        action: { selectedWatchStatus = status }
                    )
                }
            }
            .padding(.horizontal, 4)
        }
    }
}

struct FilterPill: View {
    let title: String
    var icon: String?
    var color: Color = .blue
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 14, weight: .semibold))
                }
                
                Text(title)
                    .font(.system(size: 14, weight: .semibold))
            }
            .foregroundColor(isSelected ? .white : .gray)
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(isSelected ? color.opacity(0.3) : Color.white.opacity(0.05))
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(isSelected ? color : Color.clear, lineWidth: 1)
                    )
            )
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(MovieStore())
        .environmentObject(NotificationManager())
}
