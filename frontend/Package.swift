// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "MovieLibrary",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(
            name: "MovieLibrary",
            targets: ["MovieLibrary"]),
    ],
    dependencies: [
        // Supabase Swift SDK for cloud sync
        .package(url: "https://github.com/supabase/supabase-swift.git", from: "2.0.0")
    ],
    targets: [
        .target(
            name: "MovieLibrary",
            dependencies: [
                .product(name: "Supabase", package: "supabase-swift")
            ]),
    ]
)
