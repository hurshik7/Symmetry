var currentUserName = undefined;

function getCurrentUserUid() {
  currentUser = firebase.auth().currentUser;
  if (currentUser != null) {
    //console.log(currentUser.uid);
    return currentUser.uid;
  }
  return null;
}

function insertNameAndAssignments() {
  firebase.auth().onAuthStateChanged((user) => {
    // Check if user is signed in:
    if (user) {
      // Do something for the current logged-in user here:
      //console.log(user.uid);
      //go to the correct user document by referencing to the user uid
      currentUser = db.collection("users").doc(user.uid);
      //get the document for current user.
      currentUser.get().then((userDoc) => {
        var user_Name = userDoc.data().name;
        console.log(user_Name);
        //method #1:  insert with html only
        //document.getElementById("name-goes-here").innerText = n;    //using javascript
        //method #2:  insert using jquery
        currentUserName = user_Name;
        $("#name-goes-here").text(user_Name); //using jquery
      });

      currentAssignment = db
        .collection("Assignments")
        .doc(user.uid)
        .get()
        .then(function (snap) {
          var assMap = snap.data().assMap;
          var assCount = snap.data().count;

          if (assCount != 0) {
            $("#greeting-container").attr(
              "class",
              "p-3 mb-2 bg-light rounded-3"
            );
            $("#greeting-container-2").attr("class", "container-fluid py-1");
            $("#greeting-message").text("");
            $("#greeting-heading").replaceWith(
              `<p class="col-md-5 fs-5" id="greeting-heading" style="font-weight: bold;">Welcome back! ${currentUserName}</p>`
            );

            for (i in assMap) {
              let assName = assMap[i].name;
              let assClass = assMap[i].class;
              let assDueDate = assMap[i].dueDate;
              let assLabelColor = assMap[i].labelColor;
              //console.log(assName, assClass, assDueDate, assLabelColor);

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

//Send the assignment information to firestore when users click 'save' button
var clikedColor = undefined;

function getAssignmentCount() {
  console.log("got into getAssignmentCount()");
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

function saveModalInfoToFirestore() {
  assignmentName = document.querySelector("#AssignmentInput");
  //console.log(assignmentName.value);
  assignmentClass = document.querySelector("#ClassInput");
  //console.log(assignmentClass.value);
  assignmentDuedate = document.querySelector("#DuedateInput");
  //console.log(assignmentDuedate.value);
  assignmentColor = clikedColor;
  //console.log(assignmentColor)

  let userID = getCurrentUserUid();
  var userAssignment = db.collection("Assignments").doc(userID);

  var assCount = undefined;
  db.collection("Assignments")
    .doc(getCurrentUserUid())
    .get()
    .then((doc) => {
      if (doc.exists) {
        key = doc.data().assMapKey;
        var updateAss = {};
        let keyTemplate = "assMap." + key + ".";
        console.log(keyTemplate);
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
            console.log("assignment count +1 (Map)");
            console.log("assMapKey + 1");
            console.log("assignment info added to firestore (Map)");
            alert(
              `Your assignment ${assignmentClass.value}, ${assignmentName.value} has been added!`
            );
            window.location.assign("main.html");
          });
      }
    });
}

function change_picked_color(pickedColor = "primary") {
  //console.log("Clicked!", pickedColor)
  clikedColor = pickedColor;
}

clickedAssignmentKey = undefined;
clickedAssignmentString = undefined;

function editModalContentAndFoundAss(assCs, assNm, assDd, assLc) {
  //Pass the information of clicked assignment
  //console.log(assCs, assNm, assDd, assLc);
  $("button:contains(current)").text("");

  document.getElementById("edit_assignment_name_here").value = assNm;
  document.getElementById("edit_class_here").value = assCs;
  document.getElementById("edit_due_date_here").value = assDd;
  let currentColorID = "#edit_" + assLc;
  let buttonClass = $(currentColorID).attr("class");
  //console.log(buttonClass);
  $(currentColorID).text("current");

  //Found the assignment in the firesotre.
  clikedColor = assLc;

  //Search and get a index of current assignmnet in the assList in Firebase
  currentAss = { class: assCs, name: assNm, dueDate: assDd, labelColor: assLc };
  //console.log(currentAss);
  //console.log(typeof(currentAss));
  let userID = getCurrentUserUid();
  currentAssignment = db
    .collection("Assignments")
    .doc(userID)
    .get()
    .then(function (snap) {
      currentAssignmentString = JSON.stringify(currentAss);
      var assMap = snap.data().assMap;

      for (i in assMap) {
        tempAssignmentString = `{"class":"${assMap[i].class}","name":"${assMap[i].name}","dueDate":"${assMap[i].dueDate}","labelColor":"${assMap[i].labelColor}"}`;
        //console.log(tempAssignmentString);
        if (currentAssignmentString == tempAssignmentString) {
          //console.log("Found!!");
          clickedAssignmentKey = i;
          clickedAssignmentString = tempAssignmentString;
        }
      }
    })
    .then(function () {
      //show modal window to users.
      $("#edit_AssignmentModal").modal("show");
      //console.log(clickedAssignmentKey);
      //console.log(clickedAssignmentString);
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

async function saveEditedInfoToFirestore(collectionName) {
  assignmentName = document.querySelector("#edit_assignment_name_here");
  //console.log(assignmentName.value);
  assignmentClass = document.querySelector("#edit_class_here");
  //console.log(assignmentClass.value);
  assignmentDuedate = document.querySelector("#edit_due_date_here");
  //console.log(assignmentDuedate.value);
  assignmentColor = clikedColor;
  //console.log(assignmentColor);

  let userID = getCurrentUserUid();
  var updateAss = {};
  let keyStringTemplate = "assMap." + clickedAssignmentKey + ".";
  updateAss[keyStringTemplate + "class"] = assignmentClass.value;
  updateAss[keyStringTemplate + "name"] = assignmentName.value;
  updateAss[keyStringTemplate + "dueDate"] = assignmentDuedate.value;
  updateAss[keyStringTemplate + "labelColor"] = assignmentColor;

  let updateNested = undefined;
  if (collectionName == "Done") {
    //console.log(updateAss);
    makeDoneCollection().then(function () {
      updateNested = db.collection(collectionName).doc(userID);
      console.log(updateAss);
      updateNested.update(updateAss);
      updateNested
        .update({
          count: firebase.firestore.FieldValue.increment(1),
        })
        .then(function () {
          console.log("The assignment moved to DONE page!");
          alert(
            `[${assignmentClass.value}] ${assignmentName.value} moved to DONE page!`
          );
          window.location.assign("main.html");
        })
        .catch(function (error) {
          console.log("Error moving to done: " + error);
        });
    });
  } else {
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

function deleteAssignment(collectionName, isDeleteBtn) {
  if (isDeleteBtn) {
    if (confirm("Are you sure to delete it?") == false) {
      return;
    }
  }

  //console.log(clickedAssignmentKey);
  let userID = getCurrentUserUid();
  var userAssignment = db.collection(collectionName).doc(userID);
  userAssignment.get().then(function (doc) {
    if (doc.exists) {
      userAssignment.set(
        {
          assMap: {
            [clickedAssignmentKey]: firebase.firestore.FieldValue.delete(),
          },
        },
        { merge: true }
      );

      userAssignment
        .update({
          count: firebase.firestore.FieldValue.increment(-1),
        })
        .then(function () {
          console.log("assignment count -1");
          //console.log("assignment data deleted from firestore");
          alert(`Your assignment has been deleted!`);
          window.location.assign("main.html");
        });
    }
  });
}

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
  var audio = new Audio("sounds/Complete_assignment2.mp3");
  audio.play();
}

//move to Done! (remove from Assignments collection and add the assignment to Done collections)
function moveToDone() {
  saveEditedInfoToFirestore("Done")
    .then( function () {
      deleteAssignment("Assignments", false);
      playAssignmentCompleteSound();
    })
}

function clickDoneOnCard(assNm, assCs, assDd, assLc) {
  //Search and get a index of current assignmnet in the assList in Firebase
  currentAss = { class: assCs, name: assNm, dueDate: assDd, labelColor: assLc };
  //console.log(currentAss);
  //console.log(typeof(currentAss));
  let userID = getCurrentUserUid();
  currentAssignment = db
    .collection("Assignments")
    .doc(userID)
    .get()
    .then(function (snap) {
      currentAssignmentString = JSON.stringify(currentAss);
      var assMap = snap.data().assMap;

      for (i in assMap) {
        tempAssignmentString = `{"class":"${assMap[i].class}","name":"${assMap[i].name}","dueDate":"${assMap[i].dueDate}","labelColor":"${assMap[i].labelColor}"}`;
        //console.log(tempAssignmentString);
        if (currentAssignmentString == tempAssignmentString) {
          //console.log("Found!!");
          clickedAssignmentKey = i;
        }
      }
    })
    .then(function() {
      moveToDone();
    })
}