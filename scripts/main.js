var currentUserName = undefined;

// get current user uid
function getCurrentUserUid() {
  currentUser = firebase.auth().currentUser;
  if (currentUser != null) {
    //console.log(currentUser.uid);
    return currentUser.uid;
  }
  return null;
}

// insert current user's name and their assignments in DB.
function insertNameAndAssignments() {
  firebase.auth().onAuthStateChanged((user) => {
    // Check if user is signed in:
    if (user) {
      // get the user's name by using query (where) 
      db.collection("users")
        .where("id", "==", user.uid)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            currentUserName = doc.data().name;
          });
          // display user's name
          $("#name-goes-here").text(currentUserName); //using jquery
        });

      // display user's assignments
      // access user's document in the Assignments collection
      currentAssignment = db
        .collection("Assignments")
        .doc(user.uid)
        .get()
        .then(function (snap) {
          // get the map of assignments(assMap) and count from DB.
          var assMap = snap.data().assMap;
          var assCount = snap.data().count;

          // If there's even one assignment, it reduces the space in the welcome message div.
          if (assCount != 0) {
            $("#greeting-container").attr(
              "class",
              "p-3 mb-2 bg-light rounded-3"
            );
            $("#greeting-container-2").attr("class", "container-fluid py-1"); // change class (bootstrap)
            $("#greeting-message").text(""); // delete greeting message part
            $("#greeting-heading").replaceWith( 
              `<p class="col-md-5 fs-5" id="greeting-heading" style="font-weight: bold;">Welcome back! ${currentUserName}</p>`
            );

            // iterate the assignment map in the DB and get the information of user's assignments
            for (i in assMap) {
              let assName = assMap[i].name;
              let assClass = assMap[i].class;
              let assDueDate = assMap[i].dueDate;
              let assLabelColor = assMap[i].labelColor;

              // populate the assignment card with its information
              var cardTemplate = `
                    <a id="${
                      assClass + assName
                    }" class="added-card" onclick="editModalContentAndFoundAss('${assClass}', '${assName}', '${assDueDate}', '${assLabelColor}');">
                    <div class="card text-white bg-${assLabelColor} mb-3" style="max-width: 23rem;">
                    <div class="card-header">
                    ${assClass}
                    <button class="btn btn-dark btn-sm float-end" onclick="clickDoneOnCard('${assClass}', '${assName}', '${assDueDate}', '${assLabelColor}');">Done</button>
                    </div>
                    <div class="card-body">
                      <h5 class="card-title">${assName}</h5>
                      <p class="card-text">Due date: ${assDueDate}</p>
                    </div>
                    </div></a>`;
              // display the assignment card
              $(".card-container").append(cardTemplate);
            }
          }
        })
        .catch(function (error) {
          console.log("Error inserting assignment card: " + error);
        });
    } else {
      // No user is signed in.
      console.log("No user is signed in");
    }
  });
}
insertNameAndAssignments();

var clikedColor = undefined;

// get the number of user's assignments
function getAssignmentCount() {
  count = db
    .collection("Assignments")
    .doc(getCurrentUserUid())
    .get()
    .then((doc) => {
      if (doc.exists) {
        console.log("Here");
        console.log(doc.data().count);
        return doc.data().count;
      } else {
        return -1;
      }
    });
}

// Send the assignment information to firestore when users click 'save' button
function saveModalInfoToFirestore() {
  // get the information of assignment from user's input (Modal)
  assignmentName = document.querySelector("#AssignmentInput");
  assignmentClass = document.querySelector("#ClassInput");
  assignmentDuedate = document.querySelector("#DuedateInput");
  assignmentColor = clikedColor;

  let userID = getCurrentUserUid();
  var userAssignment = db.collection("Assignments").doc(userID);

  // add the assignment to firestore
  db.collection("Assignments")
    .doc(getCurrentUserUid())
    .get()
    .then((doc) => {
      if (doc.exists) {
        key = doc.data().assMapKey;
        var updateAss = {};
        let keyTemplate = "assMap." + key + ".";
        //update the assignment map with new data
        updateAss[keyTemplate + "class"] = assignmentClass.value;
        updateAss[keyTemplate + "name"] = assignmentName.value;
        updateAss[keyTemplate + "dueDate"] = assignmentDuedate.value;
        updateAss[keyTemplate + "labelColor"] = assignmentColor;
        userAssignment.update(updateAss);
        userAssignment
          .update({
            count: firebase.firestore.FieldValue.increment(1),
            assMapKey: firebase.firestore.FieldValue.increment(1),
          })
          .then(function () {
            // show alert saying the assignment is added
            alert(
              `Your assignment ${assignmentClass.value}, ${assignmentName.value} has been added!`
            );
            // go back to main page
            window.location.assign("main.html");
          });
      }
    });
}

// get the color an user clicked and store it to global variable
function change_picked_color(pickedColor = "primary") {
  clikedColor = pickedColor;
}

clickedAssignmentKey = undefined;
clickedAssignmentString = undefined;

// auto populate the information of assignment in the modal window when user clicks it
function editModalContentAndFoundAss(assCs, assNm, assDd, assLc) {
  // pass the information of clicked assignment
  $("button:contains(current)").text("");

  // assign the information of assignment and display the information
  document.getElementById("edit_assignment_name_here").value = assNm;
  document.getElementById("edit_class_here").value = assCs;
  document.getElementById("edit_due_date_here").value = assDd;
  let currentColorID = "#edit_" + assLc;
  let buttonClass = $(currentColorID).attr("class");
  $(currentColorID).text("current");
  clikedColor = assLc;

  //Search and get a index of current assignmnet in the assList in Firebase
  currentAss = { class: assCs, name: assNm, dueDate: assDd, labelColor: assLc };
  let userID = getCurrentUserUid();
  currentAssignment = db
    .collection("Assignments")
    .doc(userID)
    .get()
    .then(function (snap) {
      // make a string with the assignment data (serialization)
      currentAssignmentString = JSON.stringify(currentAss);
      var assMap = snap.data().assMap;

      // find the assignment in the DB
      for (i in assMap) {
        // serialize the assignment object in the DB and compare with the string of clicked assignment
        tempAssignmentString = `{"class":"${assMap[i].class}","name":"${assMap[i].name}","dueDate":"${assMap[i].dueDate}","labelColor":"${assMap[i].labelColor}"}`;
        if (currentAssignmentString == tempAssignmentString) {
          // store the key in the global variable
          clickedAssignmentKey = i;
          clickedAssignmentString = tempAssignmentString;
        }
      }
    })
    .then(function () {
      //show modal window to users.
      $("#edit_AssignmentModal").modal("show");
    });
}

// make Done collection for users who don't have it
async function makeDoneCollection() {
  console.log("makeDone");
  var userID = getCurrentUserUid();
  let userCollectionDoc = db
    .collection("Done")
    .doc(userID)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        db.collection("Done")
          .doc(userID)
          .set({
            assMap: {},
            count: 0,
          })
          .then(function () {
            console.log("Made done for new user");
          })
          .catch(function (error) {
            console.log("Error adding done collection: " + error);
          });
      }
    });
  return true;
}

// edit assignment 
async function saveEditedInfoToFirestore(collectionName) {
  // get the information of edited assignment
  assignmentName = document.querySelector("#edit_assignment_name_here");
  assignmentClass = document.querySelector("#edit_class_here");
  assignmentDuedate = document.querySelector("#edit_due_date_here");
  assignmentColor = clikedColor;

  // get current user's uid
  let userID = getCurrentUserUid();
  // make new object of assignment with edited information
  var updateAss = {};
  let keyStringTemplate = "assMap." + clickedAssignmentKey + ".";
  updateAss[keyStringTemplate + "class"] = assignmentClass.value;
  updateAss[keyStringTemplate + "name"] = assignmentName.value;
  updateAss[keyStringTemplate + "dueDate"] = assignmentDuedate.value;
  updateAss[keyStringTemplate + "labelColor"] = assignmentColor;

  let updateNested = undefined;
  // if collectionName (parameter) is "Done", edit the assignment in the "Done" collection
  if (collectionName == "Done") {
    makeDoneCollection().then(function () {
      // update the assignment with edited information
      updateNested = db.collection(collectionName).doc(userID);
      updateNested.update(updateAss);
      updateNested
        .update({
          // increment count variable
          count: firebase.firestore.FieldValue.increment(1),
        })
        .then(function () {
          console.log("The assignment moved to DONE page!");
          // show alert 
          alert(
            `[${assignmentClass.value}] ${assignmentName.value} moved to DONE page!`
          );
          // go back to main page
          window.location.assign("main.html");
        })
        .catch(function (error) {
          console.log("Error moving to done: " + error);
        });
    });
  } else { // if the collectionName(parameter) is "Assignments", edit the assignment in the "Assignments" collection
    updateNested = db
      .collection(collectionName)
      .doc(userID)
      .update(updateAss)
      .then(function () {
        console.log("edited assignment info added to firestore");
        alert(`Your assignment has been edited!`);
        window.location.assign("main.html");
      })
      .catch(function (error) {
        console.log("Error editing assignment: " + error);
      });
  }
}

// delete an assignment
function deleteAssignment(collectionName, isDeleteBtn) {
  // if this function invoked by clicking "Delete" button on the modal then pop up confirmation window and get user's choice
  if (isDeleteBtn) {
    // if user clicks "no", stop deleting the assignment
    if (confirm("Are you sure to delete it?") == false) {
      return;
    }
  }

  let userID = getCurrentUserUid();
  var userAssignment = db.collection(collectionName).doc(userID);
  userAssignment.get().then(function (doc) {
    if (doc.exists) {
      userAssignment.set(
        {
          // delete the clicked assignment from the assignment map in the DB
          assMap: {
            [clickedAssignmentKey]: firebase.firestore.FieldValue.delete(),
          },
        },
        { merge: true }
      );

      userAssignment
        .update({
          // decrement the count variable
          count: firebase.firestore.FieldValue.increment(-1),
        })
        .then(function () {
          // show alert
          alert(`Your assignment has been deleted!`);
          window.location.assign("main.html");
        });
    }
  });
}

// set up eventlistener
var modalSaveBtn = document.querySelector("#modal-save-button");
modalSaveBtn.addEventListener("click", saveModalInfoToFirestore);
var editModalSaveBtn = document.querySelector("#edit-modal-save-button");
editModalSaveBtn.addEventListener(
  "click",
  function () {
    saveEditedInfoToFirestore("Assignments");
  },
  false
);

//sound control
function playAssignmentCompleteSound() {
  var audio = new Audio("sounds/complete-assignment2.mp3");
  audio.play();
}

//move to Done! (remove from Assignments collection and add the assignment to Done collections)
function moveToDone() {
  saveEditedInfoToFirestore("Done").then(function () {
    deleteAssignment("Assignments", false);
    playAssignmentCompleteSound();
  });
}

// move an assignment to Done page when user click the "Done" button on the card (not in the modal)
function clickDoneOnCard(assNm, assCs, assDd, assLc) {
  //Search and get a index of current assignmnet in the assList in Firebase
  currentAss = { class: assCs, name: assNm, dueDate: assDd, labelColor: assLc };
  let userID = getCurrentUserUid();
  currentAssignment = db
    .collection("Assignments")
    .doc(userID)
    .get()
    .then(function (snap) {
      currentAssignmentString = JSON.stringify(currentAss);
      var assMap = snap.data().assMap;

      // find the assignment by iterating assignment map in the DB
      for (i in assMap) {
        tempAssignmentString = `{"class":"${assMap[i].class}","name":"${assMap[i].name}","dueDate":"${assMap[i].dueDate}","labelColor":"${assMap[i].labelColor}"}`;
        if (currentAssignmentString == tempAssignmentString) {
          clickedAssignmentKey = i;
        }
      }
    })
    .then(function () {
      moveToDone();
    });
}
