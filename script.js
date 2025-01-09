// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

document.addEventListener("DOMContentLoaded", function () {
    const usernameInput = document.getElementById("usernameInput");
    const addUsernameBtn = document.getElementById("addUsernameBtn");
    const userListUl = document.getElementById("userListUl");
    const usernameSelect = document.getElementById("usernameSelect");
    const confirmBtn = document.getElementById("confirmBtn");
    const hoursInput = document.getElementById("hoursInput");
    const minutesInput = document.getElementById("minutesInput");
    const manualExpInput = document.getElementById("manualExpInput");
    const addManualExpBtn = document.getElementById("addManualExpBtn");
    const removeSelectedBtn = document.getElementById("removeSelectedBtn");

    // Load user data from Firebase
    function loadUserData() {
        const userListRef = db.ref('userList');
        userListRef.once('value', function(snapshot) {
            const users = snapshot.val();
            if (users) {
                Object.keys(users).forEach(username => {
                    addUserToList(username, users[username].exp);
                });
            }
        });
    }

    // Add a new username to the list and dropdown
    function addUserToList(username, exp = 0) {
        // Add to the user list
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <input type="checkbox" class="user-checkbox">
            <span class="username-exp">${username} (${exp} EXP)</span>
        `;
        userListUl.appendChild(listItem);

        // Add to the dropdown
        const option = document.createElement("option");
        option.value = username;
        option.textContent = username;
        usernameSelect.appendChild(option);
    }

    // Save user data to Firebase
    function saveUserData(username, exp) {
        const userRef = db.ref('userList/' + username);
        userRef.set({
            exp: exp
        });
    }

    // Function to add a new username
    addUsernameBtn.addEventListener("click", function () {
        const username = usernameInput.value.trim();
        if (username === "") {
            alert("Username cannot be empty.");
            return;
        }

        // Add user to Firebase
        saveUserData(username, 0);  // Default EXP 0

        // Add to the list in the UI
        addUserToList(username);

        // Clear the input
        usernameInput.value = "";
    });

    // Function to confirm and add EXP
    confirmBtn.addEventListener("click", function () {
        const selectedUsername = usernameSelect.value;
        const hours = parseInt(hoursInput.value) || 0;
        const minutes = parseInt(minutesInput.value) || 0;

        if (!selectedUsername) {
            alert("Please select a username.");
            return;
        }

        if (hours === 0 && minutes === 0) {
            alert("Please enter hours or minutes.");
            return;
        }

        let totalExp = 0;

        // Calculate EXP based on hours and minutes
        if (hours > 0) {
            totalExp += hours * 2; // 1 hour = 2 EXP
            if (hours >= 10) {
                totalExp += Math.floor(hours / 10) * 5; // Extra 5 EXP for every 10 hours
            }
        }

        if (minutes >= 30 && minutes < 50) {
            totalExp += 1; // 30 minutes = 1 EXP
        } else if (minutes >= 50) {
            totalExp += 2; // 50+ minutes = 2 EXP
        }

        // Update EXP in Firebase
        const userRef = db.ref('userList/' + selectedUsername);
        userRef.once('value', function(snapshot) {
            const currentExp = snapshot.val().exp;
            const updatedExp = currentExp + totalExp;
            userRef.update({
                exp: updatedExp
            });
        });

        // Update the UI to reflect the change
        const listItems = document.querySelectorAll("#userListUl li");
        listItems.forEach((item) => {
            const usernameExpSpan = item.querySelector(".username-exp");
            if (usernameExpSpan.textContent.includes(selectedUsername)) {
                usernameExpSpan.textContent = `${selectedUsername} (${updatedExp} EXP)`;
            }
        });

        // Clear inputs
        hoursInput.value = "";
        minutesInput.value = "";
    });

    // Function to manually add EXP
    addManualExpBtn.addEventListener("click", function () {
        const selectedUsername = usernameSelect.value;
        const manualExp = parseInt(manualExpInput.value);

        if (!selectedUsername) {
            alert("Please select a username.");
            return;
        }

        if (isNaN(manualExp) || manualExp <= 0) {
            alert("Please enter a valid EXP value.");
            return;
        }

        // Update EXP in Firebase
        const userRef = db.ref('userList/' + selectedUsername);
        userRef.once('value', function(snapshot) {
            const currentExp = snapshot.val().exp;
            const updatedExp = currentExp + manualExp;
            userRef.update({
                exp: updatedExp
            });
        });

        // Update the UI to reflect the change
        const listItems = document.querySelectorAll("#userListUl li");
        listItems.forEach((item) => {
            const usernameExpSpan = item.querySelector(".username-exp");
            if (usernameExpSpan.textContent.includes(selectedUsername)) {
                usernameExpSpan.textContent = `${selectedUsername} (${updatedExp} EXP)`;
            }
        });

        // Clear input
        manualExpInput.value = "";
    });

    // Function to remove selected users
    removeSelectedBtn.addEventListener("click", function () {
        const checkboxes = document.querySelectorAll(".user-checkbox");
        checkboxes.forEach((checkbox) => {
            if (checkbox.checked) {
                const listItem = checkbox.parentElement;
                const usernameExpSpan = listItem.querySelector(".username-exp");
                const username = usernameExpSpan.textContent.split(" (")[0];

                // Remove from Firebase
                const userRef = db.ref('userList/' + username);
                userRef.remove();

                // Remove from dropdown
                const options = Array.from(usernameSelect.options);
                options.forEach((option) => {
                    if (option.value === username) {
                        option.remove();
                    }
                });

                // Remove from the list
                listItem.remove();
            }
        });
    });

    // Load user data from Firebase on page load
    loadUserData();
});
