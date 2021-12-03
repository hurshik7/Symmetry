var currentUser;

function populateInfo() {
  firebase.auth().onAuthStateChanged((user) => {
    // Check if user is signed in:
    if (user) {
      //go to the correct user document by referencing to the user uid
      currentUser = db.collection("users").doc(user.uid);
      //get the document for current user.
      currentUser.get().then((userDoc) => {
        //get the data fields of the user
        var userName = userDoc.data().name;
        var userCity = userDoc.data().city;

        //if the data fields are not empty, then write them in to the form.
        if (userName != null) {
          document.getElementById("nameInput").value = userName;
        }
        if (userCity != null) {
          document.getElementById("cityInput").value = userCity;
        }
      });
    } else {
      // No user is signed in.
      console.log("No user is signed in");
    }
  });
}

//call the function to run it
populateInfo();

function editUserInfo() {
  //Enable the form fields
  document.getElementById("personalInfoFields").disabled = false;
}

function saveUserInfo() {
  // console.log("save is clicked")

  //grab values from the form that the user inserted in each field
  username = document.getElementById("nameInput").value;
  city = document.getElementById("cityInput").value;

  // console.log("values are:", name, birthplace, city)

  //write values in the database
  currentUser.update({
    name: username,
    city: city,
  });
  document.getElementById("personalInfoFields").disabled = true;
}
//background image store
var uploader = document.getElementById("uploader");
var fileButton = document.getElementById("fileButton");
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    currentUser = db.collection("users").doc(user.uid);
    currentUser.get().then((userDoc) => {
      fileButton.addEventListener("change", function (e) {
        var userName = userDoc.data().name;
        var file = e.target.files[0];
        var storageRef = storage.ref(file.name);
        storageRef.put(file);
        console.log(file.name);
        currentUser.update({
          background: file.name,
        });
      });
    });
  }
});
