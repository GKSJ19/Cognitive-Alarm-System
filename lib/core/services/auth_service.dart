import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthService {
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn.instance;

  bool _initialized = false;

  Stream<User?> get authStateChanges => _firebaseAuth.authStateChanges();

  User? get currentUser => _firebaseAuth.currentUser;

  Future<void> _ensureInitialized() async {
    if (_initialized) return;
    await _googleSignIn.initialize();
    _initialized = true;
  }

  Future<UserCredential?> signInWithGoogle() async {
    try {
      await _ensureInitialized();

      final GoogleSignInAccount googleUser = await _googleSignIn.authenticate();

      final GoogleSignInAuthentication googleAuth = googleUser.authentication;

      final credential = GoogleAuthProvider.credential(
        idToken: googleAuth.idToken,
      );

      return await _firebaseAuth.signInWithCredential(credential);
    } on GoogleSignInException catch (e) {
      if (e.code == GoogleSignInExceptionCode.canceled) {
        return null;
      }
      rethrow;
    } on FirebaseAuthException {
      rethrow;
    } catch (e) {
      throw Exception("Google sign-in failed: $e");
    }
  }

  Future<UserCredential> createUserWithEmailAndPassword({
    required String email,
    required String password,
    required String displayName,
  }) async {
    final credential = await _firebaseAuth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
    if (displayName.isNotEmpty) {
      await credential.user?.updateDisplayName(displayName);
      await credential.user?.reload();
    }
    return credential;
  }

  Future<void> signOut() async {
    try {
      await _googleSignIn.signOut();
    } catch (_) {
      // google_sign_in has no real Windows desktop implementation —
      // signOut() throws UnimplementedError there. Safe to ignore:
      // there's no Google session to close on this platform anyway.
    }
    await _firebaseAuth.signOut();
  }
  /// GUESS — matches Firebase's standard reset-email API. Confirm the
  /// param/behavior expected by forgot_password.dart:37 once you paste it.
  Future<void> sendPasswordResetEmail(String email) async {
    await _firebaseAuth.sendPasswordResetEmail(email: email);
  }

  /// DEBUG ONLY — used by AuthRepository.debugForceLogin so isLoggedIn
  /// becomes true without a real Google sign-in. Requires Anonymous
  /// sign-in to be enabled in the Firebase console; if it isn't, this
  /// throws and debugForceLogin should be adjusted to skip it.
  Future<void> signInAnonymouslyForDebug() async {
    if (_firebaseAuth.currentUser == null) {
      await _firebaseAuth.signInAnonymously();
    }
  }
}