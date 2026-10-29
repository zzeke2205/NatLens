import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { supabase } from "@/lib/supabase";

const COLORS = {
  primaryTeal: "#389390",
  primaryGreen: "#66C07D",
  textDarkTeal: "#2A7471",
  textLightGreen: "#4CA56A",
  accentRed: "#F04D2D",
  white: "#FFFFFF",
  background: "#FFFFFF",
};

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleAuth() {
    const cleanEmail = email.trim().toLowerCase();

    if (isSignUp) {
      if (!username.trim() || !cleanEmail || !password || !confirmPassword) {
        Alert.alert("Missing information", "Please fill in all fields.");
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert(
          "Passwords do not match",
          "Please re-type your password correctly.",
        );
        return;
      }
    } else {
      if (!cleanEmail || !password) {
        Alert.alert(
          "Missing information",
          "Please enter your email and password.",
        );
        return;
      }
    }

    if (password.length < 6) {
      Alert.alert(
        "Invalid password",
        "Password must be at least 6 characters.",
      );
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              username: username.trim(),
            },
          },
        });

        if (error) {
          throw error;
        }

        if (!data.session) {
          Alert.alert(
            "Check your email",
            "Your account was created. Confirm your email, then sign in.",
          );

          setIsSignUp(false);
          setPassword("");
          setConfirmPassword("");
        } else {
          Alert.alert("Welcome to NatLens!", "Your account is ready.");

          router.replace("/(tabs)");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          throw error;
        }

        router.replace("/(tabs)");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";

      Alert.alert(isSignUp ? "Sign Up Failed" : "Login Failed", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        {/* Brand Header */}
        <View style={styles.headerContainer}>
          <View style={styles.brandRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>👁️</Text>
            </View>

            <Text style={styles.brandName}>NatLens</Text>
          </View>

          <Text style={styles.welcomeTitle}>
            {isSignUp ? "Join NatLens!" : "Welcome back!"}
          </Text>

          <Text style={styles.welcomeSubtitle}>
            {isSignUp
              ? "Start your zoo adventure today."
              : "Sign in to continue your zoo adventure."}
          </Text>
        </View>

        {/* Input Form */}
        <View style={styles.formContainer}>
          {isSignUp && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>👤</Text>

                <TextInput
                  style={styles.input}
                  placeholder="explorer123"
                  placeholderTextColor="#A0C1C0"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  returnKeyType="next"
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>✉️</Text>

              <TextInput
                style={styles.input}
                placeholder="haziq@email.com"
                placeholderTextColor="#A0C1C0"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                autoComplete="email"
                editable={!loading}
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>

              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#A0C1C0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                editable={!loading}
                returnKeyType={isSignUp ? "next" : "go"}
                onSubmitEditing={() => {
                  if (!isSignUp) {
                    handleAuth();
                  }
                }}
              />

              <Pressable
                onPress={() => setShowPassword((previous) => !previous)}
                style={styles.eyeIconContainer}
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                <Text style={styles.eyeIcon}>{showPassword ? "👁️" : "🙈"}</Text>
              </Pressable>
            </View>
          </View>

          {isSignUp && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Re-type Password</Text>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>

                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#A0C1C0"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  editable={!loading}
                  returnKeyType="go"
                  onSubmitEditing={handleAuth}
                />

                <Pressable
                  onPress={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                  style={styles.eyeIconContainer}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showConfirmPassword
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
                >
                  <Text style={styles.eyeIcon}>
                    {showConfirmPassword ? "👁️" : "🙈"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Forgot Password Link */}
          {!isSignUp && (
            <Pressable
              style={styles.forgotPasswordContainer}
              onPress={() => {
                Alert.alert(
                  "Forgot password?",
                  "Password reset has not been implemented yet.",
                );
              }}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </Pressable>
          )}

          {/* Submit Button */}
          <Pressable
            style={[
              styles.mainButton,
              isSignUp && styles.signUpButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleAuth}
            disabled={loading}
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <View style={styles.buttonContent}>
                {!isSignUp && <Text style={styles.buttonArrow}>→</Text>}

                <Text style={styles.buttonText}>
                  {isSignUp ? "REGISTER" : "LOGIN"}
                </Text>
              </View>
            )}
          </Pressable>

          {/* Switch Between Login and Registration */}
          <View style={styles.switchContainer}>
            <Text style={styles.switchBaseText}>
              {isSignUp ? "Already exploring? " : "New explorer? "}
            </Text>

            <Pressable
              onPress={() => {
                setIsSignUp((previous) => !previous);
                setPassword("");
                setConfirmPassword("");
                setShowPassword(false);
                setShowConfirmPassword(false);
              }}
              disabled={loading}
              accessibilityRole="button"
            >
              <Text style={styles.switchActionText}>
                {isSignUp ? "Login" : "Register"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  logoIcon: {
    fontSize: 20,
    color: COLORS.white,
  },
  brandName: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.primaryTeal,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.primaryTeal,
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textLightGreen,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primaryTeal,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.primaryGreen,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 12,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textDarkTeal,
    height: "100%",
  },
  eyeIconContainer: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 18,
    opacity: 0.5,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 24,
    marginTop: -8,
  },
  forgotPasswordText: {
    color: COLORS.accentRed,
    fontWeight: "800",
    fontSize: 13,
  },
  mainButton: {
    backgroundColor: COLORS.primaryTeal,
    borderRadius: 24,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primaryTeal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  signUpButton: {
    marginTop: 12,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonArrow: {
    color: COLORS.white,
    fontSize: 18,
    marginRight: 8,
    fontWeight: "600",
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  switchBaseText: {
    color: COLORS.primaryTeal,
    fontWeight: "700",
    fontSize: 14,
  },
  switchActionText: {
    color: COLORS.accentRed,
    fontWeight: "800",
    fontSize: 14,
  },
});
