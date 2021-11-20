function getCurrentUserUid() {
  currentUser = firebase.auth().currentUser;
  if (currentUser != null) {
    //console.log(currentUser.uid);
    return currentUser.uid;
  }
  return null;
}

function getUserName() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      currentUser = db.collection("users").doc(user.uid);
      currentUser.get().then((userDoc) => {
        var user_Name = userDoc.data().name;
        console.log(user_Name);
        currentUserName = user_Name;
        $("#name-goes-here").text(user_Name);
      });
    }
    else {
        console.log("No user is signed in");
    }
  });
}
getUserName();

