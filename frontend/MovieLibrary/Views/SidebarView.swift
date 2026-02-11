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
                        .padding(.vertical, 4)
                }
                .listRowBackground(Color.clear)
            }
            .listRowSeparator(.hidden)

            // Main Library
            Section {
                NavigationLink(value: NavigationItem.movies) {
                    Label("Movies", systemImage: "popcorn.fill") // 🍿
                        .padding(.vertical, 4)
                }
                .listRowBackground(Color.clear)
                
                NavigationLink(value: NavigationItem.tvShows) {
                    Label("TV Shows", systemImage: "tv.fill") // 📺
                        .padding(.vertical, 4)
                }
                .listRowBackground(Color.clear)
            } header: {
                Text("Library")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.secondary)
            }
            .listRowSeparator(.hidden)

            // User Lists
            Section {
                NavigationLink(value: NavigationItem.recentNotes) {
                    Label("Recent Notes", systemImage: "note.text")
                        .padding(.vertical, 4)
                }
                .listRowBackground(Color.clear)
            } header: {
                Text("My Lists")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.secondary)
            }
            .listRowSeparator(.hidden)
            
            // System / Trash
            Section {
                NavigationLink(value: NavigationItem.deleted) {
                    Label("Deleted", systemImage: "trash")
                        .foregroundColor(.red)
                        .padding(.vertical, 4)
                }
                .listRowBackground(Color.clear)
            }
            .listRowSeparator(.hidden)
        }
        .scrollContentBackground(.hidden)
        .background(
            LinearGradient(
                colors: [Color.black, Color(red: 0.1, green: 0.1, blue: 0.15)],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
        )
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
