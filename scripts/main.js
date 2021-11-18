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
      console.log(user.uid);
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
          var asslist = snap.data().assList;

          if (asslist.length != 0) {
            //console.log($('#greeting-container').value);
            $("#greeting-container").attr(
              "class",
              "p-3 mb-2 bg-light rounded-3"
            );
            $("#greeting-container-2").attr("class", "container-fluid py-1");
            $("#greeting-message").text("");
            $("#greeting-heading").replaceWith(
              `<p class="col-md-5 fs-5" id="greeting-heading" style="font-weight: bold;">Welcome back! ${currentUserName}</p>`
            );

            //console.log(asslist);
            for (let i = 0; i < asslist.length; i++) {
              let assName = asslist[i].name;
              let assClass = asslist[i].class;
              let assDueDate = asslist[i].dueDate;
              let assLabelColor = asslist[i].labelColor;
              //console.log(assClass, assName, assDueDate, assLabelColor);

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
              //console.log(cardTemplate);
              $(".card-container").append(cardTemplate);
            }
          }
        })
        .catch(function (error) {
          console.log("Error inserting assignment card: " + error);
        });
    } else {
      // No user is signed in.
    }
  });
}
insertNameAndAssignments();

//Send the assignment information to firestore when users click 'save' button
var clikedColor = undefined;

function saveModalInfoToFirestore() {
  assignmentName = document.querySelector("#AssignmentInput");
  //console.log(assignmentName.value);
  assignmentClass = document.querySelector("#ClassInput");
  //console.log(assignmentClass.value);
  assignmentDuedate = document.querySelector("#DuedateInput");
  //console.log(assignmentDuedate.value);
  assignmentColor = clikedColor;
  //console.log(assignmentColor)

  assignmentMap = {
    class: assignmentClass.value,
    name: assignmentName.value,
    dueDate: assignmentDuedate.value,
    labelColor: assignmentColor,
  };
  console.log(assignmentMap);

  let userID = getCurrentUserUid();
  var userAssignment = db.collection("Assignments").doc(userID);
  userAssignment
    .update({
      count: firebase.firestore.FieldValue.increment(1),
      assList: firebase.firestore.FieldValue.arrayUnion(assignmentMap),
    })
    .then(function () {
      console.log("assignment count +1");
      console.log("assignment info added to firestore");
      alert(
        `Your assignment ${assignmentClass.value}, ${assignmentName.value} has been added!`
      );
      window.location.assign("main.html");
    })
    .catch(function (error) {
      console.log("Error increaing assignment count: " + error);
    });
}

function change_picked_color(pickedColor = "primary") {
  //console.log("Clicked!", pickedColor)
  clikedColor = pickedColor;
}

function change_picked_color(pickedColor = "primary") {
  //console.log("Clicked!", pickedColor)
  clikedColor = pickedColor;
}


clickedAssignmentIndex = undefined;
clickedAssignmentString = undefined;

function editModalContentAndFoundAss(assCs, assNm, assDd, assLc) {
  //console.log(assCs, assNm, assDd, assLc);
  $('button:contains(current)').text("");

  document.getElementById('edit_assignment_name_here').value = assNm;
  document.getElementById('edit_class_here').value = assCs;
  document.getElementById('edit_due_date_here').value = assDd;
  let currentColorID = "#edit_" + assLc;
  let buttonClass = $(currentColorID).attr('class');
  //console.log(buttonClass);
  $(currentColorID).text('current');

  clikedColor = assLc;

  //Search and get a index of current assignmnet in the assList in Firebase
  currentAss = {'class': assCs, 'name': assNm, 'dueDate': assDd, 'labelColor': assLc};
  console.log(currentAss);
  //console.log(typeof(currentAss));
  let userID = getCurrentUserUid();
  currentAssignment = db
        .collection("Assignments")
        .doc(userID)
        .get()
        .then(function (snap) {
          var asslist = snap.data().assList;
          currentAssignmentString = JSON.stringify(currentAss);
          var tempIndex = undefined;
          for (let i = 0; i < asslist.length; i++) {
            tempAssignmentString = `{"class":"${asslist[i].class}","name":"${asslist[i].name}","dueDate":"${asslist[i].dueDate}","labelColor":"${asslist[i].labelColor}"}`;
            //console.log(tempAssignmentString);
            if (tempAssignmentString == currentAssignmentString) {
              //console.log("Found!!");
              clickedAssignmentIndex = i;
              clickedAssignmentString = tempAssignmentString;
            }
          }
        })
        .then(function () {
          $('#edit_AssignmentModal').modal('show');
          //console.log(clickedAssignmentIndex);
          //console.log(clickedAssignmentString);
        });
}

function saveEditedInfoToFirestore() {
  assignmentName = document.querySelector("#edit_assignment_name_here");
  //console.log(assignmentName.value);
  assignmentClass = document.querySelector("#edit_class_here");
  //console.log(assignmentClass.value);
  assignmentDuedate = document.querySelector("#edit_due_date_here");
  //console.log(assignmentDuedate.value);
  assignmentColor = clikedColor;
  console.log(assignmentColor)

  let userID = getCurrentUserUid();
  var userAssignment = db.collection("Assignments").doc(userID).get().then(function (snap) {
    var asslist = snap.data().assList;
    asslist[clickedAssignmentIndex].class = assignmentClass.value;
    asslist[clickedAssignmentIndex].name = assignmentName.value;
    asslist[clickedAssignmentIndex].dueDate = assignmentDuedate.value;
    asslist[clickedAssignmentIndex].labelColor = assignmentColor;

    console.log(asslist[clickedAssignmentIndex].name);
    console.log("Updated!");
  })
    .then(function () {
      console.log("edited assignment info added to firestore");
      alert(
        `Your assignment has been edited!`
      );
      window.location.assign("main.html");
    })
    .catch(function (error) {
      console.log("Error editing assignment: " + error);
    });
}

function deleteAssignment() {
  if (confirm("Are you sure to delete it?") == false) {
    return;
  };
  
  let userID = getCurrentUserUid();
  var userAssignment = db.collection("Assignments").doc(userID);
  userAssignment.get().then(function (doc) {
    if (doc.exists) {
      userAssignment
        .update({
          count: firebase.firestore.FieldValue.increment(-1),
          assList: firebase.firestore.FieldValue.arrayRemove(
            doc.data().assList[clickedAssignmentIndex]
          )
        })
        .then(function () {
          console.log("assignment count -1");
          console.log("assignment data deleted from firestore");
          alert(`Your assignment has been deleted!`);
          window.location.assign("main.html");
        });
    }
  });
}

var modalSaveBtn = document.querySelector("#modal-save-button");
modalSaveBtn.addEventListener("click", saveModalInfoToFirestore);
var editModalSaveBtn = document.querySelector("#edit-modal-save-button");
editModalSaveBtn.addEventListener("click", saveEditedInfoToFirestore);