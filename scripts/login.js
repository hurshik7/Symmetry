// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
var uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function (authResult, redirectUrl) {
      // If the user is a "brand new" user, then create a new "user" in your own database.
      // Assign this user with the name and email provided.
      var user = authResult.user; // get the user object from the Firebase authentication database
      if (authResult.additionalUserInfo.isNewUser) {
        //if new user
        db.collection("users").doc(user.uid).set({
          //write to firestore. We are using the UID for the ID in users collection
          name: user.displayName, //"users" collection
          email: user.email, //with authenticated user's ID (user.uid)
          id: user.uid,
        });
        db.collection("Assignments").doc(user.uid).set({
          assMap: {}, // "Assignments" collection
          count: 0,   // count: the number of assignment objects
          assMapKey: 0, // assMapKey: key for the assignment objects. It will be incremented when an assignment is added.
        });
        db.collection("Done")
          .doc(user.uid)
          .set({
            assMap: {}, // "Done" collection
            count: 0,   // count: the number of finished assignment objects
          })
          .then(function () {
            console.log(
              "New user and user's assignment document added to firestore"
            );
            window.location.assign("main.html"); //re-direct to main.html after signup
          })
          .catch(function (error) {
            console.log("Error adding new user: " + error);
          });
      } else {
        return true;
      }
      return false;
    },
    uiShown: function () {
      // The widget is rendered.
      // Hide the loader.
      document.getElementById("loader").style.display = "none";
    },
  },
  // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  signInFlow: "popup",
  signInSuccessUrl: "main.html",
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    //firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    //firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    firebase.auth.GithubAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    //firebase.auth.PhoneAuthProvider.PROVIDER_ID
  ],
  // Terms of service url.
  tosUrl: "<your-tos-url>",
  // Privacy policy url.
  privacyPolicyUrl: "<your-privacy-policy-url>",
};

// The start method will wait until the DOM is loaded.
ui.start("#firebaseui-auth-container", uiConfig);

// Set random background image.
function setRandomBGImage() {
  // Random Number Generator
  let bgImageCount = 9;
  var backgroundImages =
    "url(../images/" +
    Math.floor(Math.random() * bgImageCount + 1) +
    "BGPortraitImage.jpg)";
  $("body").css("background-image", backgroundImages);
}
setRandomBGImage();