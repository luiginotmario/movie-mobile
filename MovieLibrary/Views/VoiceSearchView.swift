import SwiftUI
import Speech
import AVFoundation

struct VoiceSearchView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var movieStore: MovieStore
    @StateObject private var voiceSearchManager = VoiceSearchManager()
    
    @State private var searchResults: [Movie] = []
    @State private var isSearching = false
    @State private var showPermissionAlert = false
    
    var body: some View {
        NavigationView {
            ZStack {
                Color.black.ignoresSafeArea()
                
                VStack(spacing: 32) {
                    // Header
                    VStack(spacing: 12) {
                        Image(systemName: "waveform.circle.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.purple)
                        
                        Text("Voice Search")
                            .font(.system(size: 24, weight: .bold))
                            .foregroundColor(.white)
                        
                        Text("Describe the movie you're looking for")
                            .font(.system(size: 15))
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 40)
                    
                    // Voice Visualization
                    VStack(spacing: 20) {
                        ZStack {
                            // Pulsing circles
                            ForEach(0..<3) { index in
                                Circle()
                                    .stroke(Color.purple.opacity(0.3), lineWidth: 2)
                                    .frame(width: 120 + CGFloat(index * 40), height: 120 + CGFloat(index * 40))
                                    .scaleEffect(voiceSearchManager.isRecording ? 1.2 : 1.0)
                                    .opacity(voiceSearchManager.isRecording ? 0.3 : 0.6)
                                    .animation(
                                        voiceSearchManager.isRecording ?
                                        Animation.easeInOut(duration: 1.5)
                                            .repeatForever(autoreverses: true)
                                            .delay(Double(index) * 0.2) : .default,
                                        value: voiceSearchManager.isRecording
                                    )
                            }
                            
                            // Mic button
                            Button(action: toggleRecording) {
                                Image(systemName: voiceSearchManager.isRecording ? "stop.circle.fill" : "mic.fill")
                                    .font(.system(size: 50))
                                    .foregroundColor(.white)
                                    .frame(width: 120, height: 120)
                                    .background(
                                        Circle()
                                            .fill(
                                                LinearGradient(
                                                    colors: voiceSearchManager.isRecording ? [.red, .orange] : [.purple, .blue],
                                                    startPoint: .topLeading,
                                                    endPoint: .bottomTrailing
                                                )
                                            )
                                    )
                                    .shadow(color: voiceSearchManager.isRecording ? .red.opacity(0.5) : .purple.opacity(0.5), radius: 20)
                            }
                        }
                        
                        // Transcription
                        if !voiceSearchManager.transcription.isEmpty {
                            Text(voiceSearchManager.transcription)
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.white)
                                .multilineTextAlignment(.center)
                                .padding()
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .fill(Color.white.opacity(0.1))
                                )
                                .padding(.horizontal, 24)
                        } else if voiceSearchManager.isRecording {
                            Text("Listening...")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.purple)
                        } else {
                            Text("Tap to start speaking")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.gray)
                        }
                    }
                    
                    // Search Results
                    if isSearching {
                        ProgressView()
                            .tint(.white)
                            .scaleEffect(1.5)
                    } else if !searchResults.isEmpty {
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Found \(searchResults.count) result\(searchResults.count != 1 ? "s" : "")")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.white)
                                .padding(.horizontal, 24)
                            
                            ScrollView {
                                VStack(spacing: 12) {
                                    ForEach(searchResults) { movie in
                                        VoiceSearchResultCard(movie: movie) {
                                            movieStore.addMovie(movie)
                                            dismiss()
                                        }
                                    }
                                }
                                .padding(.horizontal, 24)
                            }
                        }
                    }
                    
                    Spacer()
                    
                    // Examples
                    if searchResults.isEmpty && !voiceSearchManager.isRecording {
                        VStack(spacing: 12) {
                            Text("Try saying:")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(.gray)
                            
                            VStack(spacing: 8) {
                                ExamplePhrase(text: "\"A movie about dreams within dreams\"")
                                ExamplePhrase(text: "\"That film with the spinning top\"")
                                ExamplePhrase(text: "\"Leonardo DiCaprio heist movie\"")
                            }
                        }
                        .padding(.horizontal, 24)
                        .padding(.bottom, 20)
                    }
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") {
                        voiceSearchManager.stopRecording()
                        dismiss()
                    }
                }
            }
            .alert("Permission Required", isPresented: $showPermissionAlert) {
                Button("Settings", action: openSettings)
                Button("Cancel", role: .cancel) { }
            } message: {
                Text("Please enable microphone and speech recognition access in Settings to use voice search.")
            }
        }
        .preferredColorScheme(.dark)
        .onAppear {
            voiceSearchManager.requestPermissions { granted in
                if !granted {
                    showPermissionAlert = true
                }
            }
        }
    }
    
    private func toggleRecording() {
        if voiceSearchManager.isRecording {
            voiceSearchManager.stopRecording()
            performSearch()
        } else {
            voiceSearchManager.startRecording()
        }
    }
    
    private func performSearch() {
        guard !voiceSearchManager.transcription.isEmpty else { return }
        
        isSearching = true
        
        Task {
            // TODO: Implement actual NL search with 11Labs integration
            // For now, simulate search
            try? await Task.sleep(nanoseconds: 2_000_000_000)
            
            let results = [
                Movie(
                    title: "Inception",
                    posterURL: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
                    overview: "A thief who steals corporate secrets through the use of dream-sharing technology.",
                    releaseDate: "2010-07-16",
                    rating: 8.8,
                    genres: ["Action", "Science Fiction"],
                    runtime: 148,
                    director: "Christopher Nolan",
                    cast: ["Leonardo DiCaprio"],
                    watchStatus: .watchLater
                )
            ]
            
            await MainActor.run {
                searchResults = results
                isSearching = false
            }
        }
    }
    
    private func openSettings() {
        if let url = URL(string: UIApplication.openSettingsURLString) {
            UIApplication.shared.open(url)
        }
    }
}

struct ExamplePhrase: View {
    let text: String
    
    var body: some View {
        Text(text)
            .font(.system(size: 13, weight: .medium))
            .foregroundColor(.gray.opacity(0.8))
            .italic()
    }
}

struct VoiceSearchResultCard: View {
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
                
                Spacer()
                
                Button(action: onAdd) {
                    HStack(spacing: 6) {
                        Image(systemName: "plus.circle.fill")
                        Text("Add")
                    }
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(
                        Capsule()
                            .fill(Color.green)
                    )
                }
            }
            
            Spacer()
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.white.opacity(0.05))
        )
    }
}

@MainActor
class VoiceSearchManager: NSObject, ObservableObject, SFSpeechRecognizerDelegate {
    @Published var isRecording = false
    @Published var transcription = ""
    
    private let speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()
    
    override init() {
        super.init()
        speechRecognizer?.delegate = self
    }
    
    func requestPermissions(completion: @escaping (Bool) -> Void) {
        SFSpeechRecognizer.requestAuthorization { status in
            DispatchQueue.main.async {
                switch status {
                case .authorized:
                    AVAudioSession.sharedInstance().requestRecordPermission { granted in
                        DispatchQueue.main.async {
                            completion(granted)
                        }
                    }
                default:
                    completion(false)
                }
            }
        }
    }
    
    func startRecording() {
        guard !audioEngine.isRunning else { return }
        
        transcription = ""
        
        do {
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
            
            recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
            guard let recognitionRequest = recognitionRequest else { return }
            recognitionRequest.shouldReportPartialResults = true
            
            let inputNode = audioEngine.inputNode
            recognitionTask = speechRecognizer?.recognitionTask(with: recognitionRequest) { [weak self] result, error in
                guard let self = self else { return }
                
                if let result = result {
                    DispatchQueue.main.async {
                        self.transcription = result.bestTranscription.formattedString
                    }
                }
                
                if error != nil || result?.isFinal == true {
                    self.stopRecording()
                }
            }
            
            let recordingFormat = inputNode.outputFormat(forBus: 0)
            inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
                recognitionRequest.append(buffer)
            }
            
            audioEngine.prepare()
            try audioEngine.start()
            
            isRecording = true
        } catch {
            print("Error starting recording: \(error)")
        }
    }
    
    func stopRecording() {
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()
        
        recognitionRequest = nil
        recognitionTask = nil
        
        isRecording = false
    }
}

#Preview {
    VoiceSearchView()
        .environmentObject(MovieStore())
}
