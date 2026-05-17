import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';

// ─────────────────────────────────────────────────────────
// Auth providers — use FirebaseAuth directly (no legacy FirebaseService)
// ─────────────────────────────────────────────────────────

final _firebaseAuthProvider = Provider<FirebaseAuth>((ref) {
  return FirebaseAuth.instance;
});

/// Stream provider for auth state — mirrors Web's AuthContext
final authStateProvider = StreamProvider<User?>((ref) {
  return ref.watch(_firebaseAuthProvider).authStateChanges();
});

/// Auth actions notifier
final authActionsProvider = Provider<AuthActions>((ref) {
  return AuthActions(ref.watch(_firebaseAuthProvider));
});

class AuthActions {
  final FirebaseAuth _auth;
  AuthActions(this._auth);

  Future<void> login(String email, String password) async {
    await _auth.signInWithEmailAndPassword(email: email, password: password);
  }

  Future<void> signup(String email, String password, String displayName) async {
    final cred = await _auth.createUserWithEmailAndPassword(email: email, password: password);
    await cred.user?.updateDisplayName(displayName);
  }

  Future<void> googleLogin() async {
    if (kIsWeb) {
      // Web: use popup
      final googleProvider = GoogleAuthProvider();
      await _auth.signInWithPopup(googleProvider);
    } else {
      // Mobile/Desktop: native Google Sign-In
      final googleUser = await GoogleSignIn().signIn();
      if (googleUser == null) return; // user cancelled

      final googleAuth = await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );
      await _auth.signInWithCredential(credential);
    }
  }

  Future<void> logout() async {
    if (!kIsWeb) {
      await GoogleSignIn().signOut();
    }
    await _auth.signOut();
  }
}
