var currentUserID = undefined;

    function insertName() {
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
              $("#name-goes-here").text(user_Name);                         //using jquery
            })
        } else {
          // No user is signed in.
        }
      });
    }
    insertName();

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

      var userAssignment = db.collection("Assignments").doc(currentUserID);
      userAssignment.update({
        count: firebase.firestore.FieldValue.increment(1)
      }).then(function () {
        console.log("assignment count +1");
      })
        .catch(function (error) {
          console.log("Error increaing assignment count: " + error);
        });

    userAssignment.collection(assignmentClass.value).doc(assignmentName.value).set({
      dueDate: assignmentDuedate.value,
      labelColor: assignmentColor      
    }).then(function() {
      console.log("Assignment information update successfully!");
      alert("Your assignment added");
      window.location.assign("main.html");
    })
      .catch(function (error) {
        console.log("Error updating assignment info: " + error);
      })
    };

    function change_picked_color(pickedColor = "blue") {
      //console.log("Clicked!", pickedColor)
      clikedColor = pickedColor;
    };

    modalSaveBtn.addEventListener('click', saveModalInfoToFirestore)