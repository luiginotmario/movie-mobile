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
        // Add any external dependencies here
        // Example: .package(url: "https://github.com/Alamofire/Alamofire.git", from: "5.8.0")
    ],
    targets: [
        .target(
            name: "MovieLibrary",
            dependencies: []),
    ]
)
