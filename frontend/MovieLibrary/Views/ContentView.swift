import SwiftUI

struct ContentView: View {
    @EnvironmentObject var movieStore: MovieStore
    @State private var selectedView: NavigationItem? = .movies
    
    var body: some View {
        NavigationSplitView {
            SidebarView(selectedView: $selectedView)
        } detail: {
            switch selectedView {
            case .search:
                TMDBSearchView()
            case .movies:
                MovieLibraryView()
                    .navigationTitle("Movies")
            case .tvShows:
                TVSeriesLibraryView()
                    .navigationTitle("TV Shows")
            case .recentNotes:
                Text("Recent Notes (Coming Soon)")
                    .navigationTitle("Notes")
            case .deleted:
                Text("Deleted Items")
                    .navigationTitle("Trash")
            case .none:
                Text("Select an item")
            }
        }
        .preferredColorScheme(.dark)
    }
}

#Preview {
    ContentView()
        .environmentObject(MovieStore())
}
