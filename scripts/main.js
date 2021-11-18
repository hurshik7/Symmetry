  var currentUserID = undefined;
  var currentUserName = undefined;

    function insertNameAndAssignments() {
      firebase.auth().onAuthStateChanged(user => {
        // Check if user is signed in:
        if (user) {
          // Do something for the current logged-in user here:
          console.log(user.uid);
          currentUserID = user.uid;
          //go to the correct user document by referencing to the user uid
          currentUser = db.collection("users").doc(user.uid);
          //get the document for current user.
          currentUser.get()
            .then(userDoc => {
              var user_Name = userDoc.data().name;
              console.log(user_Name);
              //method #1:  insert with html only
              //document.getElementById("name-goes-here").innerText = n;    //using javascript
              //method #2:  insert using jquery
              currentUserName = user_Name;
              $("#name-goes-here").text(user_Name);                         //using jquery
            })

          currentAssignment = db.collection("Assignments").doc(user.uid).get()
            .then(function (snap) {
              var asslist = snap.data().assList;

              if (asslist.length != 0) {
                //console.log($('#greeting-container').value);
                $('#greeting-container').attr("class", "p-3 mb-2 bg-light rounded-3");
                $('#greeting-container-2').attr("class", "container-fluid py-1");
                $('#greeting-message').text("");
                $('#greeting-heading').replaceWith(`<p class="col-md-5 fs-5" id="greeting-heading" style="font-weight: bold;">Welcome back! ${currentUserName}</p>`)

                //console.log(asslist);
                for (let i = 0; i < asslist.length; i++) {
                  let assName = asslist[i].name;
                  let assClass = asslist[i].class;
                  let assDueDate = asslist[i].dueDate;
                  let assLabelColor = asslist[i].labelColor;
                //console.log(assClass, assName, assDueDate, assLabelColor);

                  var cardTemplate = `
                  <a id="${assClass + assName}" data-toggle="modal" data-target="#edit_AssignmentModal">
                  <div class="card text-white bg-${assLabelColor} mb-3" style="max-width: 23rem;">
                  <div class="card-header">${assClass}</div>
                  <div class="card-body">
                    <h5 class="card-title">${assName}</h5>
                    <p class="card-text">Due date: ${assDueDate}</p>
                  </div>
                  </div></a>`;
                  //console.log(cardTemplate);
                  $('.card-container').append(cardTemplate);
                }
              }
            })
            .catch(function (error) {
              console.log("Error inserting assignment card: " + error);
            })

        } else {
          // No user is signed in.
        }
      });
    }
    insertNameAndAssignments();


    //Send the assignment information to firestore when users click 'save' button
    var modalSaveBtn = document.querySelector('#modal-save-button');
    var clikedColor = undefined;

    function saveModalInfoToFirestore() {
      assignmentName = document.querySelector('#AssignmentInput');
      //console.log(assignmentName.value);
      assignmentClass = document.querySelector('#ClassInput');
      //console.log(assignmentClass.value);
      assignmentDuedate = document.querySelector("#DuedateInput");
      //console.log(assignmentDuedate.value);
      assignmentColor = clikedColor;
      //console.log(assignmentColor)

      assignmentMap = {"class": assignmentClass.value, "name": assignmentName.value, "dueDate": assignmentDuedate.value, "labelColor": assignmentColor};
      console.log(assignmentMap);

      var userAssignment = db.collection("Assignments").doc(currentUserID);
      userAssignment.update({
        count: firebase.firestore.FieldValue.increment(1),
        assList: firebase.firestore.FieldValue.arrayUnion(assignmentMap)
      }).then(function () {
        console.log("assignment count +1");
        console.log("assignment info added to firestore");
        alert(`Your assignment ${assignmentClass.value}, ${assignmentName.value} has been added!`);
        window.location.assign("main.html");
      })
        .catch(function (error) {
          console.log("Error increaing assignment count: " + error);
        });
    };


    function change_picked_color(pickedColor = "primary") {
      //console.log("Clicked!", pickedColor)
      clikedColor = pickedColor;
    };
    function delete_assignment() {
      var userAssignment = db.collection("Assignments").doc(currentUserID);
      userAssignment.get().then(function(doc) {
        if (doc.exists) {
            userAssignment.update({
              count: firebase.firestore.FieldValue.increment(-1),
              "assList": firebase.firestore.FieldValue.arrayRemove(doc.data().assList[0])
            }).then(function () {
              console.log("assignment count -1");
              console.log("assignment data deleted from firestore");
              alert(`Your assignment has been deleted!`);
              window.location.assign("main.html");
            });
        }
    })
}

    modalSaveBtn.addEventListener('click', saveModalInfoToFirestore);
