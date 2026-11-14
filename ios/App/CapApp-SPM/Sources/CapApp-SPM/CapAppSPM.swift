import Foundation

// Capacitor generates Package.swift with a dependency-only target. Xcode 26
// rejects that product as empty unless this wrapper has at least one source file.
// `npx cap sync ios` rewrites Package.swift and leaves this file in place.
public enum CapAppSPM {
    public static let name = "BibleVerse"
}
