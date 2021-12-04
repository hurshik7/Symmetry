// populate background image which was uploaded by user to storage
function populateImage() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      currentUser = db.collection("users").doc(user.uid);
      currentUser.get().then((userDoc) => {
        // get the name of background image file that user uploaded
        var back_img_name = userDoc.data().background;
        // get the url of the file from storage
        var back_img_url = storage.ref(back_img_name);
        let user_img = storage.ref().child(back_img_name);
        user_img.getDownloadURL().then(function (result) {
          document.body.style.backgroundImage = "url(" + result + ")";
        });
      });
    }
  });
}
populateImage();
