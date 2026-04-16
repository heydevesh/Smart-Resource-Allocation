import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:go_router/go_router.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../services/firebase_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  String _errorMessage = '';

  Future<void> _login() async {
    if (FirebaseService().isDemoMode || !FirebaseService().isInitialized) {
      // Allow bypass in demo mode
      context.go('/home');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      await FirebaseAuth.instance.signInWithEmailAndPassword(
        email: _emailController.text.trim(),
        password: _passwordController.text.trim(),
      );
      if (mounted) context.go('/home');
    } on FirebaseAuthException catch (e) {
      setState(() {
        _errorMessage = e.message ?? 'An error occurred during login.';
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _register() async {
    if (FirebaseService().isDemoMode || !FirebaseService().isInitialized) {
      context.go('/home');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final email = _emailController.text.trim();
      final userCredential = await FirebaseAuth.instance.createUserWithEmailAndPassword(
        email: email,
        password: _passwordController.text.trim(),
      );
      
      // Auto-assign admin if email starts with 'admin'
      final role = email.toLowerCase().startsWith('admin') ? 'admin' : 'volunteer';

      await FirebaseFirestore.instance.collection('users').doc(userCredential.user!.uid).set({
        'email': email,
        'role': role, 
      });

      if (mounted) context.go('/home');
    } on FirebaseAuthException catch (e) {
      setState(() {
        _errorMessage = e.message ?? 'An error occurred during registration.';
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    // Stitch "Emerald Compassion" Theme Values
    const colorPrimary = Color(0xFF0D7D6E);
    const colorPrimaryDark = Color(0xFF006256);
    const colorBackground = Color(0xFFF6FAF8);
    const colorSurfaceHigh = Color(0xFFE5E9E6);
    const colorOnSurface = Color(0xFF181D1B);

    return Scaffold(
      backgroundColor: colorBackground,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 32.0, vertical: 24.0),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Logo/Iconography (Hands shaking)
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: colorPrimary.withOpacity(0.1),
                    ),
                    child: const Icon(
                      Icons.handshake_rounded,
                      size: 48,
                      color: colorPrimary,
                    ),
                  ),
                  const SizedBox(height: 48),
                  
                  // Display Heading (Syne font equivalent representation)
                  Text(
                    'Welcome to\nSahaay',
                    style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                      fontFamily: 'Syne',
                      fontWeight: FontWeight.w800,
                      color: colorPrimaryDark,
                      height: 1.2,
                      letterSpacing: -1.0,
                    ),
                    textAlign: TextAlign.left,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Login to continue making an impact.',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      fontFamily: 'DM Sans',
                      color: colorOnSurface.withOpacity(0.7),
                    ),
                  ),
                  const SizedBox(height: 48),

                  // Teal Input Fields 
                  TextField(
                    controller: _emailController,
                    decoration: InputDecoration(
                      labelText: 'Email Address',
                      labelStyle: const TextStyle(fontFamily: 'DM Sans', fontSize: 14),
                      prefixIcon: const Icon(Icons.mail_outline, color: colorPrimary),
                      filled: true,
                      fillColor: colorSurfaceHigh,
                      border: const UnderlineInputBorder(
                        borderSide: BorderSide.none,
                      ),
                      focusedBorder: const UnderlineInputBorder(
                        borderSide: BorderSide(color: colorPrimary, width: 2),
                      ),
                    ),
                    keyboardType: TextInputType.emailAddress,
                  ),
                  const SizedBox(height: 16),
                  
                  TextField(
                    controller: _passwordController,
                    decoration: InputDecoration(
                      labelText: 'Password',
                      labelStyle: const TextStyle(fontFamily: 'DM Sans', fontSize: 14),
                      prefixIcon: const Icon(Icons.lock_outline, color: colorPrimary),
                      filled: true,
                      fillColor: colorSurfaceHigh,
                      border: const UnderlineInputBorder(
                        borderSide: BorderSide.none,
                      ),
                      focusedBorder: const UnderlineInputBorder(
                        borderSide: BorderSide(color: colorPrimary, width: 2),
                      ),
                    ),
                    obscureText: true,
                  ),
                  const SizedBox(height: 32),

                  if (_errorMessage.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 16.0),
                      child: Text(
                        _errorMessage,
                        style: const TextStyle(color: Colors.redAccent, fontFamily: 'DM Sans'),
                        textAlign: TextAlign.center,
                      ),
                    ),

                  if (_isLoading)
                    const Center(child: CircularProgressIndicator(color: colorPrimary))
                  else
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Primary CTA with Gradient & Roundness
                        Container(
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [colorPrimaryDark, colorPrimary],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(24.0),
                          ),
                          child: ElevatedButton(
                            onPressed: _login,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              shadowColor: Colors.transparent,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(24.0),
                              ),
                            ),
                            child: const Text(
                              'Login',
                              style: TextStyle(
                                fontSize: 16,
                                fontFamily: 'DM Sans',
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        
                        // Secondary CTA
                        OutlinedButton(
                          onPressed: _register,
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            side: BorderSide(color: colorPrimary.withOpacity(0.3)),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(24.0),
                            ),
                          ),
                          child: const Text(
                            'Create Account (Volunteer)',
                            style: TextStyle(
                              fontFamily: 'DM Sans',
                              fontWeight: FontWeight.w600,
                              color: colorPrimaryDark,
                            ),
                          ),
                        ),
                      ],
                    ),

                  if (FirebaseService().isDemoMode)
                    Padding(
                      padding: const EdgeInsets.only(top: 32.0),
                      child: Text(
                        'Demo Mode: Tap login with any info to bypass.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: colorOnSurface.withOpacity(0.5),
                          fontFamily: 'DM Sans',
                          fontSize: 12,
                        ),
                      ),
                    )
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
