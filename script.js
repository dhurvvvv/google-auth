/* =========================================================
   SUPABASE CONFIGURATION
========================================================= */

/*
    Go to:

    Supabase Dashboard
    → Your Project
    → Settings
    → API

    Copy:

    1. Project URL
    2. Publishable key / anon key

    NEVER put the service_role / secret key in this file.
*/

const SUPABASE_URL = "https://lixbdcvhdsqkjqyfnjhf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpeGJkY3ZoZHNxa2pxeWZuamhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNzIxODksImV4cCI6MjEwNTY0ODE4OX0.gp8YfGajMLXOHtJHqSoL-vMEjR15MUGaBiZvfwU7h14";


/* =========================================================
   SUPABASE CLIENT
========================================================= */

let supabaseClient = null;

let currentUser = null;

let currentMode = "login";


/* =========================================================
   DOM ELEMENTS
========================================================= */

const authSection =
    document.getElementById("auth-section");

const dashboardSection =
    document.getElementById("dashboard-section");

const setupWarning =
    document.getElementById("setup-warning");

const googleLoginBtn =
    document.getElementById("google-login-btn");

const authForm =
    document.getElementById("auth-form");

const authSubmitBtn =
    document.getElementById("auth-submit-btn");

const loginModeBtn =
    document.getElementById("login-mode-btn");

const signupModeBtn =
    document.getElementById("signup-mode-btn");

const nameGroup =
    document.getElementById("name-group");

const confirmPasswordGroup =
    document.getElementById("confirm-password-group");

const forgotPasswordBox =
    document.getElementById("forgot-password-box");

const forgotPasswordBtn =
    document.getElementById("forgot-password-btn");

const passwordInput =
    document.getElementById("password");

const confirmPasswordInput =
    document.getElementById("confirm-password");

const togglePasswordBtn =
    document.getElementById("toggle-password");

const emailInput =
    document.getElementById("email");

const nameInput =
    document.getElementById("name");

const authMessage =
    document.getElementById("auth-message");

const logoutBtn =
    document.getElementById("logout-btn");

const loadingOverlay =
    document.getElementById("loading-overlay");

const loadingText =
    document.getElementById("loading-text");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toast-message");

const dashboardName =
    document.getElementById("dashboard-name");

const profileName =
    document.getElementById("profile-name");

const profileEmail =
    document.getElementById("profile-email");

const profileAvatar =
    document.getElementById("profile-avatar");

const profileAvatarFallback =
    document.getElementById("profile-avatar-fallback");

const infoName =
    document.getElementById("info-name");

const infoEmail =
    document.getElementById("info-email");

const infoProvider =
    document.getElementById("info-provider");

const infoEmailStatus =
    document.getElementById("info-email-status");

const infoUserId =
    document.getElementById("info-user-id");

const infoCreated =
    document.getElementById("info-created");

const providerChip =
    document.getElementById("provider-chip");


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    setupEventListeners();

    checkSupabaseConfiguration();

    if (!supabaseClient) {
        return;
    }

    await restoreSession();

    listenForAuthChanges();

});


/* =========================================================
   CHECK SUPABASE CONFIG
========================================================= */

function checkSupabaseConfiguration() {

    const invalidUrl =
        !SUPABASE_URL ||
        SUPABASE_URL === "https://lixbdcvhdsqkjqyfnjhf.supabase.co";

    const invalidKey =
        !SUPABASE_ANON_KEY ||
        SUPABASE_ANON_KEY === "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpeGJkY3ZoZHNxa2pxeWZuamhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNzIxODksImV4cCI6MjEwNTY0ODE4OX0.gp8YfGajMLXOHtJHqSoL-vMEjR15MUGaBiZvfwU7h14";

    if (invalidUrl || invalidKey) {

        console.warn(
            "Supabase is not configured. Add your Project URL and Publishable/anon key to script.js."
        );

        setupWarning.classList.remove("hidden");

        return;
    }

    setupWarning.classList.add("hidden");

    try {

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_ANON_KEY
            );

        console.log(
            "Supabase client initialized successfully."
        );

    } catch (error) {

        console.error(
            "Supabase initialization error:",
            error
        );

        showMessage(
            "Unable to initialize Supabase.",
            "error"
        );
    }
}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function setupEventListeners() {

    googleLoginBtn.addEventListener(
        "click",
        handleGoogleLogin
    );

    authForm.addEventListener(
        "submit",
        handleEmailAuth
    );

    loginModeBtn.addEventListener(
        "click",
        () => setAuthMode("login")
    );

    signupModeBtn.addEventListener(
        "click",
        () => setAuthMode("signup")
    );

    forgotPasswordBtn.addEventListener(
        "click",
        handleForgotPassword
    );

    togglePasswordBtn.addEventListener(
        "click",
        togglePasswordVisibility
    );

    logoutBtn.addEventListener(
        "click",
        handleLogout
    );

}


/* =========================================================
   RESTORE SESSION
========================================================= */

async function restoreSession() {

    if (!supabaseClient) {
        return;
    }

    try {

        showLoading(
            "Checking your session..."
        );

        const {
            data,
            error
        } = await supabaseClient.auth.getSession();

        if (error) {
            throw error;
        }

        if (data && data.session) {

            currentUser =
                data.session.user;

            showDashboard(currentUser);

        } else {

            showAuth();

        }

    } catch (error) {

        console.error(
            "Session restore error:",
            error
        );

        showAuth();

    } finally {

        hideLoading();

    }
}


/* =========================================================
   AUTH STATE LISTENER
========================================================= */

function listenForAuthChanges() {

    if (!supabaseClient) {
        return;
    }

    supabaseClient.auth.onAuthStateChange(
        (event, session) => {

            console.log(
                "Auth event:",
                event
            );

            if (session && session.user) {

                currentUser =
                    session.user;

                showDashboard(
                    session.user
                );

            } else {

                currentUser = null;

                showAuth();

            }
        }
    );
}


/* =========================================================
   GOOGLE LOGIN
========================================================= */

async function handleGoogleLogin() {

    if (!supabaseClient) {

        showMessage(
            "First add your Supabase URL and key in script.js.",
            "error"
        );

        return;
    }

    try {

        clearMessage();

        setButtonLoading(
            googleLoginBtn,
            true,
            "Connecting..."
        );

        /*
            Google login is handled by Supabase OAuth.

            The user will be redirected to Google.
        */

        const redirectUrl =
            window.location.origin +
            window.location.pathname;

        const {
            data,
            error
        } =
            await supabaseClient.auth.signInWithOAuth({
                provider: "google",

                options: {
                    redirectTo: redirectUrl
                }
            });

        if (error) {
            throw error;
        }

        console.log(
            "Google OAuth started:",
            data
        );

    } catch (error) {

        console.error(
            "Google login error:",
            error
        );

        showMessage(
            getReadableAuthError(error),
            "error"
        );

        setButtonLoading(
            googleLoginBtn,
            false,
            "Continue with Google"
        );
    }
}


/* =========================================================
   EMAIL LOGIN / SIGNUP
========================================================= */

async function handleEmailAuth(event) {

    event.preventDefault();

    if (!supabaseClient) {

        showMessage(
            "First configure Supabase in script.js.",
            "error"
        );

        return;
    }

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;

    if (!email || !password) {

        showMessage(
            "Please enter your email and password.",
            "error"
        );

        return;
    }


    if (currentMode === "signup") {

        await handleSignup(
            email,
            password
        );

    } else {

        await handleLogin(
            email,
            password
        );

    }
}


/* =========================================================
   LOGIN
========================================================= */

async function handleLogin(
    email,
    password
) {

    try {

        clearMessage();

        showLoading(
            "Signing you in..."
        );

        const {
            data,
            error
        } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

        if (error) {
            throw error;
        }

        if (data && data.user) {

            currentUser =
                data.user;

            showDashboard(
                data.user
            );

            showToast(
                "Login successful!"
            );

        }

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        showMessage(
            getReadableAuthError(error),
            "error"
        );

    } finally {

        hideLoading();

    }
}


/* =========================================================
   SIGN UP
========================================================= */

async function handleSignup(
    email,
    password
) {

    const name =
        nameInput.value.trim();

    const confirmPassword =
        confirmPasswordInput.value;


    if (!name) {

        showMessage(
            "Please enter your full name.",
            "error"
        );

        return;
    }


    if (password.length < 6) {

        showMessage(
            "Password must contain at least 6 characters.",
            "error"
        );

        return;
    }


    if (password !== confirmPassword) {

        showMessage(
            "Passwords do not match.",
            "error"
        );

        return;
    }


    try {

        clearMessage();

        showLoading(
            "Creating your account..."
        );

        const {
            data,
            error
        } =
            await supabaseClient.auth.signUp({

                email: email,

                password: password,

                options: {

                    data: {
                        full_name: name
                    }
                }
            });


        if (error) {
            throw error;
        }


        /*
            Supabase may require email confirmation.

            In that case session can be null.
        */

        if (data.user && !data.session) {

            showMessage(
                "Account created! Please check your email and confirm your account before logging in.",
                "success"
            );

            setAuthMode("login");

            emailInput.value =
                email;

            passwordInput.value =
                "";

            return;
        }


        if (data.user) {

            currentUser =
                data.user;

            showDashboard(
                data.user
            );

            showToast(
                "Account created successfully!"
            );
        }

    } catch (error) {

        console.error(
            "Signup error:",
            error
        );

        showMessage(
            getReadableAuthError(error),
            "error"
        );

    } finally {

        hideLoading();

    }
}


/* =========================================================
   FORGOT PASSWORD
========================================================= */

async function handleForgotPassword() {

    if (!supabaseClient) {

        showMessage(
            "First configure Supabase in script.js.",
            "error"
        );

        return;
    }

    const email =
        emailInput.value.trim();


    if (!email) {

        showMessage(
            "Enter your email address first.",
            "error"
        );

        emailInput.focus();

        return;
    }


    try {

        clearMessage();

        showLoading(
            "Sending password reset email..."
        );

        const redirectUrl =
            window.location.origin +
            window.location.pathname;


        const {
            error
        } =
            await supabaseClient.auth.resetPasswordForEmail(
                email,
                {
                    redirectTo: redirectUrl
                }
            );


        if (error) {
            throw error;
        }


        showMessage(
            "Password reset email sent. Check your inbox.",
            "success"
        );

    } catch (error) {

        console.error(
            "Password reset error:",
            error
        );

        showMessage(
            getReadableAuthError(error),
            "error"
        );

    } finally {

        hideLoading();

    }
}


/* =========================================================
   LOGOUT
========================================================= */

async function handleLogout() {

    if (!supabaseClient) {
        return;
    }

    try {

        showLoading(
            "Signing you out..."
        );

        const {
            error
        } =
            await supabaseClient.auth.signOut();

        if (error) {
            throw error;
        }

        currentUser = null;

        showAuth();

        clearAuthForm();

        showToast(
            "You have been logged out."
        );

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

        showMessage(
            getReadableAuthError(error),
            "error"
        );

    } finally {

        hideLoading();

    }
}


/* =========================================================
   SET AUTH MODE
========================================================= */

function setAuthMode(mode) {

    currentMode =
        mode;

    clearMessage();


    if (mode === "signup") {

        signupModeBtn.classList.add(
            "active"
        );

        loginModeBtn.classList.remove(
            "active"
        );

        nameGroup.classList.remove(
            "hidden"
        );

        confirmPasswordGroup.classList.remove(
            "hidden"
        );

        forgotPasswordBox.classList.add(
            "hidden"
        );

        authSubmitBtn.textContent =
            "Create Account";

        passwordInput.setAttribute(
            "autocomplete",
            "new-password"
        );

    } else {

        loginModeBtn.classList.add(
            "active"
        );

        signupModeBtn.classList.remove(
            "active"
        );

        nameGroup.classList.add(
            "hidden"
        );

        confirmPasswordGroup.classList.add(
            "hidden"
        );

        forgotPasswordBox.classList.remove(
            "hidden"
        );

        authSubmitBtn.textContent =
            "Login";

        passwordInput.setAttribute(
            "autocomplete",
            "current-password"
        );
    }
}


/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

function togglePasswordVisibility() {

    const isPassword =
        passwordInput.type === "password";

    passwordInput.type =
        isPassword
            ? "text"
            : "password";

    togglePasswordBtn.textContent =
        isPassword
            ? "Hide"
            : "Show";
}


/* =========================================================
   SHOW DASHBOARD
========================================================= */

function showDashboard(user) {

    if (!user) {
        return;
    }

    currentUser =
        user;


    authSection.classList.add(
        "hidden"
    );

    dashboardSection.classList.remove(
        "hidden"
    );


    const metadata =
        user.user_metadata || {};


    const fullName =
        metadata.full_name ||
        metadata.name ||
        metadata.user_name ||
        user.email?.split("@")[0] ||
        "User";


    const avatarUrl =
        metadata.avatar_url ||
        metadata.picture ||
        "";


    /* -----------------------------
       Header
    ----------------------------- */

    dashboardName.textContent =
        fullName;


    /* -----------------------------
       Profile
    ----------------------------- */

    profileName.textContent =
        fullName;

    profileEmail.textContent =
        user.email || "No email";


    /* -----------------------------
       Avatar
    ----------------------------- */

    if (avatarUrl) {

        profileAvatar.src =
            avatarUrl;

        profileAvatar.classList.remove(
            "hidden"
        );

        profileAvatarFallback.classList.add(
            "hidden"
        );

    } else {

        profileAvatar.removeAttribute(
            "src"
        );

        profileAvatar.classList.add(
            "hidden"
        );

        profileAvatarFallback.classList.remove(
            "hidden"
        );

        profileAvatarFallback.textContent =
            getInitials(fullName);
    }


    /* -----------------------------
       Account information
    ----------------------------- */

    infoName.textContent =
        fullName;

    infoEmail.textContent =
        user.email || "—";


    const provider =
        getAuthProvider(user);

    infoProvider.textContent =
        provider;

    providerChip.textContent =
        provider === "Google"
            ? "Google + Supabase"
            : "Supabase Auth";


    infoEmailStatus.textContent =
        user.email_confirmed_at
            ? "Verified"
            : "Not Verified";


    infoUserId.textContent =
        user.id || "—";


    infoCreated.textContent =
        formatDate(user.created_at);

}


/* =========================================================
   SHOW AUTH
========================================================= */

function showAuth() {

    dashboardSection.classList.add(
        "hidden"
    );

    authSection.classList.remove(
        "hidden"
    );

}


/* =========================================================
   AUTH PROVIDER
========================================================= */

function getAuthProvider(user) {

    if (!user) {
        return "Unknown";
    }


    const identities =
        user.identities || [];


    if (
        identities.some(
            identity =>
                identity.provider === "google"
        )
    ) {

        return "Google";
    }


    if (
        identities.some(
            identity =>
                identity.provider === "email"
        )
    ) {

        return "Email";
    }


    return (
        user.app_metadata?.provider ||
        "Supabase"
    );
}


/* =========================================================
   GET INITIALS
========================================================= */

function getInitials(name) {

    if (!name) {
        return "U";
    }


    const parts =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (parts.length === 1) {

        return parts[0]
            .charAt(0)
            .toUpperCase();
    }


    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();
}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "—";
    }


    const date =
        new Date(dateString);


    if (Number.isNaN(date.getTime())) {
        return "—";
    }


    return date.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}


/* =========================================================
   AUTH ERROR MESSAGE
========================================================= */

function getReadableAuthError(error) {

    if (!error) {
        return "Something went wrong.";
    }


    const message =
        error.message || "";


    if (
        message.toLowerCase()
            .includes("invalid login credentials")
    ) {

        return "Incorrect email or password.";
    }


    if (
        message.toLowerCase()
            .includes("email not confirmed")
    ) {

        return "Please confirm your email before logging in.";
    }


    if (
        message.toLowerCase()
            .includes("user already registered")
    ) {

        return "An account with this email already exists.";
    }


    if (
        message.toLowerCase()
            .includes("password should be at least")
    ) {

        return "Your password is too short.";
    }


    if (
        message.toLowerCase()
            .includes("rate limit")
    ) {

        return "Too many requests. Please wait and try again.";
    }


    return message ||
        "Authentication failed. Please try again.";
}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    message,
    type = "error"
) {

    authMessage.textContent =
        message;

    authMessage.className =
        "auth-message show " + type;
}


function clearMessage() {

    authMessage.textContent =
        "";

    authMessage.className =
        "auth-message";
}


/* =========================================================
   LOADING
========================================================= */

function showLoading(message) {

    loadingText.textContent =
        message || "Please wait...";

    loadingOverlay.classList.remove(
        "hidden"
    );
}


function hideLoading() {

    loadingOverlay.classList.add(
        "hidden"
    );
}


/* =========================================================
   BUTTON LOADING
========================================================= */

function setButtonLoading(
    button,
    loading,
    text
) {

    if (!button) {
        return;
    }


    if (loading) {

        button.disabled =
            true;

        button.dataset.originalText =
            button.textContent;

        button.textContent =
            text || "Please wait...";

    } else {

        button.disabled =
            false;

        button.textContent =
            text ||
            button.dataset.originalText ||
            "Continue";
    }
}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;


function showToast(message) {

    toastMessage.textContent =
        message;

    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );
}


/* =========================================================
   CLEAR FORM
========================================================= */

function clearAuthForm() {

    nameInput.value =
        "";

    emailInput.value =
        "";

    passwordInput.value =
        "";

    confirmPasswordInput.value =
        "";

    clearMessage();

}


/* =========================================================
   HANDLE PASSWORD RECOVERY SESSION
========================================================= */

async function checkPasswordRecovery() {

    if (!supabaseClient) {
        return;
    }


    const hash =
        window.location.hash;


    if (
        hash &&
        hash.includes("type=recovery")
    ) {

        /*
            Supabase can return the user here
            after clicking the password reset link.

            You can later add a dedicated
            "new password" form if needed.
        */

        console.log(
            "Password recovery session detected."
        );
    }
}


/* =========================================================
   RUN RECOVERY CHECK
========================================================= */

setTimeout(
    checkPasswordRecovery,
    500
);


/* =========================================================
   DEBUG INFORMATION
========================================================= */

console.log(
    "Supabase Auth Panel loaded."
);

console.log(
    "Current auth mode:",
    currentMode
);