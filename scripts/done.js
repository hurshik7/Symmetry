// get current user uid
function getCurrentUserUid() {
  currentUser = firebase.auth().currentUser;
  if (currentUser != null) {
    return currentUser.uid;
  }
  return null;
}

// insert current user's name and their assignments in DB.
function insertNameAndAssignments() {
  firebase.auth().onAuthStateChanged((user) => {
    // Check if user is signed in:
    if (user) {
      //go to the correct user document by referencing to the user uid
      currentUser = db.collection("users").doc(user.uid);
      //get the document for current user.
      currentUser.get().then((userDoc) => {
        var user_Name = userDoc.data().name;
        currentUserName = user_Name;
        // display current user's name
        $("#name-goes-here").text(user_Name); //using jquery
      });

      // display user's assignments
      // access user's document in the "Done" collection
      currentAssignment = db
        .collection("Done")
        .doc(user.uid)
        .get()
        .then(function (snap) {
          // get the map of assignments(assMap) and count from DB.
          var assMap = snap.data().assMap;
          var assCount = snap.data().count;

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
                    <div class="card-header">${assClass}</div>
                    <div class="card-body">
                      <h5 class="card-title">${assName}</h5>
                      <p class="card-text">Due date: ${assDueDate}</p>
                    </div>
                    </div></a>`;
            // display the assignment card
            $(".card-container").append(cardTemplate);
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
clickedAssignmentKey = undefined;
clickedAssignmentString = undefined;

// get the color an user clicked and store it to global variable
function change_picked_color(pickedColor = "primary") {
  //console.log("Clicked!", pickedColor)
  clikedColor = pickedColor;
}

// auto populate the information of assignment in the modal window when user clicks it
function editModalContentAndFoundAss(assCs, assNm, assDd, assLc) {
  //Pass the information of clicked assignment
  $("button:contains(current)").text("");

  // assign the information of assignment and display the information
  document.getElementById("edit_assignment_name_here").value = assNm;
  document.getElementById("edit_class_here").value = assCs;
  document.getElementById("edit_due_date_here").value = assDd;
  let currentColorID = "#edit_" + assLc;
  let buttonClass = $(currentColorID).attr("class");
  $(currentColorID).text("current");

  //Found the assignment in the firesotre.
  clikedColor = assLc;

  //Search and get a index of current assignmnet in the assList in Firebase
  currentAss = { class: assCs, name: assNm, dueDate: assDd, labelColor: assLc };
  let userID = getCurrentUserUid();
  currentAssignment = db
    .collection("Done")
    .doc(userID)
    .get()
    .then(function (snap) {
      // make a string with the assignment data (serialization)
      currentAssignmentString = JSON.stringify(currentAss);
      var assMap = snap.data().assMap;

      // find the assignment in the DB
      for (i in assMap) {
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

  // edit the information of assignment in the collectionName (parameter) collection
  let updateNested = undefined;
  // update the assignment with edited information
  updateNested = db.collection(collectionName).doc(userID);
  updateNested.update(updateAss);
  updateNested
    .update({
      // increment count variable
      count: firebase.firestore.FieldValue.increment(1),
    })
    .then(function () {
      console.log("edited assignment info added to firestore");
      // show alert 
      if (collectionName == "Done") {
        alert("Your assignment has been edited!");
      } else {
        alert(`Your assignment has been put back!`);
      }
      // go back to done page
      window.location.assign("done.html");
    })
    .catch(function (error) {
      console.log("Error editing assignment: " + error);
    });
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
          window.location.assign("done.html");
        });
    }
  });
}

// set up eventlistener
var editModalSaveBtn = document.querySelector("#edit-modal-save-button");
editModalSaveBtn.addEventListener(
  "click",
  function () {
    saveEditedInfoToFirestore("Done");
  },
  false
);

//move to Assignment again! (remove from Assignments collection and add the assignment to Done collections)
function moveToAssignment() {
  saveEditedInfoToFirestore("Assignments");
  deleteAssignment("Done", false);
}
