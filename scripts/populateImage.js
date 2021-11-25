
function populateImage() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      currentUser = db.collection("users").doc(user.uid);
      currentUser.get().then((userDoc) => {
        var back_img_name = userDoc.data().background;
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