document.addEventListener("DOMContentLoaded", () => {
    // Get elements
    const profileBtn = document.getElementById("profile-next-btn");
    const nameInput = document.getElementById("profile-name");
    const diabetesCards = document.querySelectorAll(".diabetes-card");
    const diabetesTypeInput = document.getElementById("profile-diabetes-type");
    const otherContainer = document.getElementById("other-diabetes-container");
    const otherSelect = document.getElementById("profile-other-diabetes");
    const otherSpecify = document.getElementById("profile-other-specify");
    
    fetch("https://Dia_user.firebaseio.com/userProfiles.json", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            ip: "user's IP address" 
        })
    })
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.error(err));

    let selectedType = "";

    // ===== Diabetes card selection =====
    diabetesCards.forEach(card => {
        card.addEventListener("click", () => {
            // Remove selected class from all cards
            diabetesCards.forEach(c => c.classList.remove("selected"));
            
            // Add selected class to clicked card
            card.classList.add("selected");

            // Get the diabetes type
            selectedType = card.dataset.type;
            diabetesTypeInput.value = selectedType;

            // Show/hide other container
            if (selectedType === "other") {
                otherContainer.style.display = "block";
                otherSelect.value = "";
                otherSpecify.style.display = "none";
                otherSpecify.value = "";
            } else {
                otherContainer.style.display = "none";
                otherSelect.value = "";
                otherSpecify.style.display = "none";
                otherSpecify.value = "";
            }
        });
    });

    // ===== Other select change =====
    otherSelect.addEventListener("change", () => {
        if (otherSelect.value === "other-specify") {
            otherSpecify.style.display = "block";
            otherSpecify.focus();
        } else {
            otherSpecify.style.display = "none";
            otherSpecify.value = "";
        }
    });

    // ===== Complete profile =====
    profileBtn.addEventListener("click", (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        

        // Validate name
        if (name === "") {
            alert("Please enter your full name.");
            nameInput.focus();
            return;
        }

        // Validate diabetes type
        if (selectedType === "") {
            alert("Please select your diabetes type.");
            return;
        }

        // Get diabetes display name
        let diabetesDisplay = "";

        if (selectedType === "other") {
            if (otherSelect.value === "") {
                alert("Please select or specify your diabetes type.");
                otherSelect.focus();
                return;
            }

            if (otherSelect.value === "other-specify") {
                if (otherSpecify.value.trim() === "") {
                    alert("Please specify your diabetes type.");
                    otherSpecify.focus();
                    return;
                }
                diabetesDisplay = otherSpecify.value.trim();
            } else {
                diabetesDisplay = otherSelect.options[otherSelect.selectedIndex].text;
            }
        } else {
            const selectedCard = document.querySelector(`.diabetes-card[data-type="${selectedType}"]`);
            if (selectedCard) {
                diabetesDisplay = selectedCard.querySelector("h3").textContent;
            }
        }

        // Save profile data
        const userProfile = {
            name: name,
            diabetesType: diabetesDisplay,
            diabetesCode: selectedType,
        };

        localStorage.setItem("userProfile", JSON.stringify(userProfile));

        // Redirect to dashboard
        window.location.href = "dashboard.html";
    });

    // ===== Enter key support =====
    nameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && selectedType === "") {
            diabetesCards[0].click();
        }
    });
    
});

