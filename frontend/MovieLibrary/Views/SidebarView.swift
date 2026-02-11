import SwiftUI

struct SidebarView: View {
    @EnvironmentObject var movieStore: MovieStore
    @Binding var selectedView: NavigationItem?
    
    var body: some View {
        List(selection: $selectedView) {
            // Search Section
            Section {
                NavigationLink(value: NavigationItem.search) {
                    Label("Search", systemImage: "magnifyingglass")
                }
            }
            .listRowBackground(Color.clear)
            .listRowSeparator(.hidden)

            // Main Library
            Section {
                NavigationLink(value: NavigationItem.movies) {
                    Label("Movies", systemImage: "popcorn.fill") // 🍿
                }
                
                NavigationLink(value: NavigationItem.tvShows) {
                    Label("TV Shows", systemImage: "tv.fill") // 📺
                }
            } header: {
                Text("Library")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.secondary)
            }
            .listRowBackground(Color.clear)
            .listRowSeparator(.hidden)

            // User Lists
            Section {
                NavigationLink(value: NavigationItem.recentNotes) {
                    Label("Recent Notes", systemImage: "note.text")
                }
            } header: {
                Text("My Lists")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.secondary)
            }
            .listRowBackground(Color.clear)
            .listRowSeparator(.hidden)
            
            // System / Trash
            Section {
                NavigationLink(value: NavigationItem.deleted) {
                    Label("Deleted", systemImage: "trash")
                        .foregroundColor(.red)
                }
            }
            .listRowBackground(Color.clear)
            .listRowSeparator(.hidden)
        }
        .listStyle(.sidebar)
        .navigationTitle("Menu")
        #if os(iOS)
        .toolbarBackground(.visible, for: .navigationBar)
        #endif
    }
}

enum NavigationItem: Hashable {
    case search
    case movies
    case tvShows
    case recentNotes
    case deleted
}
